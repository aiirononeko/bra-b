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

  try {
    // セッションコードを交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("セッションコード交換エラー:", error);
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
      console.error("セッションコード交換後のセッション/ユーザー取得失敗");
      return { success: false, error: "認証後のセッション取得に失敗しました" };
    }

    console.log("セッションコード交換成功: ユーザーID=", user.id);

    // キャッシュ更新はconfirmAuth関数内で行うため、ここでは行わない

    return { success: true, userId: user.id, userMetadata: user.user_metadata };
  } catch (error) {
    console.error("セッションコード交換エラー(例外):", error);
    return { success: false, error: "セッションコードの交換中にエラーが発生しました" };
  }
}

/**
 * ユーザープロフィールの確認と作成（トリガーのフォールバック）
 */
async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  userMetadata?: Record<string, any>
) {
  try {
    console.log(`プロファイル確認開始: userId=${userId}`);

    // プロフィールが既に存在するか確認
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    // エラーログ（NotFoundは除く）
    if (checkError && checkError.code !== "PGRST116") {
      console.error("プロフィール確認エラー:", checkError);
    }

    // プロフィールが存在しない場合のみ作成
    if (!existingProfile) {
      console.log("トリガーで作成されていないプロフィールを手動作成します");

      const userType = userMetadata?.user_type || "customer";
      let displayName = userMetadata?.display_name || userMetadata?.name;

      // displayNameが取得できない場合は、ユーザーIDか空の値を使用
      if (!displayName) {
        // ユーザーのメールアドレスを取得
        const { data: userData, error: userError } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", userId)
          .single();

        if (!userError && userData?.email) {
          displayName = userData.email.split("@")[0];
        } else {
          displayName = userId.substring(0, 8);
        }
      }

      // より詳細なプロフィールデータを準備
      const profileData = {
        user_id: userId,
        type: userType,
        display_name: displayName,
        icon_url: userMetadata?.avatar_url || "",
        bio: "",
        shop_name: userType === "barista" ? userMetadata?.shop_name || "カフェ" : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // トリガーから5秒経過してもプロファイルが作成されていない場合は手動で作成
      const { error } = await supabase.from("profiles").insert(profileData);

      if (error) {
        // プロファイルが既に存在する場合（競合状態）は成功とみなす
        if (error.code === "23505") {
          // 一意制約違反のエラーコード
          console.log(`プロファイルは既に存在しています（競合）: ${userId}`);
          return true;
        }

        console.error("手動プロフィール作成エラー:", error);

        // 再度試行（SQL実行エラーの場合）
        if (error.code !== "23505") {
          console.log("プロファイル作成を再試行します...");
          const retryResult = await supabase.from("profiles").insert(profileData);
          if (retryResult.error) {
            console.error("プロファイル作成再試行エラー:", retryResult.error);
            return false;
          }
        }
      }

      console.log(`新しいプロフィールを手動作成しました: ${userId}, タイプ: ${userType}`);
      return true;
    }

    console.log(`既存のプロフィールが見つかりました: ${userId}`);
    return true;
  } catch (error) {
    console.error("プロフィール作成/確認中の例外:", error);
    return false;
  }
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
  let verifyResult = {
    success: false,
    error: null as string | null,
    userId: null as string | null,
    userMetadata: null as any,
  };

  // デバッグログ - 受け取ったパラメータを表示
  console.log("認証パラメータ:", {
    tokenHash: tokenHash ? "存在" : "なし",
    code: code ? "存在" : "なし",
    type,
    anonymousId: anonymousId ? "存在" : "なし",
  });

  try {
    // token_hashがある場合はその検証を試みる
    if (tokenHash && type) {
      console.log(`OTP検証を実行: type=${type}`);
      const result = await verifyOtp(type, tokenHash);
      verifyResult = {
        success: result.success,
        error: result.error || null,
        userId: null,
        userMetadata: null,
      };
      console.log(`OTP検証結果: success=${result.success}, error=${result.error || "なし"}`);
    }
    // codeがある場合はセッションの検証を試みる
    else if (code) {
      console.log(`セッションコード検証を実行: code=${code.substring(0, 8)}...`);
      const result = await exchangeCodeForSession(code);
      verifyResult = {
        success: result.success,
        error: result.error || null,
        userId: result.userId || null,
        userMetadata: result.userMetadata || null,
      };
      console.log(
        `セッションコード検証結果: success=${result.success}, error=${result.error || "なし"}`
      );
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

    // ユーザーIDが得られなかった場合は再取得
    let userId = verifyResult.userId;
    let userMetadata = verifyResult.userMetadata;

    if (!userId) {
      // 認証が成功したら改めてセッションを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("セッションが取得できませんでした");
        return {
          success: false,
          redirectPath: "/login",
          error: "セッションの取得に失敗しました。もう一度ログインしてください。",
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
        };
      }

      console.log(
        "セッション取得成功:",
        session.access_token ? "アクセストークンあり" : "アクセストークンなし"
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("認証成功: ユーザー情報", user ? `ID: ${user.id}` : "ユーザー情報なし");

      if (!user) {
        console.error("ユーザー情報が取得できませんでした");
        return {
          success: false,
          redirectPath: "/login",
          error: "ユーザー情報の取得に失敗しました。もう一度ログインしてください。",
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
        };
      }

      userId = user.id;
      userMetadata = user.user_metadata;
    }

    // プロフィールの存在確認・作成（確実に作成するため、遅延して2回試行する）
    console.log("プロファイル確認開始...");
    const profileResult = await ensureUserProfile(supabase, userId, userMetadata);

    if (!profileResult) {
      console.log("最初のプロファイル作成が失敗しました。1秒後に再試行します...");
      // 少し待ってから再試行（トリガーが遅延実行される可能性を考慮）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 2回目の試行
      await ensureUserProfile(supabase, userId, userMetadata);
    }

    console.log("プロフィール確認完了");

    // 匿名データの移行（もし匿名IDがあれば）
    if (anonymousId) {
      try {
        console.log(`匿名データ移行開始: anonymousId=${anonymousId}`);
        const { data: migrateResult } = await supabase.functions.invoke("migrate-anonymous-data", {
          body: { anonymous_id: anonymousId, user_id: userId },
        });
        console.log("匿名データ移行結果:", migrateResult);
      } catch (error) {
        console.error("匿名データ移行エラー:", error);
      }
    }

    // リダイレクト先を決定
    let redirectPath = "/account";

    // ユーザータイプがバリスタの場合はバリスタページへ
    if (userMetadata?.user_type === "barista" && userId) {
      redirectPath = `/barista/${userId}`;
    }

    console.log(`リダイレクト先: ${redirectPath}`);

    // 処理成功情報を含めて返却
    return {
      success: true,
      redirectPath,
      message: "認証に成功しました。ログインしました。",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
    };
  }

  // 認証失敗
  return {
    success: false,
    redirectPath: "/error",
    error: verifyResult.error || "認証に失敗しました",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
  };
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
    const metadata: Record<string, any> = {
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

    // トリガーが正常に動作していない場合があるため、
    // 次回のログイン時にユーザープロファイルを確実に作成するよう対応
    console.log("ユーザー登録プロセスが開始されました。プロファイルは認証後に作成されます。");

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
