-- 匿名ユーザー機能のためのprofilesテーブル拡張

-- user_id のNOT NULL制約を削除（匿名ユーザー用）
ALTER TABLE public.profiles
ALTER COLUMN user_id DROP NOT NULL;

-- profiles テーブルに anonymous_id カラムを追加
ALTER TABLE public.profiles
ADD COLUMN anonymous_id TEXT UNIQUE;

-- anonymous_id が存在する場合にも profiles にアクセスできるようにRLSポリシーを更新

-- 既存のポリシーをドロップして新しいポリシーを作成
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- ユーザー自身のプロフィールを更新できるポリシー（認証済みユーザー）
CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 匿名IDを持つユーザーが自分のプロフィールを更新できるポリシー
CREATE POLICY "Allow anonymous users to update their profile via anonymous_id"
  ON public.profiles
  FOR UPDATE
  USING (
    anonymous_id IS NOT NULL AND 
    anonymous_id = current_setting('request.jwt.claims', true)::json->>'anonymous_id'
  );

-- 匿名ユーザーが自分のデータを挿入できるポリシー
CREATE POLICY "Allow creating profile with anonymous_id"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- 認証済みユーザーの場合
    (auth.uid() = user_id) OR
    -- 匿名ユーザーでuser_idがnullの場合
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  );

-- 既存のポリシーの拡張：認証済みユーザーまたは匿名ユーザーが自分のデータを読み取れるようにする
CREATE POLICY "Allow users to view their anonymous profiles"
  ON public.profiles
  FOR SELECT
  USING (
    anonymous_id IS NOT NULL AND 
    anonymous_id = current_setting('request.jwt.claims', true)::json->>'anonymous_id'
  );

-- インデックスを作成して検索を高速化
CREATE INDEX idx_profiles_anonymous_id ON public.profiles(anonymous_id);
