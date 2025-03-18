FROM golang:1.24-alpine AS builder

WORKDIR /app

# 依存関係をコピーしてインストール
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/server /app/src/cmd/server/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/migration /app/src/cmd/migration/main.go

# 最終イメージ
FROM alpine:latest

WORKDIR /app

# タイムゾーンを設定
RUN apk --no-cache add tzdata
ENV TZ=Asia/Tokyo

# バイナリをコピー
COPY --from=builder /app/bin/server /app/server
COPY --from=builder /app/bin/migration /app/migration

# ポートを公開
EXPOSE 8080

# サーバーを起動
CMD ["/app/server"]
