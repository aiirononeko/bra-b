"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555"}/auth/confirm?next=${redirectPath}`,
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
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555"}/auth/confirm?next=${redirectPath}`,
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
    type: type as EmailOtpType,
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

/**
 * ユーザープロフィールの確認と作成
 */
async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  userMetadata?: Record<string, any>
) {
  // プロフィールが既に存在するか確認
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  // プロフィールが存在しない場合のみ作成
  if (!existingProfile) {
    const userType = userMetadata?.user_type || "customer";
    const displayName = userMetadata?.display_name || userMetadata?.name || userId.substring(0, 8);

    // プロフィールを作成
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      type: userType,
      display_name: displayName,
      icon_url: userMetadata?.avatar_url || "",
      bio: "",
      shop_name: userType === "barista" ? userMetadata?.shop_name || "カフェ" : null,
    });

    if (profileError) {
      console.error("プロフィール作成エラー:", profileError);
      return false;
    }

    console.log(`新しいプロフィールを作成しました: ${userId}, タイプ: ${userType}`);
    return true;
  }

  return true;
}

/**
 * 認証確認処理
 * auth/confirm/route.tsから移行したロジック
 */
export async function confirmAuth(params: {
  tokenHash?: string | null;
  code?: string | null;
  type?: string | null;
  anonymousId?: string | null;
}) {
  const { tokenHash, code, type = "email", anonymousId } = params;
  let verifyResult = { success: false, error: null as string | null };

  try {
    // token_hashがある場合はその検証を試みる
    if (tokenHash && type) {
      const result = await verifyOtp(type, tokenHash);
      verifyResult = { success: result.success, error: result.error || null };
    }
    // codeがある場合はセッションの検証を試みる
    else if (code) {
      const result = await exchangeCodeForSession(code);
      verifyResult = { success: result.success, error: result.error || null };
    } else {
      console.error("No valid verification parameters found");
      verifyResult.error = "有効な認証パラメータが見つかりません";
    }
  } catch (error) {
    console.error("Error during verification:", error);
    verifyResult.error = "認証処理中にエラーが発生しました";
  }

  // 検証が成功した場合
  if (verifyResult.success) {
    // ユーザー情報を取得
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // プロフィールの存在確認・作成
      await ensureUserProfile(supabase, user.id, user.user_metadata);

      // 匿名データの移行（もし匿名IDがあれば）
      if (anonymousId) {
        try {
          const { data: migrateResult } = await supabase.functions.invoke(
            "migrate-anonymous-data",
            {
              body: { anonymous_id: anonymousId, user_id: user.id },
            }
          );
          console.log("匿名データ移行結果:", migrateResult);
        } catch (error) {
          console.error("匿名データ移行エラー:", error);
        }
      }
    }

    // リダイレクト先を決定
    let redirectPath = "/account";

    // ユーザータイプがバリスタの場合はバリスタページへ
    if (user?.user_metadata?.user_type === "barista" && user.id) {
      redirectPath = `/barista/${user.id}`;
    }

    // 処理成功情報を含めて返却
    return {
      success: true,
      redirectPath,
      message: "認証に成功しました。ログインしました。",
    };
  }

  // 認証失敗
  return {
    success: false,
    redirectPath: "/error",
    error: verifyResult.error || "認証に失敗しました",
  };
}
