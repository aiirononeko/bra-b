import { createClient } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Supabaseクライアントの作成
    const { supabase, response } = await createClient(request);

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // next/data のリクエスト、またはTrpcリクエストの場合は何もせずにパス
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/api/trpc") ||
      request.nextUrl.pathname.startsWith("/api/healthz")
    ) {
      return response;
    }

    // 認証処理ページへのアクセスは常に許可
    if (
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup"
    ) {
      return response;
    }

    // 公開ルート（認証不要）へのアクセスを許可
    const publicRoutes = [
      "/",
      "/api/webhooks",
      "/api/uploadthing",
      "/customer",
      "/customer/search",
      "/customer/barista",
      "/customer/shop",
      "/customer/evaluation",
    ];

    // パスの先頭部分が公開ルートに一致するか
    const isPublicRoute = publicRoutes.some((route) => {
      if (route === "/") {
        return request.nextUrl.pathname === "/";
      }
      // 完全一致または "/" で始まるパスかどうか
      return request.nextUrl.pathname.startsWith(`${route}/`) || request.nextUrl.pathname === route;
    });

    if (isPublicRoute) {
      return response;
    }

    // `/account` と `/barista/[id]` アクセスには認証が必要
    if (
      request.nextUrl.pathname.startsWith("/account") ||
      request.nextUrl.pathname.startsWith("/barista")
    ) {
      if (!session) {
        // 未認証の場合はログインページにリダイレクト
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // バリスタページのアクセス制御（特定のバリスタユーザーのみアクセス可能）
      if (request.nextUrl.pathname.startsWith("/barista/")) {
        const requestedBaristaId = request.nextUrl.pathname.split("/")[2];
        const currentUserId = session.user?.id;
        const userType = session.user?.user_metadata?.user_type;

        // リクエストされたバリスタIDが現在のユーザーIDと一致しない、かつユーザータイプがバリスタでない場合
        if (
          requestedBaristaId !== currentUserId &&
          userType !== "barista" &&
          !isAdmin(session.user?.email)
        ) {
          // アクセス拒否
          return NextResponse.redirect(new URL("/account", request.url));
        }
      }
    }

    // 管理者ルートのアクセス制御
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // 管理者でない場合はアクセス拒否
      if (!isAdmin(session.user?.email)) {
        return NextResponse.redirect(new URL("/account", request.url));
      }
    }

    return response;
  } catch (e) {
    console.error("middleware エラー:", e);
    // エラーが発生した場合、リクエストを続行
    return NextResponse.next();
  }
}

// 管理者判定
function isAdmin(email?: string): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  return adminEmails.includes(email);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/images (public image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/images).*)",
  ],
};
