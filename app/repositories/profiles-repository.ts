import { createClient } from "@/utils/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

// プロフィール情報の型定義
export type Profile = {
  id: string;
  user_id: string | null; // 匿名ユーザーの場合はnull
  type: string;
  display_name: string;
  icon_url: string;
  bio: string;
  sns_links?: { [key: string]: string };
  shop_name?: string;
  created_at: string;
  updated_at: string;
};

// バリスタプロファイルの型定義
export type BaristaProfile = {
  id: string;
  user_id: string | null;
  display_name: string;
  icon_url: string | null;
  bio: string | null;
  sns_links: {
    instagram?: string;
    twitter?: string;
  } | null;
  shop_name: string | null;
  // バリスタカテゴリ情報
  barista_categories?: {
    category: string;
    confidence_score: number;
    friendly_score: number;
    delicious_score: number;
    sophisticated_score: number;
    entertainer_score: number;
  }[];
};

/**
 * バリスタプロフィールを取得する
 * @returns バリスタプロフィールのリスト
 */
export async function fetchBaristaProfiles() {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .select(`
      *,
      barista_categories (
        category,
        confidence_score,
        friendly_score,
        delicious_score,
        sophisticated_score,
        entertainer_score
      )
    `)
    .eq("type", "barista")
    .order("display_name");
}

/**
 * バリスタプロフィールの詳細情報を取得する
 * @param id バリスタプロフィールID
 * @returns バリスタプロフィールの詳細情報
 */
export async function fetchBaristaProfileById(id: string) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .select(`
      *,
      barista_categories (
        category,
        confidence_score,
        friendly_score,
        delicious_score,
        sophisticated_score,
        entertainer_score
      )
    `)
    .eq("id", id)
    .eq("type", "barista")
    .single();
}

/**
 * 匿名ユーザープロフィールを取得する
 * @param anonymousId Cookieから取得した匿名ユーザーID
 * @returns 匿名ユーザープロフィール情報
 */
export async function fetchAnonymousProfile(
  anonymousId: string
): Promise<{ data: Profile | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", anonymousId)
    .eq("type", "anonymous")
    .single();

  return { data, error };
}

/**
 * 特定のカテゴリに属するバリスタプロファイル一覧を取得する
 */
export async function fetchBaristaProfilesByCategory(category: string) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .select(`
      *,
      barista_categories!inner (
        category,
        confidence_score,
        friendly_score,
        delicious_score,
        sophisticated_score,
        entertainer_score
      )
    `)
    .eq("type", "barista")
    .eq("barista_categories.category", category)
    .order("display_name");
}

/**
 * バリスタプロファイルをFormDataから作成または更新する
 */
export async function upsertBaristaProfile(
  userId: string,
  data: {
    displayName: string;
    shopName?: string;
    bio?: string;
    snsLinks?: {
      instagram?: string;
      twitter?: string;
    };
  }
) {
  const supabase = await createClient();

  const { displayName, shopName, bio, snsLinks } = data;

  return supabase.from("profiles").upsert({
    id: userId,
    user_id: userId,
    type: "barista",
    display_name: displayName,
    shop_name: shopName || null,
    bio: bio || null,
    sns_links: snsLinks || null,
    updated_at: new Date().toISOString(),
  });
}

/**
 * バリスタの評価カテゴリを手動で更新する
 */
export async function recalculateBaristaCategory(baristaId: string) {
  const supabase = await createClient();

  return supabase.functions.invoke("update-barista-category", {
    method: "POST",
    body: {
      barista_id: baristaId,
      event_type: "UPDATE",
    },
  });
}
