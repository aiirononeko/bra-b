import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// @supabase/ssr v0.6.1との互換性のため、cookies()にawaitキーワードを使用しています
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_) {
            // cookieStore.setがエラーを投げる場合の対応
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch (_) {
            // cookieStore.setがエラーを投げる場合の対応
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    }
  );
}
