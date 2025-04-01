import { createClient } from "@/utils/supabase/server";
import Header from "./header";

/**
 * ヘッダーコンテナ - サーバーサイドでの認証チェックとヘッダー表示を行うコンポーネント
 */
export default async function HeaderContainer() {
  // サーバーサイドでSupabaseクライアントを作成
  const supabase = await createClient();

  // ユーザーの認証状態を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザーがログインしているかどうか
  const isLoggedIn = !!user;

  // ユーザーが管理者かどうかを確認
  let isAdmin = false;

  if (isLoggedIn) {
    // プロフィール情報を取得して管理者かどうか確認
    const { data: profile } = await supabase
      .from("profiles")
      .select("type")
      .eq("user_id", user.id)
      .single();

    isAdmin = profile?.type === "admin";
  }

  // ヘッダーコンポーネントに認証状態を渡して表示
  return <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} />;
}
