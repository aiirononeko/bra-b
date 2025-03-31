"use server";

import { getFavoriteStatus, toggleFavorite } from "@/app/repositories/favorites-repository";
import { cookies } from "next/headers";

/**
 * お気に入り状態を取得するサーバーアクション
 */
export async function getFavoriteStatusAction(baristaProfileId: string) {
  if (!baristaProfileId) {
    throw new Error("バリスタIDが必要です");
  }

  // 匿名IDをCookieから取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;

  // お気に入り状態取得（anonymousIdがnullでも処理できる）
  const { data, error } = await getFavoriteStatus(baristaProfileId, anonymousId);

  if (error) {
    throw new Error("お気に入り状態の取得に失敗しました");
  }

  return { isFavorite: data };
}

/**
 * お気に入り登録・削除を行うサーバーアクション
 */
export async function toggleFavoriteAction(baristaProfileId: string) {
  if (!baristaProfileId) {
    throw new Error("バリスタIDが必要です");
  }

  // 匿名IDをCookieから取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;

  // お気に入りトグル処理
  const { data, error } = await toggleFavorite(baristaProfileId, anonymousId);

  if (error) {
    throw new Error(error.message || "お気に入り処理に失敗しました");
  }

  if (data?.action === "add") {
    return { success: true, action: "add" };
  }

  return { success: true, action: "remove" };
}
