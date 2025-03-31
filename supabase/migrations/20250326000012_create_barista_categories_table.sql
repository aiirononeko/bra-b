-- バリスタカテゴリテーブルを作成
CREATE TABLE public.barista_categories (
  barista_profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  confidence_score FLOAT NOT NULL DEFAULT 0, -- カテゴリの信頼度（0〜1の値）
  friendly_score FLOAT NOT NULL DEFAULT 0, -- 「親しみやすい」スコア
  delicious_score FLOAT NOT NULL DEFAULT 0, -- 「美味しい一杯を届ける」スコア
  sophisticated_score FLOAT NOT NULL DEFAULT 0, -- 「洗練されたサービス」スコア
  entertainer_score FLOAT NOT NULL DEFAULT 0, -- 「エンターテイナー」スコア
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- カテゴリの値に制約を追加
ALTER TABLE public.barista_categories
  ADD CONSTRAINT barista_categories_category_check
  CHECK (category IN ('friendly', 'delicious', 'sophisticated', 'entertainer'));

-- RLSを有効化
ALTER TABLE public.barista_categories ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーがバリスタカテゴリを閲覧できるようにするポリシー
CREATE POLICY "Anyone can view barista categories"
  ON public.barista_categories
  FOR SELECT
  USING (true);

-- 管理者のみがカテゴリを更新できるポリシー
CREATE POLICY "Only admin can manage barista categories"
  ON public.barista_categories
  USING (true);

-- updated_atを自動的に更新するトリガー
CREATE TRIGGER set_barista_categories_updated_at
BEFORE UPDATE ON public.barista_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- バリスタカテゴリの計算用の関数
CREATE OR REPLACE FUNCTION calculate_barista_category(barista_id UUID)
RETURNS TEXT AS $$
DECLARE
  category_result TEXT;
  friendly_score_result FLOAT := 0;
  delicious_score_result FLOAT := 0;
  sophisticated_score_result FLOAT := 0;
  entertainer_score_result FLOAT := 0;
  max_score FLOAT := 0;
  confidence FLOAT := 0;
  total_evaluations INTEGER;
BEGIN
  -- カテゴリ別の評価数をカウント
  WITH category_counts AS (
    -- 「親しみやすい」カテゴリの評価数
    SELECT
      COUNT(*) FILTER (WHERE ei.id IN (
        '11111111-aaaa-1111-aaaa-111111111111', -- 笑顔が素敵
        '11111111-aaaa-2222-aaaa-111111111111', -- 会話が心地よい
        '11111111-aaaa-3333-aaaa-111111111111'  -- 気遣いがある
      )) AS friendly_count,
      
      -- 「美味しい一杯を届ける」カテゴリの評価数
      COUNT(*) FILTER (WHERE ei.id IN (
        '22222222-aaaa-1111-aaaa-222222222222', -- コーヒーの知識が豊富
        '22222222-aaaa-2222-aaaa-222222222222', -- ラテアートが美しい
        '22222222-aaaa-3333-aaaa-222222222222', -- コーヒーの味が美味しい
        '22222222-aaaa-4444-aaaa-222222222222'  -- ドリンクの品質が安定している
      )) AS delicious_count,
      
      -- 「洗練されたサービス」カテゴリの評価数
      COUNT(*) FILTER (WHERE ei.id IN (
        '33333333-aaaa-1111-aaaa-333333333333', -- 提供がスピーディー
        '33333333-aaaa-2222-aaaa-333333333333'  -- 所作が美しい
      )) AS sophisticated_count,
      
      -- 「エンターテイナー」カテゴリの評価数
      COUNT(*) FILTER (WHERE ei.id IN (
        '44444444-aaaa-1111-aaaa-444444444444', -- ユーモアがある
        '44444444-aaaa-2222-aaaa-444444444444', -- ウェルカム精神がある
        '44444444-aaaa-3333-aaaa-444444444444'  -- おすすめが的確
      )) AS entertainer_count,
      
      COUNT(*) AS total_count
    FROM
      evaluations e
      JOIN evaluation_details ed ON e.id = ed.evaluation_id
      JOIN evaluation_items ei ON ed.evaluation_item_id = ei.id
    WHERE
      e.barista_profile_id = barista_id
  )
  SELECT
    CASE
      WHEN friendly_count >= delicious_count AND friendly_count >= sophisticated_count AND friendly_count >= entertainer_count THEN 'friendly'
      WHEN delicious_count >= friendly_count AND delicious_count >= sophisticated_count AND delicious_count >= entertainer_count THEN 'delicious'
      WHEN sophisticated_count >= friendly_count AND sophisticated_count >= delicious_count AND sophisticated_count >= entertainer_count THEN 'sophisticated'
      WHEN entertainer_count >= friendly_count AND entertainer_count >= delicious_count AND entertainer_count >= sophisticated_count THEN 'entertainer'
      ELSE 'friendly' -- デフォルト値
    END,
    
    -- 各スコアの計算（総評価数で割って正規化）
    CASE WHEN total_count > 0 THEN friendly_count::FLOAT / total_count ELSE 0 END,
    CASE WHEN total_count > 0 THEN delicious_count::FLOAT / total_count ELSE 0 END,
    CASE WHEN total_count > 0 THEN sophisticated_count::FLOAT / total_count ELSE 0 END,
    CASE WHEN total_count > 0 THEN entertainer_count::FLOAT / total_count ELSE 0 END,
    
    -- 最大スコア（信頼度の計算に使用）
    GREATEST(
      CASE WHEN total_count > 0 THEN friendly_count::FLOAT / total_count ELSE 0 END,
      CASE WHEN total_count > 0 THEN delicious_count::FLOAT / total_count ELSE 0 END,
      CASE WHEN total_count > 0 THEN sophisticated_count::FLOAT / total_count ELSE 0 END,
      CASE WHEN total_count > 0 THEN entertainer_count::FLOAT / total_count ELSE 0 END
    ),
    
    total_count
  INTO
    category_result,
    friendly_score_result,
    delicious_score_result,
    sophisticated_score_result,
    entertainer_score_result,
    max_score,
    total_evaluations
  FROM
    category_counts;
  
  -- 信頼度の計算（最大スコアと評価数に基づく）
  -- 評価数が多いほど、また最大スコアが他カテゴリから大きく離れているほど信頼度が高くなる
  confidence := LEAST(max_score * LEAST(total_evaluations::FLOAT / 10, 1), 1.0);
  
  -- バリスタカテゴリを更新
  INSERT INTO public.barista_categories (
    barista_profile_id,
    category,
    confidence_score,
    friendly_score,
    delicious_score,
    sophisticated_score,
    entertainer_score
  )
  VALUES (
    barista_id,
    category_result,
    confidence,
    friendly_score_result,
    delicious_score_result,
    sophisticated_score_result,
    entertainer_score_result
  )
  ON CONFLICT (barista_profile_id) DO UPDATE SET
    category = EXCLUDED.category,
    confidence_score = EXCLUDED.confidence_score,
    friendly_score = EXCLUDED.friendly_score,
    delicious_score = EXCLUDED.delicious_score,
    sophisticated_score = EXCLUDED.sophisticated_score,
    entertainer_score = EXCLUDED.entertainer_score,
    calculated_at = now(),
    updated_at = now();
  
  RETURN category_result;
END;
$$ LANGUAGE plpgsql;

-- 評価詳細が変更されたときにバリスタカテゴリを自動的に更新するトリガー関数
CREATE OR REPLACE FUNCTION update_barista_category_on_evaluation_change()
RETURNS TRIGGER AS $$
DECLARE
  barista_id UUID;
BEGIN
  -- 新しい評価が追加された場合
  IF (TG_OP = 'INSERT') THEN
    -- バリスタIDを取得
    SELECT e.barista_profile_id INTO barista_id
    FROM evaluations e
    WHERE e.id = NEW.evaluation_id;
    
    -- カテゴリを計算して更新
    IF barista_id IS NOT NULL THEN
      PERFORM calculate_barista_category(barista_id);
    END IF;
  -- 評価が更新された場合
  ELSIF (TG_OP = 'UPDATE') THEN
    -- バリスタIDを取得
    SELECT e.barista_profile_id INTO barista_id
    FROM evaluations e
    WHERE e.id = NEW.evaluation_id;
    
    -- カテゴリを計算して更新
    IF barista_id IS NOT NULL THEN
      PERFORM calculate_barista_category(barista_id);
    END IF;
  -- 評価が削除された場合
  ELSIF (TG_OP = 'DELETE') THEN
    -- バリスタIDを取得
    SELECT e.barista_profile_id INTO barista_id
    FROM evaluations e
    WHERE e.id = OLD.evaluation_id;
    
    -- カテゴリを計算して更新
    IF barista_id IS NOT NULL THEN
      PERFORM calculate_barista_category(barista_id);
    END IF;
  END IF;
  
  -- INSERT, UPDATEの場合はNEWを返す、DELETEの場合はOLDを返す
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 評価詳細テーブルのトリガーを作成
CREATE TRIGGER trigger_update_barista_category_on_evaluation_detail_change
AFTER INSERT OR UPDATE OR DELETE ON public.evaluation_details
FOR EACH ROW
EXECUTE FUNCTION update_barista_category_on_evaluation_change();

-- 既存の評価データに基づいて、すべてのバリスタのカテゴリを計算
DO $$
DECLARE
  barista_record RECORD;
BEGIN
  -- 評価が存在するすべてのバリスタを取得
  FOR barista_record IN (
    SELECT DISTINCT barista_profile_id
    FROM evaluations
  ) LOOP
    -- 各バリスタのカテゴリを計算
    PERFORM calculate_barista_category(barista_record.barista_profile_id);
  END LOOP;
END;
$$;
