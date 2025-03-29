"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAnonymousIdFromCookie } from "@/app/utils/anonymous-auth/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BaristaProfileFormValues,
  CustomerProfileFormValues,
  LoginFormValues,
  RegisterFormValues,
} from "../schemas/auth-schemas";

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
 * ユーザー登録処理
 */
export async function registerUser(formData: RegisterFormValues): Promise<AuthResult> {
  const supabase = await createClient();
  const { email, userType, displayName, anonymousId, authType } = formData;

  // 匿名IDがあれば取得、なければCookieから取得
  const cookieAnonymousId = await getAnonymousIdFromCookie();
  const finalAnonymousId = anonymousId || cookieAnonymousId;

  // 認証方法によって処理を分岐
  switch (authType) {
    case "magic_link":
      return await signInWithMagicLink(supabase, {
        email,
        userType,
        displayName,
        anonymousId: finalAnonymousId,
      });

    case "google":
      return await signInWithGoogle(supabase, {
        userType,
        displayName,
        anonymousId: finalAnonymousId,
      });

    default:
      return { success: false, error: "不明な認証タイプです" };
  }
}

/**
 * マジックリンクによるサインイン/登録
 */
async function signInWithMagicLink(
  supabase: SupabaseClient,
  {
    email,
    userType,
    displayName,
    anonymousId,
  }: Omit<RegisterFormValues, "password" | "confirmPassword" | "authType"> & {
    anonymousId?: string;
  }
): Promise<AuthResult> {
  try {
    // ユーザータイプに基づいてリダイレクト先を設定
    const redirectPath = userType === "barista" ? "/barista" : "/";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/confirm?next=${redirectPath}`,
        data: {
          user_type: userType,
          display_name: displayName,
          anonymous_id: anonymousId, // 匿名IDを保存
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      redirectTo:
        "/auth/login?message=マジックリンクをメールで送信しました。メールをご確認ください。",
    };
  } catch (error) {
    console.error("マジックリンク登録エラー:", error);
    return { success: false, error: "マジックリンク送信中にエラーが発生しました" };
  }
}

/**
 * Googleによるサインイン/登録
 */
async function signInWithGoogle(
  supabase: SupabaseClient,
  {
    userType,
    displayName,
    anonymousId,
  }: Omit<RegisterFormValues, "email" | "password" | "confirmPassword" | "authType"> & {
    anonymousId?: string;
  }
): Promise<AuthResult> {
  try {
    // ユーザータイプに基づいてリダイレクト先を設定
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
      // 設定したクエリパラメータをsessionに保存するためCookieに保存
      // Response.cookieオプションを使用する
      const redirectUrl = new URL(data.url);
      redirectUrl.searchParams.append(
        "auth_params",
        Buffer.from(
          JSON.stringify({
            userType,
            displayName,
            anonymousId,
          })
        ).toString("base64")
      );

      redirect(redirectUrl.toString());
    }

    return { success: false, error: "リダイレクトURLが取得できませんでした" };
  } catch (error) {
    console.error("Google登録エラー:", error);
    return { success: false, error: "Google認証中にエラーが発生しました" };
  }
}

/**
 * ログイン処理
 */
export async function loginUser(formData: LoginFormValues): Promise<AuthResult> {
  const supabase = await createClient();
  const { email, password, authType } = formData;

  // 匿名IDを取得
  const anonymousId = await getAnonymousIdFromCookie();

  try {
    switch (authType) {
      case "password": {
        if (!password) {
          return { success: false, error: "パスワードは必須です" };
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          return { success: false, error: signInError.message };
        }

        const userId = signInData.user?.id;

        // 匿名ユーザーデータの移行
        if (anonymousId && userId) {
          await migrateAnonymousUserData(supabase, anonymousId, userId);
        }

        return { success: true, userId, redirectTo: "/account" };
      }

      case "magic_link":
        return await signInWithMagicLink(supabase, {
          email,
          userType: "customer",
          displayName: email.split("@")[0],
          anonymousId,
        });

      case "google":
        return await signInWithGoogle(supabase, {
          userType: "customer",
          displayName: "User",
          anonymousId,
        });

      default:
        return { success: false, error: "不明な認証タイプです" };
    }
  } catch (error) {
    console.error("ログインエラー:", error);
    return { success: false, error: "ログイン処理中にエラーが発生しました" };
  }
}

/**
 * サインアウト処理
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("サインアウトエラー:", error);
    return { success: false, error: "サインアウト処理中にエラーが発生しました" };
  }
}

/**
 * 匿名ユーザーデータの移行
 */
async function migrateAnonymousUserData(
  supabase: SupabaseClient,
  anonymousId: string,
  userId: string
): Promise<void> {
  try {
    // 匿名ユーザーのプロフィールを取得
    const { data: anonymousProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", anonymousId)
      .eq("type", "anonymous")
      .maybeSingle();

    if (profileError || !anonymousProfile) {
      console.error("匿名プロフィール取得エラー:", profileError);
      return;
    }

    // 匿名ユーザーのお気に入りデータを移行
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("*")
      .eq("anonymous_id", anonymousId);

    if (favoritesError) {
      console.error("お気に入りデータ取得エラー:", favoritesError);
      return;
    }

    if (favorites && favorites.length > 0) {
      // 登録済みユーザーIDに関連付けるためのデータ変換
      const migratedFavorites = favorites.map((fav: any) => ({
        barista_profile_id: fav.barista_profile_id,
        user_id: userId,
        // 引き継ぎ追跡のために匿名IDも保持
        anonymous_id: anonymousId,
        created_at: new Date().toISOString(),
      }));

      // 一括挿入（競合はスキップ）
      const { error: insertError } = await supabase.from("favorites").upsert(migratedFavorites, {
        onConflict: "barista_profile_id,user_id",
        ignoreDuplicates: true,
      });

      if (insertError) {
        console.error("お気に入りデータ移行エラー:", insertError);
      }
    }

    // 必要に応じて他のデータ(評価など)も移行
    // ...

    // 匿名ユーザーのCookieをクリアする処理は省略
    // Next.js App Routerでのサーバーコンポーネントではレスポンスを返すタイミングでクッキーを設定する必要があるため
    // この関数の呼び出し元でCookieをクリアする必要がある
  } catch (error) {
    console.error("匿名データ移行エラー:", error);
  }
}
