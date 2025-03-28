import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function middleware(request: NextRequest) {
  try {
    // セッション更新のためのレスポンスを取得
    // updateSession内でレスポンスが生成され、Cookieが設定される
    const response = await updateSession(request);

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

    // セッションの確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 決済関連のパスを識別
    const isPaymentPath = request.nextUrl.pathname.startsWith("/payment");

    // アカウント管理パスを識別
    const isAccountPath = request.nextUrl.pathname.startsWith("/account");

    // バリスタ専用ページを識別
    const isBaristaPath = request.nextUrl.pathname.startsWith("/barista-dashboard");

    // 認証が必要なパスで未ログイン時の処理
    if ((isAccountPath || isBaristaPath || isPaymentPath) && !session) {
      if (isPaymentPath) {
        // 決済ページでは匿名ログインを許可せず、通常のログインに誘導
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (isAccountPath || isBaristaPath) {
        // アカウント管理やバリスタページは登録ユーザーのみアクセス可能
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }

    // バリスタ権限チェック
    if (isBaristaPath && session) {
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

    // 匿名ユーザー処理（認証情報なしかつ決済・アカウント・バリスタページ以外）
    if (!session && !isPaymentPath && !isAccountPath && !isBaristaPath) {
      // 匿名ユーザー用のCookieがあるか確認
      const anonymousId = request.cookies.get("anonymous_id")?.value;

      if (anonymousId) {
      } else {
        try {
          // 新しい匿名IDをUUID形式で生成してCookieに保存
          const newAnonymousId = uuidv4();
          response.cookies.set({
            name: "anonymous_id",
            value: newAnonymousId,
            // 適切な有効期限を設定（例：30日）
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            // Cookie属性の追加
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          // 匿名プロファイルをデータベースに作成
          await createAnonymousProfile(supabase, newAnonymousId);
        } catch (error) {
          console.error("匿名ID生成エラー:", error);
        }
      }
    }

    return response;
  } catch (error) {
    // エラーが発生した場合はログ出力して通常の応答を返す
    console.error("ミドルウェアエラー:", error);
    return NextResponse.next();
  }
}

// 匿名プロファイルを作成する関数
async function createAnonymousProfile(supabase: any, anonymousId: string) {
  try {
    // 既存プロファイルの確認（冪等性を確保）
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", anonymousId)
      .maybeSingle();

    if (existingProfile) {
      return;
    }

    // プロフィールテーブルに匿名ユーザー情報を作成
    const { error } = await supabase.from("profiles").insert({
      id: anonymousId,
      anonymous_id: anonymousId, // 匿名ID用フィールドにも値を設定
      user_id: null, // 実際のユーザーIDはない
      type: "anonymous",
      display_name: `匿名ユーザー_${anonymousId.substring(0, 8)}`,
      icon_url: "", // デフォルトアイコンのURLを設定可能
      bio: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("匿名プロファイル作成エラー:", error);
      throw error;
    }
  } catch (error) {
    console.error("匿名プロファイル作成処理エラー:", error);
  }
}

// 以下のパスに対してミドルウェアを適用する
export const config = {
  matcher: [
    // すべてのパスに適用（一部特殊なパスのみ除外）
    "/((?!_next|favicon.ico|static).*)",
  ],
};
