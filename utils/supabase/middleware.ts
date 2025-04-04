import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// デバッグ関数
function logDebug(message: string, data?: any) {
  console.log(`[MIDDLEWARE_DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}

export async function updateSession(request: NextRequest) {
  // 新しいレスポンスオブジェクトを作成
  const response = NextResponse.next();

  try {
    // より詳細なcookies設定
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
        auth: {
          // 自動リフレッシュを有効化
          autoRefreshToken: true,
          // クライアントが実行されるたびに常にセッションをリフレッシュ
          persistSession: true,
          // すべてのデバイスでセッションを保持
          detectSessionInUrl: true,
        },
      }
    );

    // 認証トークンのリフレッシュ
    await supabase.auth.getSession();

    return response;
  } catch (error) {
    console.error("updateSession エラー:", error);
    return response;
  }
}

export async function createClient(request: NextRequest) {
  // URLを記録
  const url = request.nextUrl.clone();
  logDebug(`ミドルウェア処理: ${url.pathname}`, {
    searchParams: Object.fromEntries(url.searchParams.entries()),
    host: url.host,
    origin: url.origin,
  });

  // レスポンスオブジェクトを初期化
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Supabaseクライアントを作成
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          get(name: string) {
            const value = request.cookies.get(name)?.value;
            logDebug(`Cookie get: ${name}`, { value: value ? "存在" : "なし" });
            return value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Cookieを設定
            logDebug(`Cookie set: ${name}`, { options });
            response.cookies.set({
              name,
              value,
              ...options,
              // セキュリティ設定
              secure: true,
              httpOnly: true,
              sameSite: "lax",
              path: "/",
            });
          },
          remove(name: string, options: CookieOptions) {
            // Cookieを削除
            logDebug(`Cookie remove: ${name}`);
            response.cookies.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

    // セッションを取得して状態をログに記録
    const { data } = await supabase.auth.getSession();
    logDebug("セッション状態", {
      hasSession: !!data.session,
      userId: data.session?.user?.id,
      userEmail: data.session?.user?.email,
    });

    return { supabase, response };
  } catch (error) {
    logDebug("Supabaseクライアント作成エラー", { error });
    return { supabase: null, response };
  }
}
