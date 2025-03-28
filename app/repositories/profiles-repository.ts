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

/**
 * バリスタプロフィールを取得する
 * @returns バリスタプロフィールのリスト
 */
export async function fetchBaristaProfiles(): Promise<{
  data: Profile[] | null;
  error: PostgrestError | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("type", "barista")
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * バリスタプロフィールの詳細情報を取得する
 * @param id バリスタプロフィールID
 * @returns バリスタプロフィールの詳細情報
 */
export async function fetchBaristaProfileById(
  id: string
): Promise<{ data: Profile | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("type", "barista")
    .single();

  return { data, error };
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
