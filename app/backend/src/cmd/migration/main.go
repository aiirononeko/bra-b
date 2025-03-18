package main

import (
	"log"
	"os"

	"github.com/aiirononeko/bra-b/app/backend/src/externals/db"
)

func main() {
	// データベース接続
	postgres, err := db.NewPostgresDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() {
		if err := postgres.Close(); err != nil {
			log.Printf("Failed to close database connection: %v", err)
		}
	}()

	// マイグレーションを実行
	if err := db.RunMigration(postgres); err != nil {
		log.Fatalf("Migration failed: %v", err)
		os.Exit(1)
	}

	// 初期データを投入
	if err := db.SeedInitialData(postgres); err != nil {
		log.Fatalf("Seeding initial data failed: %v", err)
		os.Exit(1)
	}

	log.Println("Migration and seeding completed successfully")
}
