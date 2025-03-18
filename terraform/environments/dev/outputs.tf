output "api_gateway_endpoint" {
  description = "API Gatewayのエンドポイント"
  value       = module.bra_b.api_gateway_endpoint
}

output "lambda_function_name" {
  description = "Lambda関数名"
  value       = module.bra_b.lambda_function_name
}

output "database_endpoint" {
  description = "RDSのエンドポイント"
  value       = module.bra_b.database_endpoint
}

output "database_port" {
  description = "RDSのポート"
  value       = module.bra_b.database_port
}
