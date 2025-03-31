-- Seed data for Bra-B application

-- auth.usersに直接INSERTするのではなく、プロファイルを作成するためのトリガーファンクションや
-- トリガーを通じて間接的に作成する方法を採用します
-- この例では、既存のユーザーを検証し、存在しない場合は別の方法（管理コンソールやサインアップAPI）で
-- 実際のユーザーを作成する必要があることを示唆しています

-- Profile data
DO $$
BEGIN
  -- まず既存のauth.usersを確認し、存在しない場合はメッセージを表示
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000001 が存在しません。このサンプルデータは開発環境用です。';
    -- 開発環境ではダミーユーザーを作成しますが、本番環境では実際のユーザー登録プロセスを使用してください
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000002 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000002', 'barista1@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000003') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000003 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000003', 'barista2@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000004') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000004 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000004', 'barista3@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000005') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000005 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000005', 'customer1@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000006') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000006 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000006', 'customer2@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000') THEN
    RAISE NOTICE 'ユーザーID 00000000-0000-0000-0000-000000000000 が存在しません。このサンプルデータは開発環境用です。';
    INSERT INTO auth.users (id, email) 
    VALUES ('00000000-0000-0000-0000-000000000000', 'anonymous@example.com');
  END IF;
END $$;

-- プロフィールデータの挿入
INSERT INTO public.profiles (id, user_id, type, display_name, icon_url, bio, shop_name, years_of_experience, prefecture, google_maps_link)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000001', 
    'admin', 
    'Admin', 
    'https://randomuser.me/api/portraits/men/75.jpg', 
    '管理者アカウントです。', 
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    '00000000-0000-0000-0000-000000000002', 
    'barista', 
    'コーヒー太郎', 
    'https://randomuser.me/api/portraits/men/32.jpg', 
    '丁寧な一杯を心がけています。コーヒーの魅力を多くの人に伝えたいです。', 
    'コーヒーハウス青山',
    5,
    '東京都',
    'https://goo.gl/maps/example1'
  ),
  (
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
  ),
  (
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
  ),
  (
    '55555555-5555-5555-5555-555555555555', 
    '00000000-0000-0000-0000-000000000005', 
    'customer', 
    'コーヒー好き', 
    'https://randomuser.me/api/portraits/women/28.jpg', 
    'コーヒーが大好きで、色々なカフェを巡っています。', 
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    '66666666-6666-6666-6666-666666666666', 
    '00000000-0000-0000-0000-000000000006', 
    'customer', 
    'カフェ巡り人', 
    'https://randomuser.me/api/portraits/men/53.jpg', 
    'カフェ巡りが趣味です。素敵なバリスタさんを応援しています。', 
    NULL,
    NULL,
    NULL,
    NULL
  );

-- Anonymous profile for users not logged in
INSERT INTO public.profiles (id, user_id, type, display_name, icon_url, bio, anonymous_id)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '00000000-0000-0000-0000-000000000000',
  'anonymous',
  'ゲスト',
  'https://randomuser.me/api/portraits/lego/1.jpg',
  'ログインしていないユーザーです。',
  'anonymous-default'
);

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
  ); 