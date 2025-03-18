# API Gateway v2 (HTTP API)
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.app_name}-${var.environment}-api"
  protocol_type = "HTTP"
  description   = "${var.app_name} API for ${var.environment} environment"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    max_age       = 300
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-api"
  }
}

# Lambda統合
resource "aws_apigatewayv2_integration" "lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# デフォルトルート
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# すべてのメソッドとパスに対するプロキシルート
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# 特定のAPIルート
resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# ステージ設定
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      path           = "$context.path"
      integrationLatency = "$context.integrationLatency"
      responseLatency    = "$context.responseLatency"
      error              = "$context.error.message"
    })
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-stage"
  }
}

# CloudWatch ログ
resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/api-gw/${var.app_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "${var.app_name}-${var.environment}-api-logs"
  }
}

# Lambda呼び出し権限
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# ドメイン名設定（必要に応じて追加）
# resource "aws_apigatewayv2_domain_name" "api" {
#   domain_name = "api.${var.domain_name}"
#
#   domain_name_configuration {
#     certificate_arn = aws_acm_certificate.api.arn
#     endpoint_type   = "REGIONAL"
#     security_policy = "TLS_1_2"
#   }
#
#   tags = {
#     Name = "${var.app_name}-${var.environment}-domain"
#   }
# }
#
# resource "aws_apigatewayv2_api_mapping" "api" {
#   api_id      = aws_apigatewayv2_api.api.id
#   domain_name = aws_apigatewayv2_domain_name.api.id
#   stage       = aws_apigatewayv2_stage.default.id
# }
