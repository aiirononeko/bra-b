-- Supabase Authentication ユーザーの作成
WITH credentials(id, mail, pass, name) AS (
  SELECT * FROM (VALUES 
    ('11111111-1111-1111-1111-111111111111', 'yamada@example.com', 'password123', '山田コーヒー'),
    ('22222222-2222-2222-2222-222222222222', 'sato@example.com', 'password123', '佐藤エスプレッソ'),
    ('33333333-3333-3333-3333-333333333333', 'tanaka@example.com', 'password123', '田中ブリュー'),
    ('44444444-4444-4444-4444-444444444444', 'suzuki@example.com', 'password123', '鈴木コーヒーラバー'),
    ('55555555-5555-5555-5555-555555555555', 'kobayashi@example.com', 'password123', '小林カフェマニア')
  ) AS users(id, mail, pass, name)
),
create_user AS (
  INSERT INTO auth.users (id, instance_id, ROLE, aud, email, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password, created_at, updated_at, last_sign_in_at, email_confirmed_at, confirmation_sent_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    SELECT 
      id::uuid, 
      '00000000-0000-0000-0000-000000000000', 
      'authenticated', 
      'authenticated', 
      mail, 
      '{"provider":"email","providers":["email"]}', 
      format('{"name":"%s"}', name)::jsonb, 
      FALSE, 
      crypt(pass, gen_salt('bf')), 
      NOW(), 
      NOW(), 
      NOW(), 
      NOW(), 
      NOW(), 
      '', 
      '', 
      '', 
      '' 
    FROM credentials
  RETURNING id
)
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), create_user.id, create_user.id, json_build_object('sub', create_user.id, 'email', credentials.mail), 'email', NOW(), NOW(), NOW() 
  FROM create_user
  JOIN credentials ON create_user.id = credentials.id::uuid;

-- プロフィールデータの作成
INSERT INTO public.profiles (id, user_id, type, display_name, icon_url, bio, sns_links, shop_name, created_at, updated_at, anonymous_id)
VALUES
  -- バリスタプロフィール
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    '11111111-1111-1111-1111-111111111111', 
    'barista', 
    '山田コーヒー', 
    'https://randomuser.me/api/portraits/men/1.jpg', 
    '5年間のバリスタ経験があります。スペシャルティコーヒーが得意で、特にエチオピア産のコーヒー豆を使ったハンドドリップが好評です。', 
    '{"instagram": "yamada_coffee", "twitter": "yamada_barista"}', 
    'コーヒーハウス山田',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    NULL
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
    '22222222-2222-2222-2222-222222222222', 
    'barista', 
    '佐藤エスプレッソ', 
    'https://randomuser.me/api/portraits/women/2.jpg', 
    'イタリアで修行したエスプレッソの専門家です。ラテアートにも力を入れており、カプチーノやラテの見た目も美しさにこだわっています。', 
    '{"instagram": "sato_espresso", "twitter": "sato_latte"}', 
    'カフェ サトウ',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NULL
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 
    '33333333-3333-3333-3333-333333333333', 
    'barista', 
    '田中ブリュー', 
    'https://randomuser.me/api/portraits/men/3.jpg', 
    '自家焙煎のスペシャリストです。コーヒー豆の選定から焙煎、抽出までのすべての工程にこだわりを持っています。季節に合わせたブレンドも好評です。', 
    '{"instagram": "tanaka_brew", "twitter": "tanaka_coffee"}', 
    'ロースターズ タナカ',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NULL
  ),
  -- 一般ユーザープロフィール
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 
    '44444444-4444-4444-4444-444444444444', 
    'user', 
    '鈴木コーヒーラバー', 
    'https://randomuser.me/api/portraits/men/4.jpg', 
    'コーヒー愛好家です。様々なカフェを巡り、美味しいコーヒーを探しています。', 
    '{"instagram": "suzuki_coffee", "twitter": "suzuki_coffee_lover"}', 
    NULL,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days',
    NULL
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 
    '55555555-5555-5555-5555-555555555555', 
    'user', 
    '小林カフェマニア', 
    'https://randomuser.me/api/portraits/women/5.jpg', 
    'カフェ巡りが趣味です。特にラテアートの美しいカフェに注目しています。', 
    '{"instagram": "kobayashi_cafe", "twitter": "kobayashi_cafe_mania"}', 
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NULL
  ),
  -- 匿名ユーザープロフィール
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff', 
    NULL, 
    'user', 
    'ゲストユーザー', 
    NULL, 
    NULL, 
    NULL, 
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    'anonymous-123456'
  );

-- 評価項目の作成
INSERT INTO public.evaluation_items (id, name, is_active, sort_order, created_at, updated_at)
VALUES
  -- 親しみやすい
  ('11111111-aaaa-1111-aaaa-111111111111', '笑顔が素敵', true, 1, NOW(), NOW()),
  ('11111111-aaaa-2222-aaaa-111111111111', '会話が心地よい', true, 2, NOW(), NOW()),
  ('11111111-aaaa-3333-aaaa-111111111111', '気遣いがある', true, 3, NOW(), NOW()),
  
  -- 美味しい一杯を届ける
  ('22222222-aaaa-1111-aaaa-222222222222', 'コーヒーの知識が豊富', true, 4, NOW(), NOW()),
  ('22222222-aaaa-2222-aaaa-222222222222', 'ラテアートが美しい', true, 5, NOW(), NOW()),
  ('22222222-aaaa-3333-aaaa-222222222222', 'コーヒーの味が美味しい', true, 6, NOW(), NOW()),
  ('22222222-aaaa-4444-aaaa-222222222222', 'ドリンクの品質が安定している', true, 7, NOW(), NOW()),
  
  -- 洗練されたサービス
  ('33333333-aaaa-1111-aaaa-333333333333', '提供がスピーディー', true, 8, NOW(), NOW()),
  ('33333333-aaaa-2222-aaaa-333333333333', '所作が美しい', true, 9, NOW(), NOW()),
  
  -- エンターテイナー
  ('44444444-aaaa-1111-aaaa-444444444444', 'ユーモアがある', true, 10, NOW(), NOW()),
  ('44444444-aaaa-2222-aaaa-444444444444', 'ウェルカム精神がある', true, 11, NOW(), NOW()),
  ('44444444-aaaa-3333-aaaa-444444444444', 'おすすめが的確', true, 12, NOW(), NOW());

-- 評価データの作成
INSERT INTO public.evaluations (id, barista_profile_id, evaluator_id, evaluated_at, created_at)
VALUES
  -- 山田コーヒーへの評価
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  
  -- 佐藤エスプレッソへの評価
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  
  -- 田中ブリューへの評価
  ('55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- 評価詳細データの作成
INSERT INTO public.evaluation_details (id, evaluation_id, evaluation_item_id, created_at)
VALUES
  -- 山田コーヒーへの評価詳細（鈴木ユーザー）
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-aaaa-1111-aaaa-111111111111', NOW() - INTERVAL '7 days'), -- 笑顔が素敵
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-aaaa-2222-aaaa-111111111111', NOW() - INTERVAL '7 days'), -- 会話が心地よい
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '22222222-aaaa-1111-aaaa-222222222222', NOW() - INTERVAL '7 days'), -- コーヒーの知識が豊富
  
  -- 山田コーヒーへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-aaaa-2222-aaaa-222222222222', NOW() - INTERVAL '6 days'), -- ラテアートが美しい
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-aaaa-3333-aaaa-222222222222', NOW() - INTERVAL '6 days'), -- コーヒーの味が美味しい
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-aaaa-4444-aaaa-222222222222', NOW() - INTERVAL '6 days'), -- ドリンクの品質が安定している
  
  -- 佐藤エスプレッソへの評価詳細（鈴木ユーザー）
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '11111111-aaaa-1111-aaaa-111111111111', NOW() - INTERVAL '5 days'), -- 笑顔が素敵
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-aaaa-2222-aaaa-333333333333', NOW() - INTERVAL '5 days'), -- 所作が美しい
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '44444444-aaaa-3333-aaaa-444444444444', NOW() - INTERVAL '5 days'), -- おすすめが的確
  
  -- 佐藤エスプレッソへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '11111111-aaaa-2222-aaaa-111111111111', NOW() - INTERVAL '4 days'), -- 会話が心地よい
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '22222222-aaaa-3333-aaaa-222222222222', NOW() - INTERVAL '4 days'), -- コーヒーの味が美味しい
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '22222222-aaaa-4444-aaaa-222222222222', NOW() - INTERVAL '4 days'), -- ドリンクの品質が安定している
  
  -- 田中ブリューへの評価詳細（鈴木ユーザー）
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '22222222-aaaa-2222-aaaa-222222222222', NOW() - INTERVAL '3 days'), -- ラテアートが美しい
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '22222222-aaaa-3333-aaaa-222222222222', NOW() - INTERVAL '3 days'), -- コーヒーの味が美味しい
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '33333333-aaaa-1111-aaaa-333333333333', NOW() - INTERVAL '3 days'), -- 提供がスピーディー
  
  -- 田中ブリューへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '22222222-aaaa-1111-aaaa-222222222222', NOW() - INTERVAL '2 days'), -- コーヒーの知識が豊富
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '22222222-aaaa-4444-aaaa-222222222222', NOW() - INTERVAL '2 days'), -- ドリンクの品質が安定している
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '44444444-aaaa-3333-aaaa-444444444444', NOW() - INTERVAL '2 days'); -- おすすめが的確

-- お気に入りデータの作成
INSERT INTO public.favorites (id, user_id, barista_profile_id, created_at, updated_at, anonymous_id)
VALUES
  -- 鈴木ユーザーのお気に入り
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NULL),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NULL),
  
  -- 小林ユーザーのお気に入り
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NULL),
  
  -- 匿名ユーザーのお気に入り
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'anonymous-123456'),
  (gen_random_uuid(), NULL, 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'anonymous-123456');

-- チップデータの作成
INSERT INTO public.tips (id, barista_profile_id, sender_id, amount, sent_at, payment_info, message, created_at, updated_at)
VALUES
  -- 山田コーヒーへのチップ
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    500,
    NOW() - INTERVAL '6 days',
    'クレジットカード決済',
    'とても美味しいコーヒーをありがとうございました！',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    1000,
    NOW() - INTERVAL '5 days',
    'クレジットカード決済',
    'エチオピアのコーヒーが素晴らしかったです。また来ます！',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  
  -- 佐藤エスプレッソへのチップ
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    700,
    NOW() - INTERVAL '4 days',
    'クレジットカード決済',
    'ラテアートが素敵でした！',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '55555555-5555-5555-5555-555555555555',
    1500,
    NOW() - INTERVAL '3 days',
    'クレジットカード決済',
    'いつも丁寧な接客をありがとうございます',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  
  -- 田中ブリューへのチップ
  (
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    600,
    NOW() - INTERVAL '2 days',
    'クレジットカード決済',
    '自家焙煎の香りが素晴らしかったです',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '55555555-5555-5555-5555-555555555555',
    1200,
    NOW() - INTERVAL '1 day',
    'クレジットカード決済',
    '季節のブレンドが本当に美味しかったです！また来ます',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );
