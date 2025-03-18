terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.0.0"
}

provider "aws" {
  region = "ap-northeast-1"
}

module "bra_b" {
  source = "../../"

  environment = "dev"
  aws_region  = "ap-northeast-1"

  # データベース設定
  db_name     = "bra_b"
  db_username = "postgres"
  db_password = "postgres"  # 開発環境用。本番では外部から注入する

  # ネットワーク設定（必要に応じてカスタマイズ）
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
}
