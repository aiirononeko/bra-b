# bra-B Terraform インフラストラクチャ

本ディレクトリには、bra-B アプリケーションの AWS インフラストラクチャをコードで管理する Terraform ファイルが含まれています。Infrastructure as Code (IaC) アプローチにより、環境の一貫性を保ちながら、再現性のあるデプロイを実現します。

## アーキテクチャ概要

![アーキテクチャ図](../docs/images/architecture.png)

bra-B のインフラストラクチャは以下のコンポーネントで構成されています：

- **API Gateway**: HTTP リクエストを受け付け、Lambda 関数にルーティング
- **Lambda 関数**: Golang でビルドされたバックエンドアプリケーションを実行
- **RDS PostgreSQL**: データの永続化ストレージとして使用
- **VPC**: セキュアなネットワーク環境とプライベートサブネット
- **セキュリティグループ**: リソース間の通信ルール管理
- **CloudWatch**: ログとメトリクスの収集、監視

## ディレクトリ構造

```
terraform/
├── modules/                  # 再利用可能なモジュール
│   ├── vpc/                  # VPC、サブネット、セキュリティグループ
│   ├── database/             # RDS PostgreSQLデータベース
│   ├── lambda/               # Lambda関数と実行環境
│   └── api_gateway/          # API Gateway HTTP APIとルート
├── environments/             # 環境別設定
│   ├── dev/                  # 開発環境
│   └── prod/                 # 本番環境
├── main.tf                   # ルートモジュールとプロバイダー設定
├── variables.tf              # 変数定義
├── outputs.tf                # 出力変数
└── README.md                 # このファイル
```

## モジュールの説明

### VPC モジュール

`modules/vpc/` - ネットワークインフラストラクチャを定義

- VPC、パブリック/プライベートサブネット
- インターネットゲートウェイ、NAT ゲートウェイ
- ルートテーブル
- Lambda 関数と RDS のセキュリティグループ

### データベースモジュール

`modules/database/` - PostgreSQL データベースを定義

- RDS PostgreSQL インスタンス
- DB サブネットグループ
- パラメータグループ
- セキュリティグループ接続ルール

### Lambda モジュール

`modules/lambda/` - サーバーレス関数とその環境を定義

- Lambda 関数
- IAM ロールとポリシー
- 環境変数
- VPC 接続設定
- CloudWatch ログ

### API Gateway モジュール

`modules/api_gateway/` - API エンドポイントを定義

- HTTP API
- Lambda との統合
- ルート設定
- ログ設定
- CORS ポリシー

## 環境別設定

### 開発環境 (dev)

`environments/dev/` - 開発/テスト用の設定

- リソースサイズは小さめ（コスト削減）
- 保護機能を最小限に（開発の柔軟性確保）
- ローカル状態管理

### 本番環境 (prod)

`environments/prod/` - 実運用用の設定

- 強化されたセキュリティ設定
- S3 と DynamoDB によるリモート状態管理
- 機密情報は環境変数経由で注入

## セットアップと使用方法

### 前提条件

- Terraform v1.0.0 以上がインストールされていること
- AWS CLI がインストールされ、認証情報が設定されていること
- Go アプリケーションのビルド環境

### AWS プロファイルの設定

```bash
aws configure
# プロンプトに従ってAWSアクセスキー、シークレットキー、リージョンを入力
```

### 初回セットアップ（本番環境の場合）

1. 状態管理用の S3 バケットと DynamoDB テーブルを作成（コンソールまたは CLI で）
2. 本番環境ディレクトリのバックエンド設定を更新（必要な場合）

### デプロイ手順

総合的なデプロイには、提供されているスクリプトを使用します：

```bash
# 開発環境へのデプロイ
../scripts/deploy.sh dev

# 本番環境へのデプロイ
../scripts/deploy.sh prod
```

または、Terraform コマンドを直接使用することもできます：

```bash
# 特定の環境のディレクトリに移動
cd environments/dev

# Terraformの初期化
terraform init

# デプロイプランの確認
terraform plan

# インフラのデプロイ
terraform apply

# インフラの削除（必要時）
terraform destroy
```

## 環境変数

### 開発環境

開発環境ではコード内のデフォルト値が使用されますが、必要に応じて上書きできます。

### 本番環境

本番環境では、機密情報を環境変数として提供する必要があります：

```bash
export TF_VAR_db_username="本番DBユーザー名"
export TF_VAR_db_password="本番DBパスワード"
```

## カスタマイズ方法

### データベースサイズの変更

`modules/database/main.tf`のインスタンスクラスとストレージを編集：

```hcl
instance_class    = "db.t3.small"  # 小さいインスタンス
allocated_storage = 50             # より多くのストレージ
```

### Lambda 関数のメモリサイズとタイムアウト変更

`modules/lambda/main.tf`の設定を編集：

```hcl
memory_size = 512    # より多くのメモリ
timeout     = 60     # より長いタイムアウト（秒）
```

### 新しい環境の追加

1. `environments/`内に新しいディレクトリを作成（例：`staging/`）
2. `dev/`ディレクトリからファイルをコピーし、必要に応じて変数を調整

## トラブルシューティング

### Lambda 関数へのデプロイパッケージが見つからない

実行前に、バックエンドビルドが完了していることを確認：

```bash
cd ../app/backend
make build-lambda
make package-lambda
```

### リソースの作成権限エラー

AWS ユーザーが必要な権限を持っていることを確認：

```bash
aws iam get-user
```

### 状態ファイルの競合

リモート状態管理を設定し、状態ファイルのロックを使用してください。

## ベストプラクティス

- 本番環境のデプロイ前に、必ず`terraform plan`で変更内容を確認すること
- 機密情報はコード内に直接記述せず、環境変数または AWS Secrets Manager を使用
- 各環境のリソース命名規則を統一し、環境を識別しやすくする
- 不要なコストを避けるため、開発環境を使用しない場合は`terraform destroy`で削除
