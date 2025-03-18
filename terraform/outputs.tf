output "api_gateway_endpoint" {
  description = "API Gatewayのエンドポイント"
  value       = module.api_gateway.api_endpoint
}

output "lambda_function_name" {
  description = "Lambda関数名"
  value       = module.lambda.function_name
}

output "database_endpoint" {
  description = "RDSのエンドポイント"
  value       = module.database.db_endpoint
  sensitive   = false
}

output "database_port" {
  description = "RDSのポート"
  value       = module.database.db_port
  sensitive   = false
}
