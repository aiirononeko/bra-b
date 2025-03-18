output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api.arn
}

output "invoke_arn" {
  description = "Invocation ARN of the Lambda function"
  value       = aws_lambda_function.api.invoke_arn
}

output "role_arn" {
  description = "ARN of the IAM role for the Lambda function"
  value       = aws_iam_role.lambda.arn
}
