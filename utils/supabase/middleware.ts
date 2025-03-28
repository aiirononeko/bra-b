import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // 新しいレスポンスオブジェクトを作成
  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll: () => {
            return request.cookies.getAll();
          },
          setAll: (cookies) => {
            for (const cookie of cookies) {
              response.cookies.set(cookie);
            }
          },
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
