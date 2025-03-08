# コマンドライン操作ガイド

このプロジェクトでは、`turbo`と`pnpm`を使用してタスクを実行します。以下のコマンドはプロジェクトのルートディレクトリから実行できます。

## 開発

```bash
# 全てのアプリケーションの開発サーバーを起動
pnpm dev

# 特定のアプリケーションのみ開発サーバーを起動
pnpm --filter=./app/frontend dev  # フロントエンドのみ
pnpm --filter=./app/backend dev  # バックエンドのみ
```

## ビルド

```bash
# 全てのアプリケーションをビルド
pnpm build

# 特定のアプリケーションのみビルド
pnpm --filter=./app/frontend build  # フロントエンドのみ
pnpm --filter=./app/backend build  # バックエンドのみ
```

## リントとフォーマット

```bash
# 全てのコードをリント
pnpm lint

# 特定のアプリケーションのみリント
pnpm --filter=./app/frontend lint  # フロントエンドのみ
pnpm --filter=./app/backend lint  # バックエンドのみ

# 全てのコードをフォーマット
pnpm format

# Biomeで直接リント
pnpm lint:biome

# Biomeで直接フォーマット
pnpm format:biome

# フォーマットチェック（変更なし）
pnpm format:check

# リントとフォーマットを同時に適用
pnpm check
```

## テスト

```bash
# 全てのテストを実行
pnpm test

# 特定のアプリケーションのみテスト
pnpm --filter=./app/frontend test  # フロントエンドのみ
pnpm --filter=./app/backend test  # バックエンドのみ
```

## デプロイ

```bash
# 全てのアプリケーションをデプロイ
pnpm deploy

# 特定のアプリケーションのみデプロイ
pnpm deploy:frontend  # フロントエンドのみ
pnpm deploy:backend  # バックエンドのみ

# スクリプトを使ったデプロイ
./scripts/deploy-frontend.sh  # フロントエンドのデプロイ
./scripts/deploy-backend.sh  # バックエンドのデプロイ
```

## その他の便利なコマンド

```bash
# 依存関係のインストール
pnpm install

# 依存関係の更新
pnpm update

# 特定のパッケージをインストール（例: frontendワークスペースにtailwindcssをインストール）
pnpm --filter=./app/frontend add tailwindcss

# 開発中のアプリケーションをプレビュー
pnpm --filter=./app/frontend preview
```
