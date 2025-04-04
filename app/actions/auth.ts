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

// デバッグ関数
function logDebug(message: string, data?: any) {
  console.log(`[AUTH_DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}

// 共通の関数でURLを生成
function getBaseURL() {
  const url =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000";

  // httpから始まらない場合はhttpsを追加
  const baseUrl = url.startsWith("http") ? url : `https://${url}`;

  logDebug(`Base URL: ${baseUrl}`);
  // 環境変数をログに出力
  logDebug(`ENV Variables:`, {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  return baseUrl;
}

/**
 * マジックリンクでのサインイン/サインアップ
 */
export async function signInWithMagicLink(formData: {
  email: string;
  userType?: "barista" | "customer";
  displayName?: string;
}): Promise<AuthResult> {
  logDebug("signInWithMagicLink開始", formData);
  const supabase = await createClient();
  const { email, userType = "customer", displayName } = formData;

  // 匿名IDをCookieから取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;

  // 環境変数を確認
  const baseUrl = getBaseURL();

  try {
    // リダイレクト先の設定
    const redirectPath = userType === "barista" ? "/barista" : "/";
    const redirectUrl = `${baseUrl}/auth/confirm?next=${redirectPath}`;

    logDebug(`リダイレクトURL: ${redirectUrl}`);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
          display_name: displayName || email.split("@")[0],
          anonymous_id: anonymousId,
        },
      },
    });

    if (error) {
      logDebug("マジックリンクエラー", { error: error.message });
      return { success: false, error: error.message };
    }

    logDebug("マジックリンク送信成功");
    return {
      success: true,
      redirectTo: "/login?message=マジックリンクをメールで送信しました。メールをご確認ください。",
    };
  } catch (error) {
    logDebug("マジックリンク例外", { error });
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555";

  try {
    // リダイレクト先の設定
    const redirectPath = userType === "barista" ? "/barista" : "/";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/auth/confirm?next=${redirectPath}`,
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
  // パラメータをログ
  logDebug("confirmAuth開始", {
    tokenHash: tokenHash ? "存在" : "なし",
    code: code ? "存在" : "なし",
    type,
    anonymousId: anonymousId ? "存在" : "なし",
  });

  // 環境変数を確認
  const baseUrl = getBaseURL();

  const supabase = await createClient();
  let success = false;
  let error: string | null = null;
  let redirectPath = "/";
  let message = "";

  try {
    // トークンまたはコードが存在するかチェック
    if ((!tokenHash && !code) || (code === "null" && tokenHash === "null")) {
      logDebug("認証コード欠落");
      throw new Error("認証コードが欠落しています。リンクをもう一度試してください。");
    }

    // 現在のセッションをチェック
    const { data: existingSessionData } = await supabase.auth.getSession();
    logDebug("既存セッション確認", {
      hasSession: !!existingSessionData.session,
      userId: existingSessionData.session?.user?.id,
      expires: existingSessionData.session?.expires_at,
      cookiesExist: !!(await cookies()).getAll().length,
    });

    if (existingSessionData.session) {
      success = true;
      redirectPath = "/account";

      // ユーザータイプがbaristaの場合、バリスタページへリダイレクト
      const user = existingSessionData.session.user;
      if (user && user.user_metadata?.user_type === "barista" && user.id) {
        redirectPath = `/barista/${user.id}`;
      }

      message = "既にログインしています。";
      logDebug("既存セッションあり、リダイレクト", { redirectPath });
      return { success, error: "", redirectPath, message, baseUrl };
    }

    // 交換処理の結果を保持する変数
    type AuthData = {
      session: {
        user: {
          id: string;
          user_metadata?: Record<string, unknown>;
        };
        access_token: string;
        refresh_token: string;
        expires_at: number;
      } | null;
    };

    let authResult: AuthData;

    if (code) {
      logDebug("コード交換開始", { code: code.substring(0, 5) + "..." });

      try {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          logDebug("コード交換エラー", {
            error: exchangeError.message,
            code: exchangeError.code,
            status: exchangeError.status,
          });
          throw exchangeError;
        }

        logDebug("コード交換成功", {
          hasSession: !!data.session,
          accessToken: data.session?.access_token ? "存在" : "なし",
          refreshToken: data.session?.refresh_token ? "存在" : "なし",
          expiresAt: data.session?.expires_at,
        });

        authResult = data as AuthData;
      } catch (e) {
        logDebug("コード交換例外", { error: e instanceof Error ? e.message : String(e) });
        throw e;
      }
    } else {
      // 古い方式のトークンHash認証（現在はほとんど使われない）
      logDebug("トークンHash認証開始");
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: type === "recovery" ? "recovery" : "email",
        token_hash: tokenHash as string,
      });

      if (verifyError) {
        logDebug("トークン検証エラー", { error: verifyError.message });
        throw verifyError;
      }

      // セッションを再取得
      const { data } = await supabase.auth.getSession();
      logDebug("トークン検証後セッション取得", {
        hasSession: !!data.session,
        accessToken: data.session?.access_token ? "存在" : "なし",
        userId: data.session?.user?.id,
      });
      authResult = data as AuthData;
    }

    // セッションが取得できているか確認
    if (!authResult.session) {
      logDebug("セッション確立失敗", {
        authResultKeys: Object.keys(authResult),
        cookiesExist: !!(await cookies()).getAll().length,
      });
      throw new Error("セッションの確立に失敗しました。もう一度ログインを試みてください。");
    }

    const userId = authResult.session.user.id;
    logDebug("認証成功", {
      userId,
      accessToken: authResult.session.access_token ? "存在" : "なし",
      expiresAt: authResult.session.expires_at,
      metadata: authResult.session.user.user_metadata,
    });

    // もし匿名IDが提供されていれば匿名評価をマージ
    if (anonymousId) {
      try {
        logDebug("匿名評価マージ開始", { anonymousId });
        const { error: mergeError } = await supabase
          .from("evaluations")
          .update({ user_id: userId })
          .eq("anonymous_id", anonymousId)
          .is("user_id", null);

        if (mergeError) {
          logDebug("匿名評価マージエラー", { error: mergeError.message });
          // ここではマージの失敗を致命的なエラーとしては扱わない
        } else {
          logDebug("匿名評価マージ成功");
        }
      } catch (_) {
        // 例外は無視
      }
    }

    // リダイレクト先を決定
    redirectPath = "/account";
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    logDebug("ユーザー情報取得", {
      hasUser: !!user,
      userType: user?.user_metadata?.user_type,
      userId: user?.id,
      email: user?.email,
    });

    if (user && user.user_metadata?.user_type === "barista" && user.id) {
      redirectPath = `/barista/${user.id}`;
    }

    success = true;
    message = "認証に成功しました。ログインしました。";
    logDebug("リダイレクト先決定", { redirectPath });

    // クライアントの Cookie をリフレッシュするために明示的に保存
    logDebug("セッションリフレッシュ開始");
    try {
      const refreshResult = await supabase.auth.refreshSession();

      // 現在のCookieの状態を確認
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();

      logDebug("セッションリフレッシュ結果", {
        success: !!refreshResult.data.session,
        userId: refreshResult.data.session?.user?.id,
        cookieCount: allCookies.length,
        cookieNames: allCookies.map((c) => c.name),
      });

      // セッションが確立されたか再確認
      const { data: finalSessionCheck } = await supabase.auth.getSession();
      logDebug("最終セッション確認", {
        hasSession: !!finalSessionCheck.session,
        userId: finalSessionCheck.session?.user?.id,
        expiresAt: finalSessionCheck.session?.expires_at,
      });
    } catch (refreshError) {
      logDebug("セッションリフレッシュエラー", {
        error: refreshError instanceof Error ? refreshError.message : String(refreshError),
      });
      // リフレッシュエラーは致命的ではない
    }
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : "認証処理中に不明なエラーが発生しました";
    redirectPath = "/login";
    logDebug("認証エラー", { error });
  }

  logDebug("confirmAuth完了", { success, redirectPath });
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555";

    // サインアップ（メールリンク認証）
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm`,
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
