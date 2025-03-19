# バックエンドアプリケーション (Hono + Cloudflare Workers)

## 概要

バリスタファン構築サービスのバックエンド API を提供します。Hono フレームワークを使用し、Cloudflare Workers 上で動作するサーバーレスアプリケーションとして実装されています。データストレージには Cloudflare D1 を使用しています。

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Hono
- **実行環境**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite 互換)
- **ORM**: DrizzleORM
- **バリデーション**: Zod
- **ID 生成**: UUID v4

## アーキテクチャ

ドメイン駆動設計（DDD）とレイヤードアーキテクチャに基づいて実装されています。

### レイヤー構成

1. **ドメインレイヤー**

   - エンティティ (domain/entities/\*): ビジネスロジックの中心となるオブジェクト
   - バリューオブジェクト (domain/value-objects/\*): 不変の値オブジェクト（ID 等）
   - リポジトリインターフェース (domain/repositories/\*): データアクセスの抽象化

2. **アプリケーションレイヤー**

   - ユースケース (application/usecase/\*): ビジネスロジックの実行とオーケストレーション

3. **インフラストラクチャレイヤー**

   - リポジトリ実装 (infrastructure/repositories/\*): データベースアクセスの具体的実装
   - DB スキーマ定義 (db/schema.ts): DrizzleORM のスキーマ定義

4. **プレゼンテーションレイヤー**

   - ルート定義 (presentation/routes/\*): API エンドポイント
   - ミドルウェア (presentation/middlewares/\*): 認証や共通処理
   - アプリケーション構成 (presentation/app.ts): Hono アプリケーションの構成

## 実装されている API

以下の API エンドポイントが実装されています：

- `GET /baristas`: バリスタ一覧を取得
- `GET /baristas/:id`: 特定のバリスタ詳細を取得
- `POST /baristas`: 新しいバリスタを作成
- `PATCH /baristas/:id`: バリスタ情報を更新（現在は認証機能がないため、誰でも更新可能）

今後、以下の API エンドポイントを実装予定：

- `GET /baristas/:id/evaluations`: バリスタの評価一覧を取得
- `POST /baristas/:id/evaluations`: バリスタの評価を作成
- `GET /baristas/:id/tips`: バリスタが受け取ったチップ一覧を取得
- `POST /baristas/:id/tips`: バリスタにチップを送る
- 認証関連の API
- お気に入り関連の API

## 型安全性の特徴

1. **Zod バリデーション**

   - エンティティとリクエストのバリデーションに Zod を使用
   - 型定義とバリデーションルールを一元管理

2. **バリューオブジェクト**

   - ID などの重要な値をバリューオブジェクトとして実装
   - 不変性とドメインルールのカプセル化

3. **型共有**
   - Hono の Client 機能を使用して、フロントエンドとバックエンドで型を共有
   - API の型が自動的に推論され、型安全な API 呼び出しが可能

## 現在のディレクトリ構造

```
src/
├── db/                     # データベース関連
│   └── schema.ts           # DrizzleのDBスキーマ定義
├── domain/                 # ドメインレイヤー
│   ├── entities/           # エンティティ定義
│   │   └── barista.ts      # バリスタエンティティ
│   ├── repositories/       # リポジトリインターフェース
│   │   └── barista-repository.ts # バリスタリポジトリ
│   └── value-objects/      # バリューオブジェクト
│       └── id.ts           # ID関連のバリューオブジェクト
├── application/            # アプリケーションレイヤー
│   └── usecases/           # ユースケース実装
│       ├── get-all-baristas-usecase.ts # バリスタ一覧取得
│       ├── get-barista-by-id-usecase.ts # バリスタ詳細取得
│       ├── create-barista-usecase.ts # バリスタ作成
│       └── update-barista-usecase.ts # バリスタ更新
├── infrastructure/         # インフラストラクチャレイヤー
│   └── repositories/       # リポジトリ実装
│       └── drizzle-barista-repository.ts # Drizzle実装
├── presentation/           # プレゼンテーションレイヤー
│   ├── middlewares/        # ミドルウェア
│   │   ├── auth.ts         # 認証ミドルウェア
│   │   └── errors.ts       # エラーハンドリング
│   ├── routes/             # ルート定義
│   │   └── barista-routes.ts # バリスタ関連ルート
│   ├── app.ts              # アプリケーション構成
│   ├── common.ts           # 共通ユーティリティ
│   ├── hc.ts               # Honoクライアント型定義
│   └── index.ts            # エントリーポイント
├── auth.ts                 # 認証関連のユーティリティ
└── types.ts                # 共通型定義
```

## 開発方法

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# テストの実行
pnpm test

# デプロイ
pnpm deploy
```

## マイグレーション

データベースのマイグレーションは Drizzle Kit を使用して管理しています：

```bash
# マイグレーションの生成
pnpm drizzle-kit generate

# マイグレーションの適用
pnpm drizzle-kit push
```

## 今後の開発計画

1. 認証機能の実装
2. 評価・チップ関連 API の実装
3. テストの追加
4. エラーハンドリングの強化
5. パフォーマンス最適化
6. ドキュメントの充実
