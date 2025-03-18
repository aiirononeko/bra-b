# bra-B バックエンド

bra-B（ブラービ）のバックエンドは、Golang で実装されたドメイン駆動設計（DDD）に基づいたレイヤードアーキテクチャの API サーバーです。本番環境では AWS Lambda で実行されます。

## アプリケーションの概要

bra-B(ブラービ)は、バリスタがセルフブランディングしたり、カスタマーから客観的な評価を受けることができる Web サービスです。バリスタは bra-B を通して、自身のプロフィールを全世界に発信できます。カスタマーはバリスタのページからバリスタを評価することで、バリスタは自身の評価を確認できます。また、チップ機能によりバリスタを金銭的に応援することも可能です。

## アーキテクチャ

バックエンドは、ドメイン駆動設計（DDD）の考え方を取り入れたレイヤードアーキテクチャで構築されています。レイヤードアーキテクチャは、関心事の分離と依存関係の方向性を明確にすることで、保守性の高いコードベースを実現します。

### ディレクトリ構造

```
app/backend/
├── src/                  # ソースコード
│   ├── cmd/              # エントリーポイント
│   │   ├── lambda/       # AWS Lambda用エントリーポイント
│   │   ├── migration/    # データベースマイグレーション
│   │   └── server/       # HTTPサーバー用エントリーポイント
│   ├── domain/           # ドメイン層（ビジネスロジックとエンティティ）
│   │   ├── models/       # ドメインモデルとそのロジック
│   │   │   ├── user/     # ユーザードメイン
│   │   │   ├── profile/  # プロフィールドメイン
│   │   │   ├── evaluation/ # 評価ドメイン
│   │   │   ├── tip/      # チップドメイン
│   │   │   └── favorite/ # お気に入りドメイン
│   │   └── repositories/ # リポジトリのインターフェース
│   ├── externals/        # 外部サービスとの連携
│   │   ├── db/           # データベース接続
│   │   └── repositories/ # リポジトリの実装（GORM）
│   ├── presentations/    # プレゼンテーション層（API定義など）
│   │   ├── handlers/     # HTTPハンドラー
│   │   ├── middleware/   # ミドルウェア
│   │   └── routers/      # ルーター
│   ├── queries/          # クエリ処理（データ取得）
│   ├── shared/           # 共有モジュールやユーティリティ
│   └── workflows/        # ワークフロー（書き込み処理）
├── bin/                  # ビルド成果物
├── Makefile              # ビルドとデプロイの自動化
├── docker-compose.dev.yml # 開発環境用Docker Compose
└── Dockerfile            # 本番環境用Dockerfile
```

### レイヤー構成

バックエンドは以下の主要なレイヤーで構成されています：

1. **ドメイン層** (`domain/`): ビジネスロジックとエンティティを含む中心的な層です。

   - `models/`: ドメインモデルとそのロジックを定義します。
   - `repositories/`: データアクセスのためのインターフェースを定義します。

2. **プレゼンテーション層** (`presentations/`): HTTP リクエストと Lambda イベントの処理を担当します。

   - `handlers/`: HTTP リクエストハンドラー
   - `middleware/`: 認証などの共通処理
   - `routers/`: API エンドポイントとハンドラーのマッピング

3. **クエリ層** (`queries/`): データの読み取り処理を担当します。

4. **ワークフロー層** (`workflows/`): データの書き込み処理とビジネスフローを担当します。

5. **外部層** (`externals/`): データベースや API など外部サービスとの連携を実装します。

   - `db/`: PostgreSQL データベース接続
   - `repositories/`: リポジトリの実装（GORM による OR マッピング）

6. **共有層** (`shared/`): エラー型や共通ユーティリティを提供します。

### 依存関係の方向

依存関係は常に外側から内側に向かいます：

```
presentations → workflows/queries → domain
                                     ↑
                    externals/repositories
```

## データベースモデル

PostgreSQL データベースに以下のテーブルが定義されています：

- `users` - ユーザー情報
- `profiles` - バリスタやカスタマーのプロフィール
- `evaluation_categories` - 評価カテゴリ
- `evaluation_items` - 評価項目
- `evaluations` - バリスタへの評価
- `evaluation_details` - 評価の詳細
- `tips` - バリスタへのチップ
- `favorites` - バリスタのお気に入り登録

## 主要な API 機能

現在、以下の機能が実装されています：

- ユーザー管理（認証、ユーザー情報取得）
- プロフィール管理（バリスタプロフィール作成・更新・閲覧）
- 評価システム（バリスタ評価の登録・取得）
- チップ機能（バリスタへのチップ送信・履歴取得）
- お気に入り機能（バリスタのお気に入り登録・解除）

## 開発環境のセットアップ

### 前提条件

- Go 1.21 以上
- Docker および Docker Compose
- AWS SAM CLI（オプション、Lambda 開発用）

### 開発環境の起動方法

1. リポジトリをクローン

```bash
git clone https://github.com/aiirononeko/bra-b.git
cd bra-b/app/backend
```

2. 依存関係のインストール

```bash
go mod download
```

3. 開発環境の起動

```bash
make dev
```

このコマンドは以下の処理を行います：

- PostgreSQL データベースコンテナの起動
- データベースマイグレーションとシードデータの投入
- 実行モードの選択プロンプト表示（サーバーモードまたは Lambda モード）

4. 利用可能な実行モード

- サーバーモード：通常の HTTP サーバーとして実行されます（ホットリロード付き）
- Lambda モード：AWS SAM CLI を使用して Lambda 関数をローカルで実行します

### API エンドポイント

開発環境では以下のエンドポイントが利用可能です：

- `GET /health`: ヘルスチェック
- `GET /api/evaluation/categories`: 評価カテゴリと評価項目を取得
- その他実装済みの API エンドポイント

## ビルドとデプロイ

### ビルド

```bash
# 通常のサーバーとしてビルド
make build

# AWS Lambda用にビルド
make build-lambda

# Lambda用デプロイパッケージ作成
make package-lambda
```

### デプロイ

AWS CDK を使用して Lambda 関数と API ゲートウェイをデプロイします：

```bash
# インフラストラクチャのデプロイ
cd ../../infra
npm run deploy
```

## その他の便利なコマンド

```bash
# マイグレーションのみ実行
make migrate

# テスト実行
make test

# 依存関係の更新
make mod

# ビルド成果物のクリーン
make clean
```

## エラー処理

エラー処理は各レイヤー専用のエラー型を使用して実装されています：

- `DomainError`: ドメイン層のエラー
- `ApplicationError`: ワークフロー層のエラー
- `QueryError`: クエリ層のエラー

これにより、エラーの発生源とコンテキストが明確になります。
