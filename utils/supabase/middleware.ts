import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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
  // レスポンスオブジェクトを初期化
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabaseクライアントを作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cookieを設定
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

  return { supabase, response };
}
