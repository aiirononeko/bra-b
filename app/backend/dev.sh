#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 環境変数を.env.devから読み込む
echo -e "${BLUE}環境変数を読み込んでいます...${NC}"
export $(grep -v '^#' .env.dev | xargs)

# DBコンテナの状態を確認
echo -e "${BLUE}PostgreSQLコンテナの状態を確認しています...${NC}"
if [ "$(docker ps -q -f name=brab-postgres)" ]; then
    echo -e "${GREEN}PostgreSQLコンテナは既に実行中です。${NC}"
else
    echo -e "${YELLOW}PostgreSQLコンテナを起動しています...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    
    # コンテナが起動するまで待機
    echo -e "${BLUE}PostgreSQLが起動するのを待っています...${NC}"
    sleep 5
fi

# データベースマイグレーションを実行
echo -e "${BLUE}データベースマイグレーションを実行しています...${NC}"
if [ ! -f bin/migration ]; then
    echo -e "${YELLOW}マイグレーションツールをビルドしています...${NC}"
    go build -o bin/migration src/cmd/migration/main.go
fi

# マイグレーションの実行
echo -e "${BLUE}マイグレーションを実行しています...${NC}"
AUTO_MIGRATE=true ./bin/migration

# サーバーモードを選択
echo -e "${BLUE}実行モードを選択:${NC}"
echo -e "${GREEN}1. サーバー (ホットリロード付き)${NC}"
echo -e "${GREEN}2. Lambda (ローカルテスト)${NC}"

read -p "選択してください (1/2): " mode_choice

if [ "$mode_choice" = "1" ]; then
    # サーバーモードで実行
    echo -e "${BLUE}サーバーモードで起動しています...${NC}"
    go run src/cmd/server/main.go
elif [ "$mode_choice" = "2" ]; then
    # Lambda用にビルドして実行
    echo -e "${BLUE}Lambda関数をビルドしています...${NC}"
    go build -o bin/lambda src/cmd/lambda/main.go
    
    # Lambda関数のローカル実行（AWS SAM Localを使用する場合）
    if command -v sam &> /dev/null; then
        echo -e "${BLUE}AWS SAM Localを使ってLambda関数をローカルで実行しています...${NC}"
        echo -e "${YELLOW}APIは http://localhost:3000/ で公開されます${NC}"
        sam local start-api --skip-pull-image
    else
        echo -e "${RED}AWS SAM CLIがインストールされていないため、Lambda関数をローカルで実行できません。${NC}"
        echo -e "${YELLOW}インストール方法: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html${NC}"
    fi
else
    echo -e "${RED}不正な選択です。1または2を選択してください。${NC}"
    exit 1
fi
