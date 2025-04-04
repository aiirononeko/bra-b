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
  redirectPath?: string;
  redirectTo?: string;
  message?: string;
  baseUrl?: string;
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
    console.error("マジックリンク送信中にエラーが発生しました:", error);
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
    console.error("Google認証中にエラーが発生しました:", error);
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

  try {
    // セッションコードを交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // flow_state_not_foundエラーが発生した場合、すでにコード交換されている可能性がある
      // セッションが確立しているか確認する
      if (error.code === "flow_state_not_found") {
        // 現在のセッションとユーザー情報を取得して確認
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            return {
              success: true,
              userId: userData.user.id,
              userMetadata: userData.user.user_metadata,
            };
          }
        }
      }

      return { success: false, error: error.message };
    }

    // コード交換に成功したら、改めてセッションと現在のユーザーを取得して確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!session || !user) {
      return { success: false, error: "認証後のセッション取得に失敗しました" };
    }

    return { success: true, userId: user.id, userMetadata: user.user_metadata };
  } catch (error) {
    console.error("セッションコードの交換エラー:", error);
    return { success: false, error: "セッションコードの交換中にエラーが発生しました" };
  }
}

/**
 * メールリンク認証を確認します
 */
export async function confirmAuth({
  tokenHash,
  code,
  type,
  anonymousId,
}: {
  tokenHash?: string;
  code?: string;
  type?: string;
  anonymousId: string | null;
}): Promise<AuthResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555";
  const supabase = await createClient();
  let success = false;
  let error: string | null = null;
  let redirectPath = "/";
  let message = "";

  try {
    // トークンまたはコードが存在するかチェック
    if ((!tokenHash && !code) || (code === "null" && tokenHash === "null")) {
      throw new Error("認証コードが欠落しています。リンクをもう一度試してください。");
    }

    // 現在のセッションをチェック
    const { data: existingSessionData } = await supabase.auth.getSession();
    if (existingSessionData.session) {
      success = true;
      redirectPath = "/account";

      // ユーザータイプがbaristaの場合、バリスタページへリダイレクト
      const user = existingSessionData.session.user;
      if (user && user.user_metadata?.user_type === "barista" && user.id) {
        redirectPath = `/barista/${user.id}`;
      }

      message = "既にログインしています。";
      return { success, error: "", redirectPath, message, baseUrl };
    }

    // 交換処理の結果を保持する変数
    type AuthData = {
      session: {
        user: {
          id: string;
          user_metadata?: Record<string, unknown>;
        };
      } | null;
    };

    let authResult: AuthData;

    if (code) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        throw exchangeError;
      }

      authResult = data as AuthData;
    } else {
      // 古い方式のトークンHash認証（現在はほとんど使われない）
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: type === "recovery" ? "recovery" : "email",
        token_hash: tokenHash as string,
      });

      if (verifyError) {
        throw verifyError;
      }

      // セッションを再取得
      const { data } = await supabase.auth.getSession();
      authResult = data as AuthData;
    }

    // セッションが取得できているか確認
    if (!authResult.session) {
      throw new Error("セッションの確立に失敗しました。もう一度ログインを試みてください。");
    }

    const userId = authResult.session.user.id;

    // もし匿名IDが提供されていれば匿名評価をマージ
    if (anonymousId) {
      try {
        const { error: mergeError } = await supabase
          .from("evaluations")
          .update({ user_id: userId })
          .eq("anonymous_id", anonymousId)
          .is("user_id", null);

        if (mergeError) {
          // ここではマージの失敗を致命的なエラーとしては扱わない
        }
      } catch (_) {
        // 例外は無視
      }
    }

    // リダイレクト先を決定
    redirectPath = "/account";
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (user && user.user_metadata?.user_type === "barista" && user.id) {
      redirectPath = `/barista/${user.id}`;
    }

    success = true;
    message = "認証に成功しました。ログインしました。";

    // クライアントの Cookie をリフレッシュするために明示的に保存
    await supabase.auth.refreshSession();
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : "認証処理中に不明なエラーが発生しました";
    redirectPath = "/login";
  }

  return { success, error: error || "", redirectPath, message, baseUrl };
}

/**
 * メールアドレス形式の検証
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * メールアドレスでの新規登録
 */
export async function signUpWithEmail(
  email: string,
  displayName: string,
  userType: "customer" | "barista" = "customer",
  shopName?: string
) {
  try {
    // メールアドレスのバリデーション
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "メールアドレスの形式が正しくありません",
      };
    }

    // 表示名のバリデーション
    if (!displayName || displayName.length < 2) {
      return {
        success: false,
        error: "表示名は2文字以上入力してください",
      };
    }

    // バリスタの場合は店舗名のバリデーション
    if (userType === "barista" && (!shopName || shopName.length < 2)) {
      return {
        success: false,
        error: "店舗名は2文字以上入力してください",
      };
    }

    // メタデータを準備（トリガー関数で使用される）
    const metadata: Record<string, string> = {
      user_type: userType,
      display_name: displayName,
    };

    // バリスタの場合は店舗名も追加
    if (userType === "barista" && shopName) {
      metadata.shop_name = shopName;
    }

    // サインアップ（メールリンク認証）
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`,
        data: metadata, // ユーザーメタデータを設定
      },
    });

    if (error) {
      console.error("サインアップエラー:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "認証メールを送信しました。メールボックスを確認してください。",
    };
  } catch (error) {
    console.error("サインアップ処理エラー:", error);
    return {
      success: false,
      error: "アカウント登録処理中にエラーが発生しました",
    };
  }
}
