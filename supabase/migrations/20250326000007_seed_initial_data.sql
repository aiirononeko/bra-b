-- Seed initial data for barista profiles

-- Note: In a real production environment, we would create users through the proper auth flow
-- For local development, we're bypassing the auth process and just inserting sample data directly

-- Insert barista profiles
INSERT INTO public.profiles (id, user_id, type, display_name, icon_url, bio, sns_links, shop_name, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'barista', '山田コーヒー', 'https://randomuser.me/api/portraits/men/1.jpg', '5年間のバリスタ経験があります。スペシャルティコーヒーが得意で、特にエチオピア産のコーヒー豆を使ったハンドドリップが好評です。', '{"instagram": "yamada_coffee", "twitter": "yamada_barista"}', 'コーヒーハウス山田', now(), now()),
  
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'barista', '佐藤エスプレッソ', 'https://randomuser.me/api/portraits/women/2.jpg', 'イタリアで修行したエスプレッソの専門家です。ラテアートにも力を入れており、カプチーノやラテの見た目も美しさにこだわっています。', '{"instagram": "sato_espresso", "twitter": "sato_latte"}', 'カフェ サトウ', now(), now()),
  
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'barista', '田中ブリュー', 'https://randomuser.me/api/portraits/men/3.jpg', '自家焙煎のスペシャリストです。コーヒー豆の選定から焙煎、抽出までのすべての工程にこだわりを持っています。季節に合わせたブレンドも好評です。', '{"instagram": "tanaka_brew", "twitter": "tanaka_coffee"}', 'ロースターズ タナカ', now(), now());

-- Insert customer profile
INSERT INTO public.profiles (id, user_id, type, display_name, icon_url, bio, created_at, updated_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'customer', 'コーヒー愛好家', 'https://randomuser.me/api/portraits/women/4.jpg', 'コーヒーを愛する一般ユーザーです。お気に入りのバリスタを見つけるために日々カフェ巡りをしています。', now(), now());

-- Insert evaluation categories
INSERT INTO public.evaluation_categories (id, name, is_active, sort_order, created_at, updated_at)
VALUES 
  ('11111111-aaaa-1111-aaaa-111111111111', '接客', true, 1, now(), now()),
  ('22222222-aaaa-2222-aaaa-222222222222', 'ドリンク品質', true, 2, now(), now()),
  ('33333333-aaaa-3333-aaaa-333333333333', 'サービス', true, 3, now(), now());

-- Insert evaluation items for categories
-- Category: 接客
INSERT INTO public.evaluation_items (id, category_id, name, is_common, is_active, sort_order, created_at, updated_at)
VALUES 
  ('11111111-bbbb-1111-bbbb-111111111111', '11111111-aaaa-1111-aaaa-111111111111', '笑顔が素敵', false, true, 1, now(), now()),
  ('22222222-bbbb-2222-bbbb-222222222222', '11111111-aaaa-1111-aaaa-111111111111', '気遣いがある', false, true, 2, now(), now()),
  ('33333333-bbbb-3333-bbbb-333333333333', '11111111-aaaa-1111-aaaa-111111111111', '丁寧な接客', false, true, 3, now(), now()),
  ('44444444-bbbb-4444-bbbb-444444444444', '11111111-aaaa-1111-aaaa-111111111111', '説明がわかりやすい', false, true, 4, now(), now()),
  ('55555555-bbbb-5555-bbbb-555555555555', '11111111-aaaa-1111-aaaa-111111111111', '会話が心地よい', false, true, 5, now(), now());

-- Category: ドリンク品質
INSERT INTO public.evaluation_items (id, category_id, name, is_common, is_active, sort_order, created_at, updated_at)
VALUES 
  ('11111111-cccc-1111-cccc-111111111111', '22222222-aaaa-2222-aaaa-222222222222', 'ラテアートが美しい', false, true, 1, now(), now()),
  ('22222222-cccc-2222-cccc-222222222222', '22222222-aaaa-2222-aaaa-222222222222', '味が素晴らしい', false, true, 2, now(), now()),
  ('33333333-cccc-3333-cccc-333333333333', '22222222-aaaa-2222-aaaa-222222222222', '温度が適切', false, true, 3, now(), now()),
  ('44444444-cccc-4444-cccc-444444444444', '22222222-aaaa-2222-aaaa-222222222222', '品質が安定している', false, true, 4, now(), now()),
  ('55555555-cccc-5555-cccc-555555555555', '22222222-aaaa-2222-aaaa-222222222222', 'ドリンクへのこだわりを感じる', false, true, 5, now(), now());

-- Category: サービス
INSERT INTO public.evaluation_items (id, category_id, name, is_common, is_active, sort_order, created_at, updated_at)
VALUES 
  ('11111111-dddd-1111-dddd-111111111111', '33333333-aaaa-3333-aaaa-333333333333', '提供がスピーディー', false, true, 1, now(), now()),
  ('22222222-dddd-2222-dddd-222222222222', '33333333-aaaa-3333-aaaa-333333333333', '注文がスムーズ', false, true, 2, now(), now()),
  ('33333333-dddd-3333-dddd-333333333333', '33333333-aaaa-3333-aaaa-333333333333', '無駄な動きがない', false, true, 3, now(), now()),
  ('44444444-dddd-4444-dddd-444444444444', '33333333-aaaa-3333-aaaa-333333333333', '丁寧な作業', false, true, 4, now(), now());

-- Common tags
INSERT INTO public.evaluation_items (id, category_id, name, is_common, is_active, sort_order, created_at, updated_at)
VALUES 
  ('11111111-eeee-1111-eeee-111111111111', null, 'またお願いしたい', true, true, 1, now(), now()),
  ('22222222-eeee-2222-eeee-222222222222', null, 'プロフェッショナル', true, true, 2, now(), now()),
  ('33333333-eeee-3333-eeee-333333333333', null, '親しみやすい', true, true, 3, now(), now());

-- Add sample evaluations for baristas
-- Evaluations for 山田コーヒー
INSERT INTO public.evaluations (id, barista_profile_id, evaluator_id, evaluated_at, created_at)
VALUES 
  ('11111111-ffff-1111-ffff-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', now() - interval '3 days', now() - interval '3 days');

-- Details for the evaluation
INSERT INTO public.evaluation_details (id, evaluation_id, evaluation_item_id, created_at)
VALUES 
  (gen_random_uuid(), '11111111-ffff-1111-ffff-111111111111', '11111111-bbbb-1111-bbbb-111111111111', now() - interval '3 days'), -- 笑顔が素敵
  (gen_random_uuid(), '11111111-ffff-1111-ffff-111111111111', '22222222-cccc-2222-cccc-222222222222', now() - interval '3 days'), -- 味が素晴らしい
  (gen_random_uuid(), '11111111-ffff-1111-ffff-111111111111', '11111111-eeee-1111-eeee-111111111111', now() - interval '3 days'); -- またお願いしたい

-- Evaluations for 佐藤エスプレッソ
INSERT INTO public.evaluations (id, barista_profile_id, evaluator_id, evaluated_at, created_at)
VALUES 
  ('22222222-ffff-2222-ffff-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', now() - interval '2 days', now() - interval '2 days');

-- Details for the evaluation
INSERT INTO public.evaluation_details (id, evaluation_id, evaluation_item_id, created_at)
VALUES 
  (gen_random_uuid(), '22222222-ffff-2222-ffff-222222222222', '11111111-cccc-1111-cccc-111111111111', now() - interval '2 days'), -- ラテアートが美しい
  (gen_random_uuid(), '22222222-ffff-2222-ffff-222222222222', '33333333-bbbb-3333-bbbb-333333333333', now() - interval '2 days'), -- 丁寧な接客
  (gen_random_uuid(), '22222222-ffff-2222-ffff-222222222222', '22222222-eeee-2222-eeee-222222222222', now() - interval '2 days'); -- プロフェッショナル

-- Add favorites
INSERT INTO public.favorites (id, user_id, barista_profile_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '1 day', now() - interval '1 day');

-- Add tips
INSERT INTO public.tips (id, barista_profile_id, sender_id, amount, sent_at, message, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 500, now() - interval '12 hours', 'いつも美味しいコーヒーをありがとうございます！', now() - interval '12 hours', now() - interval '12 hours');
