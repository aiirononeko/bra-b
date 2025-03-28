-- 匿名ユーザーのRLSポリシーを修正

-- 既存の匿名ユーザー向けポリシーを削除
DROP POLICY IF EXISTS "Allow anonymous users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow anonymous users to add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow anonymous users to delete their own favorites" ON public.favorites;

-- すべてのユーザーが全お気に入りを閲覧できるようにする
CREATE POLICY "Allow all users to view all favorites"
  ON public.favorites
  FOR SELECT
  USING (true);

-- 認証ユーザー向けのインサートポリシーは維持
-- 匿名ユーザー向けのインサートポリシーを更新
CREATE POLICY "Allow anonymous users to add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (
    anonymous_id IS NOT NULL AND
    user_id IS NULL
  );

-- 認証ユーザー向けの削除ポリシーは維持
-- 匿名ユーザー向けの削除ポリシーを更新（サーバーサイドで制御）
CREATE POLICY "Allow anonymous users to delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (
    anonymous_id IS NOT NULL
  );
