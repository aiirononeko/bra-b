-- Migrations to add trigger function for automatic profile creation when a new user is created
-- Up migration

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- まず、すでにプロファイルが存在するか確認
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = NEW.id
  ) INTO profile_exists;

  -- プロファイルが存在しない場合のみ挿入
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      user_id,
      type,
      display_name,
      icon_url,
      bio,
      shop_name,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
      COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'name',
        CASE WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1) ELSE 'ユーザー' END
      ),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
      '',
      CASE 
        WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer') = 'barista' 
        THEN COALESCE(NEW.raw_user_meta_data->>'shop_name', 'カフェ')
        ELSE NULL
      END,
      NOW(),
      NOW()
    );
    RAISE LOG 'Profile created for user %', NEW.id;
  ELSE
    RAISE LOG 'Profile already exists for user %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    -- エラーがあっても、ユーザー作成は中断しない
    RETURN NEW;
END;
$$;

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Add trigger to auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment to trigger function
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to create a profile automatically when a new user is created';

-- Down migration - rollback changes if needed
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user(); 