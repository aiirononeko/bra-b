# バックエンドアプリケーション (Hono + Cloudflare Workers)

## 概要

バリスタファン構築サービスのバックエンド API を提供します。Hono フレームワークを使用し、Cloudflare Workers 上で動作するサーバーレスアプリケーションとして実装されています。データストレージには Cloudflare D1 を使用しています。

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Hono
- **実行環境**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite 互換)
- **ORM**: Prisma (v6.5.0) with Driver Adapters
- **認証**: Better Auth
- **バリデーション**: Zod
- **ID 生成**: UUID v4

## アーキテクチャ

ドメイン駆動設計（DDD）とレイヤードアーキテクチャに基づいて実装されています。

### Prisma の導入について

v1.0.0 より ORM を Drizzle から Prisma に移行しました。Prisma Driver Adapter を使用することで、Cloudflare D1 データベースをサポートしています。主な変更点：

- `@prisma/adapter-d1`パッケージを導入して Cloudflare D1 との互換性を確保
- `driverAdapters`プレビュー機能を有効化
- 環境に応じた初期化ロジックの実装（ローカル開発環境と Production 環境）
- リポジトリパターンを維持しながら Prisma クライアントを使用するよう実装

### Prisma を使用する際の注意点

- 必ず`getPrismaClient`関数を使用してクライアントを取得する
- Cloudflare Workers 環境では自動的に D1 アダプターが使用される
- ローカル開発環境では SQLite に直接接続する標準の Prisma クライアントが使用される
- スキーマ変更時は`prisma migrate`コマンドを使用する

### レイヤー構成

1. **ドメインレイヤー**

   - エンティティ (domain/entities/\*): ビジネスロジックの中心となるオブジェクト
   - バリューオブジェクト (domain/value-objects/\*): 不変の値オブジェクト（ID 等）
   - リポジトリインターフェース (domain/repositories/\*): データアクセスの抽象化

2. **アプリケーションレイヤー**

   - ユースケース (application/usecase/\*): ビジネスロジックの実行とオーケストレーション

3. **インフラストラクチャレイヤー**

   - リポジトリ実装 (infrastructure/repositories/\*): データベースアクセスの具体的実装
   - Prisma クライアント (infrastructure/prisma.ts): Prisma クライアントの初期化と管理
   - DB スキーマ定義 (prisma/schema.prisma): Prisma のスキーマ定義

4. **プレゼンテーションレイヤー**

   - ルート定義 (presentation/routes/\*): API エンドポイント
   - ミドルウェア (presentation/middlewares/\*): 認証や共通処理
   - アプリケーション構成 (presentation/app.ts): Hono アプリケーションの構成

## 実装されている API

以下の API エンドポイントが実装されています：

- `GET /baristas`: バリスタ一覧を取得
- `GET /baristas/:id`: 特定のバリスタ詳細を取得
- `POST /baristas`: 新しいバリスタを作成
- `PATCH /baristas/:id`: バリスタ情報を更新（認証機能により本人確認を実施）

今後、以下の API エンドポイントを実装予定：

- `GET /baristas/:id/evaluations`: バリスタの評価一覧を取得
- `POST /baristas/:id/evaluations`: バリスタの評価を作成
- `GET /baristas/:id/tips`: バリスタが受け取ったチップ一覧を取得
- `POST /baristas/:id/tips`: バリスタにチップを送る
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
├── prisma/                 # Prisma関連
│   └── schema.prisma       # Prismaのスキーマ定義
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
│   ├── prisma.ts           # Prismaクライアント初期化
│   └── repositories/       # リポジトリ実装
│       └── prisma-barista-repository.ts # Prisma実装
├── presentation/           # プレゼンテーションレイヤー
│   ├── middlewares/        # ミドルウェア
│   │   ├── auth.ts         # 認証ミドルウェア
│   │   ├── prisma.ts       # Prismaミドルウェア
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

# Prismaクライアント生成
pnpm prisma generate

# 開発サーバーの起動
pnpm dev

# テストの実行
pnpm test

# デプロイ
pnpm deploy
```

## マイグレーション

データベースのマイグレーションは Prisma Migrate を使用して管理しています：

```bash
# D1用マイグレーションファイルの生成
pnpm wrangler d1 migrations create brab_db <マイグレーション名>

# schema.prismaの内容をマイグレーションファイルに反映
pnpm prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/<生成したマイグレーションファイル名>

# 本番環境へのマイグレーション適用
pnpm wrangler d1 migrations apply brab_db --remote
```

## Cloudflare D1 との連携

Cloudflare D1 データベースと Prisma を連携するために、`@prisma/adapter-d1`を使用しています。このアダプターにより、Prisma クライアントが Cloudflare D1 データベースと互換性を持ちます。

ローカル開発環境では従来の SQLite ベースの Prisma クライアントが使用され、Cloudflare Workers 環境では D1 アダプターが自動的に適用されます。これにより、開発からデプロイまでシームレスな体験が可能になっています。

## 今後の開発計画

1. 評価・チップ関連 API の実装
2. テストの追加
3. エラーハンドリングの強化
4. パフォーマンス最適化
5. ドキュメントの充実
