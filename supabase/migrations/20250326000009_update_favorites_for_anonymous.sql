-- お気に入り機能の匿名ユーザー対応
-- favoritesテーブルに匿名ユーザーのサポートを追加

-- user_id のNOT NULL制約を削除（匿名ユーザー用）
ALTER TABLE public.favorites 
ALTER COLUMN user_id DROP NOT NULL;

-- anonymous_id カラムの追加
ALTER TABLE public.favorites
ADD COLUMN anonymous_id TEXT;

-- UNIQUE制約を更新（user_idとanonymous_idの両方で一意性を確保）
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_user_id_barista_profile_id_key;

-- 新しい制約を追加（認証ユーザー用）
CREATE UNIQUE INDEX idx_favorites_auth_users
ON public.favorites (barista_profile_id, user_id)
WHERE user_id IS NOT NULL;

-- 新しい制約を追加（匿名ユーザー用）
CREATE UNIQUE INDEX idx_favorites_anonymous_users
ON public.favorites (barista_profile_id, anonymous_id)
WHERE anonymous_id IS NOT NULL;

-- RLSポリシーの更新
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow authenticated users to add their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to delete their own favorites" ON public.favorites;

-- 新しいポリシーの作成
-- 認証ユーザーが自分のお気に入りを表示
CREATE POLICY "Allow authenticated users to view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- 匿名ユーザーが自分のお気に入りを表示
CREATE POLICY "Allow anonymous users to view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (
    anonymous_id IS NOT NULL AND 
    anonymous_id = current_setting('request.jwt.claims', true)::json->>'anonymous_id'
  );

-- 認証ユーザーがお気に入りを追加
CREATE POLICY "Allow authenticated users to add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 匿名ユーザーがお気に入りを追加
CREATE POLICY "Allow anonymous users to add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (
    anonymous_id IS NOT NULL AND
    user_id IS NULL
  );

-- 認証ユーザーが自分のお気に入りを削除
CREATE POLICY "Allow authenticated users to delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- 匿名ユーザーが自分のお気に入りを削除
CREATE POLICY "Allow anonymous users to delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (
    anonymous_id IS NOT NULL AND 
    anonymous_id = current_setting('request.jwt.claims', true)::json->>'anonymous_id'
  );

-- インデックスを作成して検索を高速化
CREATE INDEX idx_favorites_anonymous_id ON public.favorites(anonymous_id);
