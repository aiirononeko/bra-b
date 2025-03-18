# Lambda実行ロール
resource "aws_iam_role" "lambda" {
  name = "${var.app_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-${var.environment}-lambda-role"
  }
}

# Lambda基本ポリシー（CloudWatchログ出力権限）
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda VPC接続ポリシー
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda関数のデプロイパッケージパス
locals {
  lambda_package_path = "../app/backend/bin/lambda.zip"
}

# Lambda関数
resource "aws_lambda_function" "api" {
  function_name = "${var.app_name}-${var.environment}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "bootstrap"
  runtime       = "provided.al2"
  filename      = local.lambda_package_path
  timeout       = 30 # 30秒
  memory_size   = 256
  architectures = ["x86_64"]

  # VPC設定
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.security_group_id]
  }

  # 環境変数
  environment {
    variables = {
      DB_HOST      = split(":", var.db_endpoint)[0]
      DB_PORT      = var.db_port
      DB_USER      = var.db_username
      DB_PASSWORD  = var.db_password
      DB_NAME      = var.db_name
      DB_SSLMODE   = "disable"
      ENVIRONMENT  = var.environment
      # 本番環境ではAUTO_MIGRATEは初回デプロイ時のみtrueに設定
      AUTO_MIGRATE = var.environment == "prod" ? "false" : "true"
      # 本番環境ではデバッグを無効化
      DB_DEBUG     = var.environment == "prod" ? "false" : "true"
    }
  }

  # ソースコードが変更された場合のみ再デプロイ
  source_code_hash = fileexists(local.lambda_package_path) ? filebase64sha256(local.lambda_package_path) : null

  tags = {
    Name = "${var.app_name}-${var.environment}-api"
  }
}

# CloudWatchロググループ
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "${var.app_name}-${var.environment}-lambda-logs"
  }
} 