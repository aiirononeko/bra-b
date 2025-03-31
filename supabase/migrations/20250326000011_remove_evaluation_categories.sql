-- まず既にカラムが削除されているかチェックする
DO $$
BEGIN
    -- category_idカラムが存在するか確認
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'evaluation_items'
        AND column_name = 'category_id'
    ) THEN
        -- 外部キー制約を削除
        ALTER TABLE IF EXISTS public.evaluation_items 
        DROP CONSTRAINT IF EXISTS evaluation_items_category_id_fkey;
        
        -- カラムを削除
        ALTER TABLE IF EXISTS public.evaluation_items 
        DROP COLUMN IF EXISTS category_id,
        DROP COLUMN IF EXISTS is_common;
    END IF;
    
    -- 評価カテゴリテーブルが存在するか確認
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'evaluation_categories'
    ) THEN
        -- テーブルを削除
        DROP TABLE IF EXISTS public.evaluation_categories;
    END IF;
END $$;
