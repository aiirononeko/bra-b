-- 評価詳細テーブルのトリガーを削除
DROP TRIGGER IF EXISTS trigger_update_barista_category_on_evaluation_detail_change ON public.evaluation_details;

-- トリガー関数を削除
DROP FUNCTION IF EXISTS update_barista_category_on_evaluation_change();

-- 注意: calculate_barista_category関数自体は残しておき、Edge Functionsから呼び出せるようにします 