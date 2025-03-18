.PHONY: build run clean test migrate build-lambda package-lambda dev dev-server dev-lambda check-db-container

# デフォルトのターゲット
all: build

# 開発環境セットアップと起動
dev:
	@echo "\033[0;34m開発環境を起動します...\033[0m"
	@echo "\033[0;34m実行モードを選択:\033[0m"
	@echo "\033[0;32m1. サーバー (ホットリロード付き)\033[0m"
	@echo "\033[0;32m2. Lambda (ローカルテスト)\033[0m"
	@read -p "選択してください (1/2): " mode_choice; \
	if [ "$$mode_choice" = "1" ]; then \
		$(MAKE) dev-server; \
	elif [ "$$mode_choice" = "2" ]; then \
		$(MAKE) dev-lambda; \
	else \
		echo "\033[0;31m不正な選択です。1または2を選択してください。\033[0m"; \
		exit 1; \
	fi

# DBコンテナの状態確認と起動
check-db-container:
	@echo "\033[0;34mPostgreSQLコンテナの状態を確認しています...\033[0m"
	@if [ "$$(docker ps -q -f name=brab-postgres)" ]; then \
		echo "\033[0;32mPostgreSQLコンテナは既に実行中です。\033[0m"; \
	else \
		echo "\033[1;33mPostgreSQLコンテナを起動しています...\033[0m"; \
		docker-compose -f docker-compose.dev.yml up -d; \
		echo "\033[0;34mPostgreSQLが起動するのを待っています...\033[0m"; \
		sleep 5; \
	fi

# 開発サーバーモード
dev-server: check-db-container migrate
	@echo "\033[0;34mサーバーモードで起動しています...\033[0m"
	AUTO_MIGRATE=true go run src/cmd/server/main.go

# 開発Lambda実行モード
dev-lambda: check-db-container migrate build-lambda
	@echo "\033[0;34mLambda関数をビルドしています...\033[0m"
	@if command -v sam &> /dev/null; then \
		echo "\033[0;34mAWS SAM Localを使ってLambda関数をローカルで実行しています...\033[0m"; \
		echo "\033[1;33mAPIは http://localhost:3000/ で公開されます\033[0m"; \
		sam local start-api --skip-pull-image; \
	else \
		echo "\033[0;31mAWS SAM CLIがインストールされていないため、Lambda関数をローカルで実行できません。\033[0m"; \
		echo "\033[1;33mインストール方法: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html\033[0m"; \
	fi

# ビルド
build-lambda:
	GOOS=linux GOARCH=amd64 go build -o bin/lambda src/cmd/lambda/main.go

# Lambda用デプロイパッケージ作成
package-lambda: build-lambda
	zip -j bin/lambda.zip bin/lambda

# マイグレーションビルド
build-migration:
	go build -o bin/migration src/cmd/migration/main.go

# マイグレーション実行
migrate: build-migration
	@echo "\033[0;34mデータベースマイグレーションを実行しています...\033[0m"
	AUTO_MIGRATE=true ./bin/migration

# 開発サーバー起動
run:
	AUTO_MIGRATE=true go run src/cmd/server/main.go

# テスト
test:
	go test -v ./...

# クリーン
clean:
	rm -rf bin/

# Dockerイメージをビルド
docker-build:
	docker build -t bra-b-backend .

# Dockerコンテナを起動
docker-run:
	docker run -p 8080:8080 -e AUTO_MIGRATE=true bra-b-backend

# 依存関係の更新
mod:
	go mod tidy
