package db

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// PostgresDB はPostgreSQLデータベースの接続管理を担当します
type PostgresDB struct {
	db *gorm.DB
}

// NewPostgresDB は新しいPostgreSQLデータベース接続を作成します
func NewPostgresDB() (*PostgresDB, error) {
	// 環境変数からDB設定を取得
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "bra_b")
	sslmode := getEnv("DB_SSLMODE", "disable")

	// 接続文字列を構築
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// GORMロガーの設定
	logLevel := logger.Error
	if getEnv("DB_DEBUG", "false") == "true" {
		logLevel = logger.Info
	}

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	}

	// データベースに接続
	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// コネクションプールの設定
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database: %w", err)
	}

	// 最大接続数の設定
	maxConnections := 10
	sqlDB.SetMaxOpenConns(maxConnections)

	// 接続の最大アイドル時間
	sqlDB.SetMaxIdleConns(maxConnections)

	// 接続のライフタイム
	sqlDB.SetConnMaxLifetime(time.Hour)

	return &PostgresDB{db: db}, nil
}

// DB はGORMのDBインスタンスを返します
func (p *PostgresDB) DB() *gorm.DB {
	return p.db
}

// Close はデータベース接続を閉じます
func (p *PostgresDB) Close() error {
	sqlDB, err := p.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// AutoMigrate はデータベースのマイグレーションを実行します
func (p *PostgresDB) AutoMigrate(models ...interface{}) error {
	return p.db.AutoMigrate(models...)
}

// getEnv は環境変数を取得し、存在しない場合はデフォルト値を返します
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
