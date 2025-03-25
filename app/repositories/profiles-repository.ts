import { createClient } from "@/utils/supabase/server";
import { mockBaristaProfiles } from "./mock-data";

// 環境変数に基づいてモックデータを使用するかどうかを決定
const useMockData = process.env.NODE_ENV === "development";

// プロフィール情報の型定義
export type Profile = {
  id: string;
  user_id: string;
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
export async function fetchBaristaProfiles(): Promise<{ data: Profile[] | null; error: any }> {
  // 開発環境ではモックデータを使用
  if (useMockData) {
    console.log("Using mock data for barista profiles");
    return { data: mockBaristaProfiles, error: null };
  }

  // 本番環境ではSupabaseから取得
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
): Promise<{ data: Profile | null; error: any }> {
  // 開発環境ではモックデータを使用
  if (useMockData) {
    console.log(`Using mock data for barista profile with ID: ${id}`);
    const profile = mockBaristaProfiles.find((p) => p.id === id) || null;
    return { data: profile, error: profile ? null : "Profile not found" };
  }

  // 本番環境ではSupabaseから取得
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("type", "barista")
    .single();

  return { data, error };
}
