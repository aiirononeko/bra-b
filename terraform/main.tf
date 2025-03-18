terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # 状態ファイルをS3バックエンドで管理する場合のみ有効化
  # backend "s3" {
  #   bucket         = "bra-b-tfstate"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   dynamodb_table = "terraform-lock"
  # }

  required_version = ">= 1.0.0"
}

provider "aws" {
  region = var.aws_region

  # タグをすべてのリソースに適用
  default_tags {
    tags = {
      Project     = "bra-b"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ローカル変数
locals {
  app_name = "bra-b"
}

# VPCとネットワークモジュール
module "vpc" {
  source               = "./modules/vpc"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  environment          = var.environment
  app_name             = local.app_name
}

# RDSデータベースモジュール
module "database" {
  source            = "./modules/database"
  app_name          = local.app_name
  environment       = var.environment
  subnet_ids        = module.vpc.private_subnet_ids
  vpc_id            = module.vpc.vpc_id
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  security_group_id = module.vpc.db_security_group_id
}

# Lambda関数モジュール
module "lambda" {
  source              = "./modules/lambda"
  app_name            = local.app_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  security_group_id   = module.vpc.lambda_security_group_id
  db_endpoint         = module.database.db_endpoint
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  db_port             = module.database.db_port
}

# API Gatewayモジュール
module "api_gateway" {
  source            = "./modules/api_gateway"
  app_name          = local.app_name
  environment       = var.environment
  lambda_invoke_arn = module.lambda.invoke_arn
  lambda_name       = module.lambda.function_name
}
