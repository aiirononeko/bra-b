variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, stg, prod)"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invocation ARN of the Lambda function"
  type        = string
}

variable "lambda_name" {
  description = "Name of the Lambda function"
  type        = string
}

# ドメイン設定が必要な場合は有効化
# variable "domain_name" {
#   description = "Domain name for API Gateway"
#   type        = string
# }
