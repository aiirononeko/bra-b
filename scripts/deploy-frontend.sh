#!/bin/bash
set -e

# ルートディレクトリに移動
cd "$(dirname "$0")/.."

# フロントエンドディレクトリに移動
cd app/frontend

# 依存関係のインストール確認
echo "📦 Installing dependencies..."
pnpm install

# ビルド実行
echo "🔨 Building frontend..."
pnpm build

# Cloudflare Pagesにデプロイ
echo "🚀 Deploying to Cloudflare Pages..."
pnpm deploy

echo "✅ Frontend deployment complete!"
