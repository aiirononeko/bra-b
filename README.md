# BRA-B アプリケーション

React + TanStack Router + TanStack Query フロントエンド と Hono バックエンドによる現代的なWebアプリケーション

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

### インフラ
- Cloudflare Pages (フロントエンドホスティング)
- Cloudflare Workers (バックエンドホスティング)

## プロジェクト構造

```
bra-b/
├── app/                      # アプリケーションコード
│   ├── frontend/            # フロントエンドアプリ (React)
│   └── backend-ts/          # バックエンドAPI (Hono)
├── scripts/                 # デプロイスクリプト
│   ├── deploy-frontend.sh  # フロントエンドデプロイ
│   └── deploy-backend.sh   # バックエンドデプロイ
├── package.json            # ルートパッケージ設定
├── pnpm-workspace.yaml     # ワークスペース設定
├── turbo.json              # Turborepo設定
├── biome.json              # Biome設定
├── COMMANDS.md             # コマンドラインガイド
└── README.md               # プロジェクト概要
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
pnpm --filter=./app/backend-ts dev  # バックエンドのみ
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

## デプロイ方法

### フロントエンド (Cloudflare Pages)
```bash
# ルートディレクトリから
pnpm deploy:frontend
# または
./scripts/deploy-frontend.sh
```

### バックエンド (Cloudflare Workers)
```bash
# ルートディレクトリから
pnpm deploy:backend
# または
./scripts/deploy-backend.sh
```

より詳細なコマンドについては [COMMANDS.md](./COMMANDS.md) を参照してください。

## 開発ワークフロー

1. 機能ブランチを作成
2. コードを変更
3. `pnpm format` でコードをフォーマット
4. `pnpm lint` でリントチェック
5. `pnpm test` でテスト実行
6. `pnpm build` でビルド確認
7. PRを作成して本番ブランチにマージ
8. CIによる自動デプロイ(GitHub Actions)
