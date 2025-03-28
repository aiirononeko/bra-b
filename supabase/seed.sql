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

-- 評価カテゴリの作成
INSERT INTO public.evaluation_categories (id, name, is_active, sort_order, created_at, updated_at)
VALUES
  ('11111111-1111-1111-aaaa-111111111111', '味', true, 1, NOW(), NOW()),
  ('22222222-2222-2222-aaaa-222222222222', '見た目', true, 2, NOW(), NOW()),
  ('33333333-3333-3333-aaaa-333333333333', 'サービス', true, 3, NOW(), NOW()),
  ('44444444-4444-4444-aaaa-444444444444', '雰囲気', true, 4, NOW(), NOW());

-- 評価項目の作成
INSERT INTO public.evaluation_items (id, category_id, name, is_common, is_active, sort_order, created_at, updated_at)
VALUES
  -- 味カテゴリの評価項目
  ('aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', '11111111-1111-1111-aaaa-111111111111', '酸味のバランス', true, true, 1, NOW(), NOW()),
  ('aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', '11111111-1111-1111-aaaa-111111111111', 'コクの深さ', true, true, 2, NOW(), NOW()),
  ('aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', '11111111-1111-1111-aaaa-111111111111', '後味の余韻', true, true, 3, NOW(), NOW()),
  
  -- 見た目カテゴリの評価項目
  ('bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', '22222222-2222-2222-aaaa-222222222222', 'ラテアートの美しさ', false, true, 1, NOW(), NOW()),
  ('bbbbbbbb-2222-bbbb-2222-bbbbbbbbbbbb', '22222222-2222-2222-aaaa-222222222222', '盛り付けの工夫', true, true, 2, NOW(), NOW()),
  ('bbbbbbbb-3333-bbbb-3333-bbbbbbbbbbbb', '22222222-2222-2222-aaaa-222222222222', 'カップの選択', true, true, 3, NOW(), NOW()),
  
  -- サービスカテゴリの評価項目
  ('cccccccc-1111-cccc-1111-cccccccccccc', '33333333-3333-3333-aaaa-333333333333', '知識と説明', true, true, 1, NOW(), NOW()),
  ('cccccccc-2222-cccc-2222-cccccccccccc', '33333333-3333-3333-aaaa-333333333333', '提供スピード', true, true, 2, NOW(), NOW()),
  ('cccccccc-3333-cccc-3333-cccccccccccc', '33333333-3333-3333-aaaa-333333333333', 'フレンドリーさ', true, true, 3, NOW(), NOW()),
  
  -- 雰囲気カテゴリの評価項目
  ('dddddddd-1111-dddd-1111-dddddddddddd', '44444444-4444-4444-aaaa-444444444444', '店内の居心地', true, true, 1, NOW(), NOW()),
  ('dddddddd-2222-dddd-2222-dddddddddddd', '44444444-4444-4444-aaaa-444444444444', 'BGMの選択', true, true, 2, NOW(), NOW()),
  ('dddddddd-3333-dddd-3333-dddddddddddd', '44444444-4444-4444-aaaa-444444444444', '清潔感', true, true, 3, NOW(), NOW());

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
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', NOW() - INTERVAL '7 days'), -- 酸味のバランス
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', NOW() - INTERVAL '7 days'), -- コクの深さ
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'cccccccc-1111-cccc-1111-cccccccccccc', NOW() - INTERVAL '7 days'), -- 知識と説明
  
  -- 山田コーヒーへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', NOW() - INTERVAL '6 days'), -- コクの深さ
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-2222-bbbb-2222-bbbbbbbbbbbb', NOW() - INTERVAL '6 days'), -- 盛り付けの工夫
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'dddddddd-1111-dddd-1111-dddddddddddd', NOW() - INTERVAL '6 days'), -- 店内の居心地
  
  -- 佐藤エスプレッソへの評価詳細（鈴木ユーザー）
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', NOW() - INTERVAL '5 days'), -- ラテアートの美しさ
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'cccccccc-3333-cccc-3333-cccccccccccc', NOW() - INTERVAL '5 days'), -- フレンドリーさ
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'dddddddd-3333-dddd-3333-dddddddddddd', NOW() - INTERVAL '5 days'), -- 清潔感
  
  -- 佐藤エスプレッソへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', NOW() - INTERVAL '4 days'), -- 酸味のバランス
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', NOW() - INTERVAL '4 days'), -- ラテアートの美しさ
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'cccccccc-2222-cccc-2222-cccccccccccc', NOW() - INTERVAL '4 days'), -- 提供スピード
  
  -- 田中ブリューへの評価詳細（鈴木ユーザー）
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', NOW() - INTERVAL '3 days'), -- コクの深さ
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', NOW() - INTERVAL '3 days'), -- 後味の余韻
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'dddddddd-2222-dddd-2222-dddddddddddd', NOW() - INTERVAL '3 days'), -- BGMの選択
  
  -- 田中ブリューへの評価詳細（小林ユーザー）
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'), -- 後味の余韻
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'cccccccc-1111-cccc-1111-cccccccccccc', NOW() - INTERVAL '2 days'), -- 知識と説明
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'dddddddd-1111-dddd-1111-dddddddddddd', NOW() - INTERVAL '2 days'); -- 店内の居心地

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
