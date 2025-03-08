#!/bin/bash
set -e

# ルートディレクトリに移動
cd "$(dirname "$0")/.."

# バックエンドディレクトリに移動
cd app/backend

# 依存関係のインストール
echo "📦 Installing dependencies..."
pnpm install

# ビルドチェック
echo "🔨 Building backend..."
pnpm build

# Cloudflare Workersにデプロイ
echo "🚀 Deploying backend to Cloudflare Workers..."
pnpm run deploy

echo "✅ Backend deployment complete!"
