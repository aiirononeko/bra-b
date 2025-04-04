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
    protocol: url.protocol,
    allHeaders: Object.fromEntries(request.headers.entries()),
  });

  // 全クッキーをログに記録
  const allCookies = request.cookies.getAll();
  logDebug("全Cookieリスト", {
    count: allCookies.length,
    names: allCookies.map((c) => c.name),
    authCookies: allCookies.filter((c) => c.name.includes("auth")).map((c) => c.name),
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
            logDebug(`Cookie get: ${name}`, {
              exists: !!value,
              valueLength: value ? value.length : 0,
              valueStart: value ? value.substring(0, 10) + "..." : "なし",
            });
            return value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Cookieを設定
            const fullOptions = {
              ...options,
              // セキュリティ設定
              secure: true,
              httpOnly: true,
              sameSite: "lax",
              path: "/",
            };

            logDebug(`Cookie set: ${name}`, {
              valueLength: value ? value.length : 0,
              valueStart: value ? value.substring(0, 10) + "..." : "なし",
              options: fullOptions,
              domain: fullOptions.domain || "ドメイン指定なし",
              cookieHost: request.headers.get("host"),
            });

            response.cookies.set({
              name,
              value,
              ...fullOptions,
            });
          },
          remove(name: string, options: CookieOptions) {
            // Cookieを削除
            logDebug(`Cookie remove: ${name}`, { options });
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
    try {
      const { data } = await supabase.auth.getSession();
      logDebug("セッション状態", {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
        userEmail: data.session?.user?.email,
        accessToken: data.session?.access_token ? "存在" : "なし",
        refreshToken: data.session?.refresh_token ? "存在" : "なし",
        expiresAt: data.session?.expires_at,
      });

      // 設定されたCookieをチェック
      const responseCookies = response.cookies.getAll();
      logDebug("レスポンスCookie", {
        count: responseCookies.length,
        names: responseCookies.map((c) => c.name),
        options: responseCookies.map((c) => ({
          name: c.name,
          options: { domain: c.domain, path: c.path, sameSite: c.sameSite },
        })),
      });

      return { supabase, response };
    } catch (sessionError) {
      logDebug("セッション取得エラー", { error: sessionError });
      return { supabase, response };
    }
  } catch (error) {
    logDebug("Supabaseクライアント作成エラー", { error });
    return { supabase: null, response };
  }
}
