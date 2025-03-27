import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 次のレスポンスを作成
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabaseクライアントを作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  try {
    // セッションの確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ユーザー認証が必要なパスの場合
    if (request.nextUrl.pathname.startsWith("/account")) {
      if (!session) {
        // 未認証の場合、ログインページにリダイレクト
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }

    // バリスタ専用ページの場合
    if (request.nextUrl.pathname.startsWith("/barista-dashboard")) {
      if (!session) {
        // 未認証の場合、ログインページにリダイレクト
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // プロフィール情報を取得
        const { data: profile } = await supabase
          .from("profiles")
          .select("type")
          .eq("user_id", user.id)
          .single();

        // バリスタ以外はアクセス不可
        if (!profile || profile.type !== "barista") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

    return response;
  } catch (_e) {
    // エラーが発生した場合は通常の応答を返す
    return NextResponse.next();
  }
}

// 以下のパスに対してミドルウェアを適用する
export const config = {
  matcher: [
    /*
     * 以下のパスはミドルウェアから除外する:
     * - '_next' (Next.jsのシステムファイル)
     * - 'api' (APIルート)
     * - 'static' (静的ファイル)
     * - 'favicon.ico' (ファビコン)
     */
    "/((?!_next|api|static|favicon.ico).*)",
  ],
};
