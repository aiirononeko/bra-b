# bra-B

bra-B（ブラービ）は、バリスタのためのブランディングツールです。
カスタマーにより客観的に評価されることで、自身のスキルを可視化し、バリスタとしてのキャリアを支援します。

## 技術スタック

### フロントエンド
- React (UI ライブラリ)
- TanStack Router (型安全なルーティング)
- TanStack Query (サーバー状態管理)
- Vite (ビルドツール)

### バックエンド
- Hono (高速なWebフレームワーク)
- Cloudflare Workers (エッジコンピューティング)

### 開発ツール
- Biome (リンターとフォーマッター)
- pnpm (パッケージマネージャー)
- Turborepo (モノレポ管理)
- TypeScript (型システム)
- Vitest (テストフレームワーク)

### インフラ
- Cloudflare Pages (フロントエンドホスティング)
- Cloudflare Workers (バックエンドホスティング)
- GitHub Actions (CI/CD)

## プロジェクト構造

```
bra-b/
├── app/                          # アプリケーションコード
│   ├── frontend/                 # フロントエンドアプリ (React)
│   │   ├── src/                  # ソースコード
│   │   ├── public/               # 静的ファイル
│   │   │   └── _routes.json      # SPAルーティング設定
│   │   └── wrangler.toml         # Cloudflare Pages設定
│   └── backend/                  # バックエンドAPI (Hono)
│       ├── src/                  # ソースコード
│       │   ├── index.ts          # エントリーポイント
│       │   ├── utils/            # ユーティリティ関数
│       │   └── tests/            # テストファイル
│       ├── wrangler.toml         # Cloudflare Workers設定
│       └── vitest.config.ts      # Vitestの設定
├── .github/                      # GitHub関連ファイル
│   └── workflows/                # GitHub Actionsワークフロー
│       ├── deploy-frontend.yml   # フロントエンドデプロイ
│       ├── deploy-backend.yml    # バックエンドデプロイ
│       ├── lint-format.yml       # リント・フォーマットチェック
│       └── test.yml              # テスト実行
├── package.json                  # ルートパッケージ設定
├── pnpm-workspace.yaml           # ワークスペース設定
├── turbo.json                    # Turborepo設定
├── biome.json                    # Biome設定
├── COMMANDS.md                   # コマンドラインガイド
└── README.md                     # プロジェクト概要
```

## 開発方法

### 必要な環境
- Node.js 18.x+
- pnpm 10.x+

### セットアップ
```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動
```bash
# フロントエンドとバックエンドの両方を起動
pnpm dev

# または個別に起動
pnpm --filter=./app/frontend dev    # フロントエンドのみ
pnpm --filter=./app/backend dev  # バックエンドのみ
```

### リンティングとフォーマット
```bash
# リンティング
pnpm lint

# フォーマット
pnpm format

# リントとフォーマットを同時に適用
pnpm check
```

### テスト実行
```bash
# 全テストを実行
pnpm test

# バックエンドのテストのみ実行
pnpm test:backend

# カバレッジレポート付きでテスト実行
pnpm test:backend:coverage

# UI モードでテスト実行（開発時）
cd app/backend && pnpm test:ui
```

## デプロイ方法

### フロントエンド (Cloudflare Pages)
```bash
# ルートディレクトリから
pnpm deploy:frontend
```

デプロイURL: `https://bra-b.com`

#### SPAルーティング
フロントエンドはSPA（Single Page Application）として設定されており、クライアントサイドルーティングが有効です。これは `public/_routes.json` ファイルで設定されています。

### バックエンド (Cloudflare Workers)
```bash
# ルートディレクトリから
pnpm deploy:backend
```

デプロイURL: `https://api.bra-b.com`

より詳細なコマンドについては [COMMANDS.md](./COMMANDS.md) を参照してください。

## CI/CD パイプライン

このプロジェクトでは、GitHub Actionsを使用して以下のCI/CDパイプラインが構成されています：

### 1. リントとフォーマットチェック
- すべてのプッシュとプルリクエストで実行
- コードスタイルとルールの遵守を確認

### 2. テスト実行
- すべてのプッシュとプルリクエストで実行
- カバレッジレポートも生成

### 3. フロントエンドデプロイ
- mainブランチへのプッシュ時に実行
- app/frontend ディレクトリの変更があった場合のみトリガー

### 4. バックエンドデプロイ
- mainブランチへのプッシュ時に実行
- app/backend ディレクトリの変更があった場合のみトリガー

## 開発ワークフロー

1. 機能ブランチを作成
2. コードを変更
3. `pnpm format` でコードをフォーマット
4. `pnpm lint` でリントチェック
5. `pnpm test` でテスト実行
6. `pnpm build` でビルド確認
7. PRを作成して本番ブランチにマージ
8. CIによる自動デプロイ(GitHub Actions)
