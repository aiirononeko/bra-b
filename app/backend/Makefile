.PHONY: build run clean test migrate build-lambda package-lambda

# デフォルトのターゲット
all: build

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
