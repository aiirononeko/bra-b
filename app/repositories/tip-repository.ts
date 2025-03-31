import { createClient } from "@/utils/supabase/server";

// チップの型定義
export type Tip = {
  id: string;
  barista_profile_id: string;
  sender_id: string | null;
  amount: number;
  sent_at: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * バリスタに送られたチップを取得する
 * @param baristaProfileId バリスタプロフィールID
 * @returns バリスタに送られたチップのリスト
 */
export async function fetchBaristaTips(baristaProfileId: string) {
  const supabase = await createClient();

  return supabase
    .from("tips")
    .select("*")
    .eq("barista_profile_id", baristaProfileId)
    .order("sent_at", { ascending: false });
}
