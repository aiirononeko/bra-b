-- カテゴリ計算のRPC関数を削除します
DROP FUNCTION IF EXISTS public.calculate_barista_category(barista_id uuid);

-- 注意：計算ロジックはEdge Functionに移行し、TypeScriptで実装します 