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
- **ID 生成**: UUID

## アーキテクチャ

ドメイン駆動設計（DDD）とレイヤードアーキテクチャに基づいて実装されています。

### レイヤー構成

1. **ドメインレイヤー**

   - エンティティ (domain/entities/\*)
   - バリューオブジェクト (domain/value-objects/\*)
   - リポジトリインターフェース (domain/repositories/\*)

2. **アプリケーションレイヤー**

   - ユースケース (application/usecase/\*)

3. **インフラストラクチャレイヤー**

   - リポジトリ実装 (infrastructure/repositories/\*)
   - DB スキーマ定義 (db/schema.ts)

4. **プレゼンテーションレイヤー**

   - ルート定義 (presentation/routes/\*)

5. **アプリケーションのエントリーポイント**
   - index.ts

## API 定義

API は型安全に定義されており、フロントエンド（React）と型定義を共有しています。

### バリスタ関連 API

```typescript
export type BaristaApi = {
  // バリスタ一覧取得
  "GET /api/baristas": {
    response: ApiResponse<BaristaListItem[]>;
  };
  // バリスタ詳細取得
  "GET /api/baristas/:id": {
    response: ApiResponse<Barista & {...}>;
    params: { id: string };
  };
  // バリスタ作成
  "POST /api/baristas": {
    response: ApiResponse<Barista>;
    request: Omit<Barista, "id" | "createdAt" | "evaluationCount">;
  };
  // バリスタ更新
  "PATCH /api/baristas/:id": {
    response: ApiResponse<Barista>;
    params: { id: string };
    request: Partial<Omit<Barista, "id" | "userId" | "createdAt" | "evaluationCount">>;
  };
};
```

## 型安全性の特徴

1. **Zod バリデーション**

   - エンティティとリクエストのバリデーションに Zod を使用
   - 型定義とバリデーションルールを一元管理

2. **バリューオブジェクト**

   - ID などの重要な値をバリューオブジェクトとして実装
   - 不変性とドメインルールのカプセル化

3. **型推論**
   - リクエスト/レスポンスの型が自動的に推論される
   - API クライアント側で型安全に使用可能

## ディレクトリ構造

```
src/
├── api-types.ts            # APIの型定義
├── auth.ts                 # 認証関連の処理
├── db/                     # データベース関連
│   └── schema.ts           # DrizzleのDBスキーマ定義
├── domain/                 # ドメインレイヤー
│   ├── entities/           # エンティティ定義
│   ├── repositories/       # リポジトリインターフェース
│   └── value-objects/      # バリューオブジェクト
├── application/            # アプリケーションレイヤー
│   └── usecase/            # ユースケース実装
├── infrastructure/         # インフラストラクチャレイヤー
│   └── repositories/       # リポジトリ実装
├── presentation/           # プレゼンテーションレイヤー
│   └── routes/             # ルート定義
├── types.ts                # 共通型定義
└── index.ts                # エントリーポイント
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
