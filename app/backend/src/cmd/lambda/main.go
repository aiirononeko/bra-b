package main

import (
	"context"
	"log"
	"os"

	"github.com/aiirononeko/bra-b/app/backend/src/externals/db"
	gormRepo "github.com/aiirononeko/bra-b/app/backend/src/externals/repositories/gorm"
	"github.com/aiirononeko/bra-b/app/backend/src/presentations"
	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	echoadapter "github.com/awslabs/aws-lambda-go-api-proxy/echo"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var echoLambda *echoadapter.EchoLambda

// 初期化処理 - Lambdaコールド起動時に1度だけ実行される
func init() {
	// データベース接続
	postgres, err := db.NewPostgresDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

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
	evaluationCategoryRepository := gormRepo.NewGormEvaluationCategoryRepository(gormDB)
	evaluationItemRepository := gormRepo.NewGormEvaluationItemRepository(gormDB)

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

	// Lambda用のアダプターを初期化
	echoLambda = echoadapter.New(e)
}

// Lambda ハンドラー関数
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Lambda実行時のコンテキストをログに出力（デバッグ用）
	log.Printf("Processing Lambda request %s\n", req.RequestContext.RequestID)

	// EchoのハンドラーにAPIGatewayのリクエストを渡す
	return echoLambda.ProxyWithContext(ctx, req)
}

func main() {
	// Lambda ハンドラーを開始
	lambda.Start(Handler)
}
