package main

import (
	"log"
	"os"

	"github.com/aiirononeko/bra-b/app/backend/src/externals/db"
	gormRepo "github.com/aiirononeko/bra-b/app/backend/src/externals/repositories/gorm"
	"github.com/aiirononeko/bra-b/app/backend/src/presentations"
	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	// データベースマイグレーション
	if os.Getenv("AUTO_MIGRATE") == "true" {
		if err := db.RunMigration(postgres); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Database migration completed")

		// 初期データを投入
		if err := db.SeedInitialData(postgres); err != nil {
			log.Fatalf("Seeding initial data failed: %v", err)
		}
		log.Println("Initial data seeding completed")
	}

	// リポジトリの初期化
	gormDB := postgres.DB()
	// userRepository := gormRepo.NewGormUserRepository(gormDB)
	// profileRepository := gormRepo.NewGormProfileRepository(gormDB)
	// evaluationRepository := gormRepo.NewGormEvaluationRepository(gormDB)
	// evaluationDetailRepository := gormRepo.NewGormEvaluationDetailRepository(gormDB)
	evaluationCategoryRepository := gormRepo.NewGormEvaluationCategoryRepository(gormDB)
	evaluationItemRepository := gormRepo.NewGormEvaluationItemRepository(gormDB)
	// tipRepository := gormRepo.NewGormTipRepository(gormDB)
	// favoriteRepository := gormRepo.NewGormFavoriteRepository(gormDB)

	// クエリの初期化
	evaluationQuery := queries.NewEvaluationQuery(
		evaluationCategoryRepository,
		evaluationItemRepository,
	)

	// ハンドラーの初期化
	evaluationHandler := presentations.NewEvaluationHandler(evaluationQuery)

	// Echo インスタンスを作成
	e := echo.New()

	// ミドルウェアを設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ルートの設定
	e.GET("/", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"message": "Welcome to bra-B API",
		})
	})

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})

	// 評価関連のルートを登録
	evaluationHandler.RegisterRoutes(e)

	// ポート番号を環境変数から取得（デフォルトは8080）
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// サーバーを起動
	e.Logger.Fatal(e.Start(":" + port))
}
