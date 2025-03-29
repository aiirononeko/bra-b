/**
 * 匿名認証機能のサーバー実装
 * Cookieベースで匿名ユーザーを管理する
 */

import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

// Cookieのキー名
const ANONYMOUS_ID_COOKIE = "anonymous_id";

/**
 * Cookieから匿名ユーザーIDを取得する（サーバーサイド用）
 * @returns 匿名ユーザーID
 */
export async function getAnonymousIdFromCookie(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ANONYMOUS_ID_COOKIE)?.value;
  } catch (error) {
    console.error("Cookieの取得に失敗しました:", error);
    return undefined;
  }
}

/**
 * 匿名ユーザープロファイルを取得する（サーバーサイド用）
 * @returns 匿名ユーザープロファイル
 */
export async function getAnonymousProfile() {
  const anonymousId = await getAnonymousIdFromCookie();
  if (!anonymousId) return null;

  const supabase = await createClient();

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
 * 匿名IDをCookieにセットする - サーバサイドからのみ使用可能
 * @param anonymousId 匿名ユーザーID
 */
export function setAnonymousIdCookieOptions(anonymousId: string): {
  name: string;
  value: string;
  options: {
    path: string;
    expires: Date;
    sameSite: "lax";
  };
} {
  // 1年間有効なCookieとして保存
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  return {
    name: ANONYMOUS_ID_COOKIE,
    value: anonymousId,
    options: {
      path: "/",
      expires: expires,
      sameSite: "lax",
    },
  };
}

/**
 * 匿名IDをCookieから削除する - サーバサイドからのみ使用可能
 */
export function getDeleteAnonymousIdCookieOptions(): {
  name: string;
  options: {
    path: string;
    expires: Date;
  };
} {
  return {
    name: ANONYMOUS_ID_COOKIE,
    options: {
      path: "/",
      expires: new Date(0), // 過去の日付を指定して削除
    },
  };
}
