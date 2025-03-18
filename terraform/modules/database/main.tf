# DBサブネットグループ
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.app_name}-${var.environment}-db-subnet-group"
  }
}

# RDSパラメータグループ
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.app_name}-${var.environment}-postgres-params"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-postgres-params"
  }
}

# RDSインスタンス
resource "aws_db_instance" "postgres" {
  identifier             = "${var.app_name}-${var.environment}-db"
  engine                 = "postgres"
  engine_version         = "14"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  port                   = 5432
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  parameter_group_name   = aws_db_parameter_group.postgres.name
  publicly_accessible    = false
  skip_final_snapshot    = true
  
  # 開発環境では自動バックアップを無効化
  backup_retention_period = var.environment == "prod" ? 7 : 0
  
  # 開発環境では削除保護を無効化
  deletion_protection = var.environment == "prod"

  tags = {
    Name = "${var.app_name}-${var.environment}-postgres"
  }
} 