/**
 * お気に入り関連のリポジトリ
 */
import { getOrCreateAnonymousId } from "@/app/utils/anonymous-auth";
import { createClient } from "@/utils/supabase/server";

/**
 * バリスタのお気に入り状態を取得する
 */
export async function getFavoriteStatus(baristaProfileId: string, anonymousId?: string) {
  const supabase = await createClient();

  // 認証状態を確認
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userId: string | null = null;

  // 認証済みユーザーの場合
  if (session?.user) {
    userId = session.user.id;

    // 認証ユーザーのお気に入り状態を確認
    const { data: favorite, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("barista_profile_id", baristaProfileId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("お気に入り状態の取得に失敗しました:", error);
      return { data: null, error };
    }

    return { data: !!favorite, error: null };
  }

  // 匿名ユーザーの場合
  if (anonymousId) {
    // 匿名ユーザーのお気に入り状態を確認
    const { data: favorite, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("barista_profile_id", baristaProfileId)
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

    if (error) {
      console.error("匿名ユーザーのお気に入り状態の取得に失敗しました:", error);
      return { data: null, error };
    }

    return { data: !!favorite, error: null };
  }

  // ユーザー識別情報がない場合
  return { data: false, error: null };
}

/**
 * お気に入りの追加・削除（トグル）
 */
export async function toggleFavorite(baristaProfileId: string, anonymousId?: string) {
  const supabase = await createClient();

  // 認証状態を確認
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userId: string | null = null;
  let userIdentifier: { user_id?: string; anonymous_id?: string } = {};

  // 認証済みユーザーの場合
  if (session?.user) {
    userId = session.user.id;
    userIdentifier = { user_id: userId };

    // 既存のお気に入りを確認
    const { data: existingFavorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("barista_profile_id", baristaProfileId)
      .eq("user_id", userId)
      .maybeSingle();

    // 既に登録済みの場合は削除（トグル機能）
    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existingFavorite.id);

      if (deleteError) {
        console.error("お気に入り削除に失敗しました:", deleteError);
        return { data: null, error: deleteError };
      }

      return { data: { action: "remove" }, error: null };
    }
  }
  // 匿名ユーザーの場合
  else if (anonymousId) {
    userIdentifier = { anonymous_id: anonymousId };

    // 既存のお気に入りを確認
    const { data: existingFavorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("barista_profile_id", baristaProfileId)
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

    // 既に登録済みの場合は削除（トグル機能）
    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existingFavorite.id);

      if (deleteError) {
        console.error("匿名ユーザーのお気に入り削除に失敗しました:", deleteError);
        return { data: null, error: deleteError };
      }

      return { data: { action: "remove" }, error: null };
    }
  } else {
    // ユーザー識別情報がない場合
    return {
      data: null,
      error: { message: "ユーザー識別に失敗しました" },
    };
  }

  // 新規お気に入り登録
  const { error: insertError } = await supabase.from("favorites").insert({
    barista_profile_id: baristaProfileId,
    ...userIdentifier,
  });

  if (insertError) {
    console.error("お気に入り登録に失敗しました:", insertError);
    return { data: null, error: insertError };
  }

  return { data: { action: "add" }, error: null };
}

/**
 * 匿名ユーザーが認証した際にお気に入りデータを引き継ぐ
 */
export async function migrateAnonymousFavorites(userId: string, anonymousId: string) {
  const supabase = await createClient();

  // 匿名ユーザーのお気に入り取得
  const { data: anonymousFavorites, error: fetchError } = await supabase
    .from("favorites")
    .select("*")
    .eq("anonymous_id", anonymousId);

  if (fetchError || !anonymousFavorites?.length) {
    return { success: false, error: fetchError };
  }

  // 認証ユーザー用のお気に入りデータに変換
  const migratedFavorites = anonymousFavorites.map((fav) => ({
    barista_profile_id: fav.barista_profile_id,
    user_id: userId,
    anonymous_id: anonymousId, // 引き継ぎ追跡用に保持
  }));

  // 一括挿入（競合はスキップ）
  const { error: insertError } = await supabase.from("favorites").upsert(migratedFavorites, {
    onConflict: "barista_profile_id,user_id",
    ignoreDuplicates: true,
  });

  // 匿名データを削除（オプション）
  // const { error: deleteError } = await supabase
  //   .from("favorites")
  //   .delete()
  //   .eq("anonymous_id", anonymousId)
  //   .is("user_id", null);

  return {
    success: !insertError,
    error: insertError,
  };
}
