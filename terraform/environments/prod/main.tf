terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # 本番環境ではリモートバックエンドを使用
  backend "s3" {
    bucket         = "bra-b-tfstate-prod"
    key            = "terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-lock-prod"
    encrypt        = true
  }

  required_version = ">= 1.0.0"
}

provider "aws" {
  region = "ap-northeast-1"
}

module "bra_b" {
  source = "../../"

  environment = "prod"
  aws_region  = "ap-northeast-1"

  # データベース設定
  db_name     = "bra_b"
  db_username = var.db_username  # 外部から設定
  db_password = var.db_password  # 外部から設定

  # ネットワーク設定
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
}
