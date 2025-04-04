-- Seed data for Bra-B application

-- auth.usersテーブルにユーザーを追加すると、handle_new_user()トリガー関数によって
-- 自動的にプロフィールが作成されます

-- テスト・開発用ユーザーデータ
DO $$
BEGIN
  -- 管理者ユーザー
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000001', 
      'admin@example.com',
      jsonb_build_object(
        'user_type', 'admin',
        'display_name', 'Admin',
        'avatar_url', 'https://randomuser.me/api/portraits/men/75.jpg'
      )
    );
  END IF;

  -- バリスタ1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000002', 
      'barista1@example.com',
      jsonb_build_object(
        'user_type', 'barista',
        'display_name', 'コーヒー太郎',
        'avatar_url', 'https://randomuser.me/api/portraits/men/32.jpg',
        'shop_name', 'コーヒーハウス青山'
      )
    );
  END IF;

  -- バリスタ2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000003') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000003', 
      'barista2@example.com',
      jsonb_build_object(
        'user_type', 'barista',
        'display_name', 'ラテ花子',
        'avatar_url', 'https://randomuser.me/api/portraits/women/44.jpg',
        'shop_name', 'カフェ渋谷'
      )
    );
  END IF;

  -- バリスタ3
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000004') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000004', 
      'barista3@example.com',
      jsonb_build_object(
        'user_type', 'barista',
        'display_name', '山田コーヒー',
        'avatar_url', 'https://randomuser.me/api/portraits/men/67.jpg',
        'shop_name', 'ロースターズカフェ'
      )
    );
  END IF;

  -- 顧客1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000005') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000005', 
      'customer1@example.com',
      jsonb_build_object(
        'user_type', 'customer',
        'display_name', 'コーヒー好き',
        'avatar_url', 'https://randomuser.me/api/portraits/women/28.jpg'
      )
    );
  END IF;

  -- 顧客2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000006') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000006', 
      'customer2@example.com',
      jsonb_build_object(
        'user_type', 'customer',
        'display_name', 'カフェ巡り人',
        'avatar_url', 'https://randomuser.me/api/portraits/men/53.jpg'
      )
    );
  END IF;

  -- 匿名ユーザー
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000') THEN
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000000', 
      'anonymous@example.com',
      jsonb_build_object(
        'user_type', 'anonymous',
        'display_name', 'ゲスト',
        'avatar_url', 'https://randomuser.me/api/portraits/lego/1.jpg'
      )
    );
  END IF;
END $$;

-- プロフィールを強制的に確実に作成（トリガーがうまく動かない場合のフォールバック）
DO $$
BEGIN
  -- バリスタ1のプロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000002') THEN
    INSERT INTO public.profiles (
      id,
      user_id,
      type,
      display_name,
      icon_url,
      bio,
      shop_name,
      years_of_experience,
      prefecture,
      google_maps_link
    ) VALUES (
      '22222222-2222-2222-2222-222222222222',
      '00000000-0000-0000-0000-000000000002',
      'barista',
      'コーヒー太郎',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'コーヒーの魅力を多くの人に伝えたいです。',
      'コーヒーハウス青山',
      5,
      '東京都',
      'https://goo.gl/maps/example1'
    );
  ELSE
    -- 既存のプロフィールのIDを更新
    UPDATE public.profiles
    SET id = '22222222-2222-2222-2222-222222222222'
    WHERE user_id = '00000000-0000-0000-0000-000000000002';
  END IF;

  -- バリスタ2のプロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000003') THEN
    INSERT INTO public.profiles (
      id,
      user_id,
      type,
      display_name,
      icon_url,
      bio,
      shop_name,
      years_of_experience,
      prefecture,
      google_maps_link
    ) VALUES (
      '33333333-3333-3333-3333-333333333333',
      '00000000-0000-0000-0000-000000000003',
      'barista',
      'ラテ花子',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'ラテアートが得意です。皆さんに素敵なひとときを提供します。',
      'カフェ渋谷',
      3,
      '東京都',
      'https://goo.gl/maps/example2'
    );
  ELSE
    -- 既存のプロフィールのIDを更新
    UPDATE public.profiles
    SET id = '33333333-3333-3333-3333-333333333333'
    WHERE user_id = '00000000-0000-0000-0000-000000000003';
  END IF;

  -- バリスタ3のプロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000004') THEN
    INSERT INTO public.profiles (
      id,
      user_id,
      type,
      display_name,
      icon_url,
      bio,
      shop_name,
      years_of_experience,
      prefecture,
      google_maps_link
    ) VALUES (
      '44444444-4444-4444-4444-444444444444',
      '00000000-0000-0000-0000-000000000004',
      'barista',
      '山田コーヒー',
      'https://randomuser.me/api/portraits/men/67.jpg',
      '20年のバリスタ経験があります。スペシャルティコーヒーが専門です。',
      'ロースターズカフェ',
      20,
      '大阪府',
      'https://goo.gl/maps/example3'
    );
  ELSE
    -- 既存のプロフィールのIDを更新
    UPDATE public.profiles
    SET id = '44444444-4444-4444-4444-444444444444'
    WHERE user_id = '00000000-0000-0000-0000-000000000004';
  END IF;

  -- 顧客1のプロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000005') THEN
    INSERT INTO public.profiles (
      user_id,
      type,
      display_name,
      icon_url,
      bio
    ) VALUES (
      '00000000-0000-0000-0000-000000000005',
      'customer',
      'コーヒー好き',
      'https://randomuser.me/api/portraits/women/28.jpg',
      'コーヒーが大好きで、色々なカフェを巡っています。'
    );
  END IF;

  -- 顧客2のプロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000006') THEN
    INSERT INTO public.profiles (
      user_id,
      type,
      display_name,
      icon_url,
      bio
    ) VALUES (
      '00000000-0000-0000-0000-000000000006',
      'customer',
      'カフェ巡り人',
      'https://randomuser.me/api/portraits/men/53.jpg',
      'カフェ巡りが趣味です。素敵なバリスタさんを応援しています。'
    );
  END IF;

  -- 匿名ユーザープロフィール
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000000') THEN
    INSERT INTO public.profiles (
      user_id,
      type,
      display_name,
      icon_url,
      bio,
      anonymous_id
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'anonymous',
      'ゲスト',
      'https://randomuser.me/api/portraits/lego/1.jpg',
      'ログインしていないユーザーです。',
      'anonymous-default'
    );
  END IF;
END $$;

-- バリスタカテゴリのサンプルデータを直接挿入
INSERT INTO public.barista_categories (
  barista_profile_id,
  category,
  confidence_score,
  friendly_score,
  delicious_score,
  sophisticated_score,
  entertainer_score
)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',  -- バリスタ1
    'friendly',                              -- 親しみやすいカテゴリ
    0.7,                                     -- 信頼度
    0.6,                                     -- 親しみやすいスコア
    0.2,                                     -- 美味しい一杯スコア
    0.1,                                     -- 洗練されたスコア
    0.1                                      -- エンターテイナースコア
  ),
  (
    '33333333-3333-3333-3333-333333333333',  -- バリスタ2
    'delicious',                             -- 美味しい一杯カテゴリ
    0.6,                                     -- 信頼度
    0.2,                                     -- 親しみやすいスコア
    0.5,                                     -- 美味しい一杯スコア
    0.2,                                     -- 洗練されたスコア
    0.1                                      -- エンターテイナースコア
  ),
  (
    '44444444-4444-4444-4444-444444444444',  -- バリスタ3
    'sophisticated',                         -- 洗練されたカテゴリ
    0.8,                                     -- 信頼度
    0.1,                                     -- 親しみやすいスコア
    0.2,                                     -- 美味しい一杯スコア
    0.6,                                     -- 洗練されたスコア
    0.1                                      -- エンターテイナースコア
  )
ON CONFLICT (barista_profile_id) DO UPDATE SET
  category = EXCLUDED.category,
  confidence_score = EXCLUDED.confidence_score,
  friendly_score = EXCLUDED.friendly_score,
  delicious_score = EXCLUDED.delicious_score,
  sophisticated_score = EXCLUDED.sophisticated_score,
  entertainer_score = EXCLUDED.entertainer_score;

-- Evaluation items
INSERT INTO public.evaluation_items (id, name, is_active, sort_order)
VALUES
  ('11111111-aaaa-1111-aaaa-111111111111', '笑顔が素敵', true, 1),
  ('11111111-aaaa-2222-aaaa-111111111111', '会話が心地よい', true, 2),
  ('11111111-aaaa-3333-aaaa-111111111111', '気遣いがある', true, 3),
  ('22222222-aaaa-1111-aaaa-222222222222', 'コーヒーの知識が豊富', true, 4),
  ('22222222-aaaa-2222-aaaa-222222222222', 'ラテアートが美しい', true, 5),
  ('22222222-aaaa-3333-aaaa-222222222222', 'コーヒーの味が美味しい', true, 6),
  ('22222222-aaaa-4444-aaaa-222222222222', 'ドリンクの品質が安定している', true, 7),
  ('33333333-aaaa-1111-aaaa-333333333333', '提供がスピーディー', true, 8),
  ('33333333-aaaa-2222-aaaa-333333333333', '所作が美しい', true, 9),
  ('44444444-aaaa-1111-aaaa-444444444444', 'ユーモアがある', true, 10),
  ('44444444-aaaa-2222-aaaa-444444444444', 'ウェルカム精神がある', true, 11),
  ('44444444-aaaa-3333-aaaa-444444444444', 'おすすめが的確', true, 12);

-- Sample evaluations for baristas
INSERT INTO public.evaluations (id, barista_profile_id, evaluator_id, evaluated_at)
VALUES
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000005', now() - interval '5 days'),
  ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000006', now() - interval '3 days'),
  ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000005', now() - interval '7 days'),
  ('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000006', now() - interval '2 days'),
  ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000005', now() - interval '10 days'),
  ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000006', now() - interval '1 day');

-- Sample evaluation details
-- バリスタ1 (friendly type)
INSERT INTO public.evaluation_details (evaluation_id, evaluation_item_id)
VALUES
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '11111111-aaaa-1111-aaaa-111111111111'),
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '11111111-aaaa-2222-aaaa-111111111111'),
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '11111111-aaaa-3333-aaaa-111111111111'),
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '44444444-aaaa-2222-aaaa-444444444444'),
  ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '11111111-aaaa-1111-aaaa-111111111111'),
  ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '11111111-aaaa-3333-aaaa-111111111111'),
  ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '44444444-aaaa-1111-aaaa-444444444444');

-- バリスタ2 (delicious type)
INSERT INTO public.evaluation_details (evaluation_id, evaluation_item_id)
VALUES
  ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '22222222-aaaa-1111-aaaa-222222222222'),
  ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '22222222-aaaa-2222-aaaa-222222222222'),
  ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '22222222-aaaa-3333-aaaa-222222222222'),
  ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '33333333-aaaa-2222-aaaa-333333333333'),
  ('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', '22222222-aaaa-2222-aaaa-222222222222'),
  ('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', '22222222-aaaa-3333-aaaa-222222222222'),
  ('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', '11111111-aaaa-1111-aaaa-111111111111');

-- バリスタ3 (sophisticated type)
INSERT INTO public.evaluation_details (evaluation_id, evaluation_item_id)
VALUES
  ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '33333333-aaaa-1111-aaaa-333333333333'),
  ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '33333333-aaaa-2222-aaaa-333333333333'),
  ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '22222222-aaaa-1111-aaaa-222222222222'),
  ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '22222222-aaaa-3333-aaaa-222222222222'),
  ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', '33333333-aaaa-1111-aaaa-333333333333'),
  ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', '33333333-aaaa-2222-aaaa-333333333333'),
  ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', '11111111-aaaa-1111-aaaa-111111111111');

-- Sample tips
INSERT INTO public.tips (id, barista_profile_id, sender_id, amount, message, sent_at)
VALUES
  ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000005', 500, 'いつも美味しいコーヒーをありがとう！', now() - interval '4 days'),
  ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000006', 1000, 'ラテアートがとても素敵でした！', now() - interval '2 days'),
  ('bbbbbbbb-3333-3333-3333-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000005', 800, 'コーヒーの説明が分かりやすかったです。また来ます！', now() - interval '1 day');

-- Sample favorites
INSERT INTO public.favorites (id, user_id, barista_profile_id)
VALUES
  ('cccccccc-1111-1111-1111-cccccccccccc', '00000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-2222-2222-2222-cccccccccccc', '00000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-3333-3333-3333-cccccccccccc', '00000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-4444-4444-4444-cccccccccccc', '00000000-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444'); 