"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { migrateAnonymousFavorites } from "@/app/repositories/favorites-repository";
import { createClient } from "@/utils/supabase/server";

/**
 * 認証結果の型
 */
type AuthResult = {
  success: boolean;
  error?: string;
  userId?: string;
  redirectTo?: string;
};

/**
 * マジックリンクでのサインイン/サインアップ
 */
export async function signInWithMagicLink(formData: {
  email: string;
  userType?: "barista" | "customer";
  displayName?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { email, userType = "customer", displayName } = formData;

  // 匿名IDをCookieから取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;

  try {
    // リダイレクト先の設定
    const redirectPath = userType === "barista" ? "/barista" : "/";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/confirm?next=${redirectPath}`,
        data: {
          user_type: userType,
          display_name: displayName || email.split("@")[0],
          anonymous_id: anonymousId,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      redirectTo: "/login?message=マジックリンクをメールで送信しました。メールをご確認ください。",
    };
  } catch (error) {
    console.error("マジックリンク認証エラー:", error);
    return { success: false, error: "マジックリンク送信中にエラーが発生しました" };
  }
}

/**
 * Google認証でのサインイン/サインアップ
 */
export async function signInWithGoogle(formData: {
  userType?: "barista" | "customer";
  displayName?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { userType = "customer", displayName = "User" } = formData;

  // 匿名IDをCookieから取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;

  try {
    // リダイレクト先の設定
    const redirectPath = userType === "barista" ? "/barista" : "/";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/confirm?next=${redirectPath}`,
        queryParams: {
          user_type: userType,
          display_name: displayName,
          anonymous_id: anonymousId || "",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // OAuth認証はリダイレクトのためリダイレクトURLがあれば成功
    if (data?.url) {
      redirect(data.url);
    }

    return { success: false, error: "リダイレクトURLが取得できませんでした" };
  } catch (error) {
    console.error("Google認証エラー:", error);
    return { success: false, error: "Google認証中にエラーが発生しました" };
  }
}

/**
 * サインアウト処理
 */
export async function signOut() {
  const supabase = await createClient();

  try {
    // ユーザーのログイン状態を確認
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // サインアウト処理
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("サインアウトエラー:", error);
      }
    }

    // キャッシュを更新してセッションが反映されるようにする
    revalidatePath("/", "layout");

    // ログインページにリダイレクト
    redirect("/login");
  } catch (error) {
    console.error("サインアウトエラー:", error);
    // エラーがあってもログインページにリダイレクト
    redirect("/login");
  }
}

/**
 * 現在のユーザーを取得
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * ユーザーセッションを取得
 */
export async function getUserSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 匿名ユーザーデータの引き継ぎ
 */
export async function migrateAnonymousUserData(anonymousId: string, userId: string) {
  try {
    // お気に入りデータの引き継ぎ
    await migrateAnonymousFavorites(userId, anonymousId);
    return { success: true };
  } catch (error) {
    console.error("匿名データの引き継ぎエラー:", error);
    return { success: false, error: "匿名データの引き継ぎに失敗しました" };
  }
}

/**
 * OTPの検証
 */
export async function verifyOtp(type: string, token_hash: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash,
  });

  return { success: !error, error: error?.message };
}

/**
 * セッションコードの交換
 */
export async function exchangeCodeForSession(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return { success: !error, error: error?.message };
}
