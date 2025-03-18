#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}bra-B バックエンドデプロイスクリプト${NC}"
echo -e "${BLUE}============================${NC}"

# デプロイ環境の確認
if [ "$1" == "prod" ]; then
  ENV="prod"
  echo -e "${YELLOW}本番環境にデプロイします${NC}"
else
  ENV="dev"
  echo -e "${GREEN}開発環境にデプロイします${NC}"
fi

# Lambda関数のビルドとパッケージング
echo -e "${BLUE}Lambda関数をビルドしています...${NC}"
cd ../app/backend
make package-lambda

if [ $? -ne 0 ]; then
  echo -e "${RED}Lambda関数のビルドに失敗しました${NC}"
  exit 1
fi

echo -e "${GREEN}Lambda関数のビルドが完了しました${NC}"

# Terraformディレクトリに戻る
cd ../../terraform

# Terraformの初期化
echo -e "${BLUE}Terraformを初期化しています...${NC}"
terraform init

if [ $? -ne 0 ]; then
  echo -e "${RED}Terraformの初期化に失敗しました${NC}"
  exit 1
fi

# Terraformプランの表示
echo -e "${BLUE}デプロイプランを表示します...${NC}"
terraform plan -var-file="environments/${ENV}/terraform.tfvars"

if [ $? -ne 0 ]; then
  echo -e "${RED}Terraformプランの生成に失敗しました${NC}"
  exit 1
fi

# 確認
echo -e "${YELLOW}上記のプランでインフラストラクチャを変更します。${NC}"
read -p "続行しますか？ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo -e "${BLUE}デプロイをキャンセルしました${NC}"
  exit 0
fi

# Terraformの適用
echo -e "${BLUE}インフラストラクチャをデプロイしています...${NC}"
terraform apply -var-file="environments/${ENV}/terraform.tfvars" -auto-approve

if [ $? -ne 0 ]; then
  echo -e "${RED}デプロイに失敗しました${NC}"
  exit 1
fi

echo -e "${GREEN}デプロイが完了しました${NC}"
