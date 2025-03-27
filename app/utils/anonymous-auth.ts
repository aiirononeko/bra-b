/**
 * 匿名認証機能の実装
 * Supabaseの認証機能を使用して、匿名ユーザーを管理する
 */

import { createClient } from "@/utils/supabase/client";
import { nanoid } from "nanoid";

// ローカルストレージのキー名
const ANONYMOUS_ID_KEY = "bra-b-anonymous-id";

/**
 * 匿名ユーザーIDを取得または生成する
 * @returns 匿名ユーザーID
 */
export async function getOrCreateAnonymousId(): Promise<string> {
  // クライアントサイドのみで実行
  if (typeof window === "undefined") {
    return "";
  }

  // ローカルストレージから匿名IDを取得
  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY) || "";

  // 既存のIDがない場合は生成して保存
  if (!anonymousId) {
    anonymousId = nanoid(16);
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
  }

  return anonymousId;
}

/**
 * 匿名ユーザーの情報をSupabaseに同期する
 * @returns 匿名ユーザーID
 */
export async function syncAnonymousUser(): Promise<string> {
  const anonymousId = await getOrCreateAnonymousId();
  if (!anonymousId) return "";

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
 * 匿名ユーザーの情報をプロフィールテーブルに登録する
 * @returns 匿名ユーザーID
 */
export async function registerAnonymousProfile(): Promise<string> {
  const anonymousId = await syncAnonymousUser();
  if (!anonymousId) return "";

  const supabase = createClient();

  // 既存の匿名プロフィールを確認
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("anonymous_id", anonymousId)
    .maybeSingle();

  // 既に登録済みの場合は終了
  if (existingProfile) {
    return anonymousId;
  }

  // プロフィールを作成
  await supabase.from("profiles").insert({
    anonymous_id: anonymousId,
    type: "customer",
    display_name: `匿名ユーザー${anonymousId.substring(0, 4)}`,
  });

  return anonymousId;
}

/**
 * サインアップ/ログイン時に匿名IDを引き継ぐ
 * @param userId 認証済みユーザーID
 */
export async function migrateAnonymousData(userId: string): Promise<void> {
  const anonymousId = await getOrCreateAnonymousId();
  if (!anonymousId) return;

  const supabase = createClient();

  // 匿名プロフィールを検索
  const { data: anonymousProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("anonymous_id", anonymousId)
    .maybeSingle();

  // 匿名プロフィールが存在しない場合は終了
  if (!anonymousProfile) return;

  // 認証済みユーザーのプロフィールを確認
  const { data: authProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // 認証済みユーザーのプロフィールが存在しない場合は新規作成
  if (authProfile) {
    // 既存のプロフィールに匿名IDを関連付け
    await supabase.from("profiles").update({ anonymous_id: anonymousId }).eq("user_id", userId);
  } else {
    await supabase.from("profiles").insert({
      user_id: userId,
      type: "customer",
      display_name: `ユーザー${userId.substring(0, 4)}`,
      anonymous_id: anonymousId,
    });
  }

  // TODO: 必要に応じて、評価やお気に入りなどのデータを移行
  // (データ移行ロジックはテーブル設計に応じて実装)
}
