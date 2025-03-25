# ☕️ bra-B (ブラービ)

バリスタ個人がファンを獲得し、客観的評価とチップを受け取れるサービスです。

## 🚀 サービスの目的・特徴

- バリスタ個人のプロフェッショナルな価値を可視化し、ファンを作れるようにする
- カスタマーが 10 秒以内の手軽な評価でバリスタを応援できる
- バリスタは評価とチップにより自己ブランディングと金銭的メリットを得られる

## 🗂 技術スタック・アーキテクチャ

| 項目           | 技術選定              |
| -------------- | --------------------- |
| フレームワーク | Next.js (App Router)  |
| バックエンド   | API Routes (Next.js)  |
| フロントエンド | React                 |
| データベース   | Supabase (PostgreSQL) |
| 認証           | Supabase Auth         |
| ストレージ     | Supabase Storage      |
| デプロイ       | Vercel                |

## 🔨 設計方針

- ドメイン駆動設計（DDD）＋ レイヤードアーキテクチャを採用
- App Router によるサーバーコンポーネントを活用した効率的なレンダリング

## 🗃 データモデル（ER 図）

```mermaid
erDiagram

User ||--o{ Profile : has
User ||--o{ Evaluation : evaluates
User ||--o{ Tip : gives
User ||--o{ Favorite : saves

Profile ||--o{ Evaluation : receives
Profile ||--o{ Tip : receives
Profile ||--o{ Favorite : saved_by

Evaluation ||--o{ EvaluationDetail : has
EvaluationDetail }o--|| EvaluationItem : references
EvaluationItem }o--|| EvaluationCategory : belongs_to

User {
  UUID id PK
  string email
  boolean email_verified
  datetime created_at
  datetime updated_at
  datetime deleted_at
}

Profile {
  UUID id PK
  UUID user_id FK
  string type
  string display_name
  string icon_url
  string bio
  string sns_links
  string shop_name
  datetime created_at
}

Evaluation {
  UUID id PK
  UUID barista_profile_id FK
  UUID evaluator_user_id FK
  datetime evaluated_at
}

EvaluationDetail {
  UUID id PK
  UUID evaluation_id FK
  UUID evaluation_item_id FK
}

EvaluationItem {
  UUID id PK
  UUID category_id FK
  string name
  bool is_common
  bool is_active
  int sort_order
  datetime created_at
}

EvaluationCategory {
  UUID id PK
  string name
  bool is_active
  int sort_order
  datetime created_at
}

Tip {
  UUID id PK
  UUID barista_profile_id FK
  UUID sender_user_id FK
  int amount
  datetime sent_at
  string payment_info
  string message
  string stripe_payment_intent_id
}

Favorite {
  UUID id PK
  UUID user_id FK
  UUID barista_profile_id FK
  datetime created_at
}
```

## ✅ 評価システム設計

- 数値評価・自由記述はなし
- カテゴリ＋タグ選択のシンプルな評価（10 秒以内で完結）
- 自由記述はチップ送信時のみ可能

### 📌 評価カテゴリ・評価タグ

| カテゴリ     | 評価タグ                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------ |
| 接客         | 笑顔が素敵, 気遣いがある, 丁寧な接客, 説明がわかりやすい, 会話が心地よい                         |
| ドリンク品質 | ラテアートが美しい, 味が素晴らしい, 温度が適切, 品質が安定している, ドリンクへのこだわりを感じる |
| サービス     | 提供がスピーディー, 注文がスムーズ, 無駄な動きがない, 丁寧な作業                                 |

| 共通タグ（任意選択）                               |
| -------------------------------------------------- |
| またお願いしたい, プロフェッショナル, 親しみやすい |

## 🔑 認証

- Supabase Auth を使用
- 以下の認証方法を提供:
  - マジックリンク
  - Google アカウント連携

## 🛠 API 設計

- Next.js App Router の API Routes を使用
- Supabase クライアントを利用してデータ操作を行う

## 📦 データストレージ

- Supabase Storage を使用してユーザープロフィール画像などを管理

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発環境の起動
pnpm dev
```

## 特徴

- Next.js App Router によるサーバーコンポーネントの活用
- Supabase による認証・データベース・ストレージの統合管理
- TypeScript による型安全性の確保
- レスポンシブデザインによるマルチデバイス対応
