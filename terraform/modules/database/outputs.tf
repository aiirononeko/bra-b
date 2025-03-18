output "db_endpoint" {
  description = "The connection endpoint for the database"
  value       = aws_db_instance.postgres.endpoint
}

output "db_port" {
  description = "The port the database is listening on"
  value       = aws_db_instance.postgres.port
}

output "db_address" {
  description = "The hostname of the database instance"
  value       = aws_db_instance.postgres.address
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.postgres.db_name
}

output "db_username" {
  description = "The username for the database"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}
