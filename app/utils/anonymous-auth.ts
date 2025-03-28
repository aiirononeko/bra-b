/**
 * 匿名認証機能の実装
 * Cookieベースで匿名ユーザーを管理する
 */

import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/client";

// Cookieのキー名
const ANONYMOUS_ID_COOKIE = "anonymous_id";

/**
 * Cookieから匿名ユーザーIDを取得する（サーバーサイド用）
 * @returns 匿名ユーザーID
 */
export async function getAnonymousIdFromCookie(): Promise<string | undefined> {
  try {
    const cookiesList = await cookies();
    const anonymousId = cookiesList.get(ANONYMOUS_ID_COOKIE)?.value;
    return anonymousId;
  } catch (error) {
    console.error("Cookieの取得に失敗しました:", error);
    return undefined;
  }
}

/**
 * クライアントサイドで匿名ユーザーIDを取得する
 * @returns 匿名ユーザーID
 */
export function getAnonymousIdFromClient(): string | undefined {
  // クライアントサイドのみで実行
  if (typeof window === "undefined") {
    return undefined;
  }

  // DocumentCookieから匿名IDを取得
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${ANONYMOUS_ID_COOKIE}=`)) {
      return cookie.substring(ANONYMOUS_ID_COOKIE.length + 1);
    }
  }

  return undefined;
}

/**
 * 匿名ユーザーの情報をSupabaseに同期する（クライアントサイド用）
 * @returns 匿名ユーザーID
 */
export async function syncAnonymousUser(): Promise<string | undefined> {
  const anonymousId = getAnonymousIdFromClient();
  if (!anonymousId) return undefined;

  const supabase = createClient();

  // 現在の認証状態を確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 既に認証済みの場合は匿名IDをユーザーのメタデータに保存
  if (user) {
    const currentMetadata = user.user_metadata || {};

    // 既に匿名IDが保存されている場合はそのまま利用
    if (currentMetadata.anonymous_id) {
      return currentMetadata.anonymous_id;
    }

    // 匿名IDをユーザーのメタデータに保存
    await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        anonymous_id: anonymousId,
      },
    });
  }

  return anonymousId;
}

/**
 * 匿名ユーザープロファイルを取得する（クライアントサイド用）
 * @returns 匿名ユーザープロファイル
 */
export async function getAnonymousProfile() {
  const anonymousId = getAnonymousIdFromClient();
  if (!anonymousId) return null;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", anonymousId)
    .eq("type", "anonymous")
    .single();

  if (error || !data) {
    console.error("匿名プロファイル取得エラー:", error);
    return null;
  }

  return data;
}

/**
 * サインアップ/ログイン時に匿名IDを引き継ぐ（クライアントサイド用）
 * @param userId 認証済みユーザーID
 */
export async function migrateAnonymousData(userId: string): Promise<void> {
  const anonymousId = getAnonymousIdFromClient();
  if (!anonymousId) return;

  const supabase = createClient();

  // 匿名プロフィールを検索
  const { data: anonymousProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", anonymousId)
    .eq("type", "anonymous")
    .maybeSingle();

  // 匿名プロフィールが存在しない場合は終了
  if (!anonymousProfile) return;

  // 認証済みユーザーのプロフィールを確認
  const { data: authProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // ユーザープロファイルがない場合は作成、ある場合は更新
  if (!authProfile) {
    // 匿名プロファイルデータを活用して新規プロファイル作成
    await supabase.from("profiles").insert({
      user_id: userId,
      type: "customer",
      display_name: anonymousProfile.display_name.replace("匿名ユーザー", "ユーザー"),
      icon_url: anonymousProfile.icon_url || "",
      bio: anonymousProfile.bio || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // TODO: 必要に応じて、お気に入りや閲覧履歴などのデータを移行
  // 例: お気に入りデータを移行
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("profile_id", anonymousId);

  if (favorites && favorites.length > 0) {
    // お気に入りデータを新しいユーザーIDに関連付けて保存
    const newFavorites = favorites.map((fav) => ({
      ...fav,
      id: undefined, // 新しいIDが自動生成されるように
      profile_id: authProfile?.id || null, // 認証済みプロファイルIDを使用
      user_id: userId,
      anonymous_id: null,
    }));

    await supabase.from("favorites").insert(newFavorites);
  }

  // Cookieから匿名IDを削除（認証済みユーザーになったため）
  document.cookie = `${ANONYMOUS_ID_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
