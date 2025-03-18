package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

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
	log.Println("Lambda cold start initialization...")

	// データベース接続
	log.Println("Connecting to database...")
	postgres, err := db.NewPostgresDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connection established")

	// データベースマイグレーション
	if os.Getenv("AUTO_MIGRATE") == "true" {
		log.Println("Running database migration...")
		if err := db.RunMigration(postgres); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Database migration completed")

		// 初期データを投入
		log.Println("Seeding initial data...")
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
	// プロダクションでのデバッグ設定
	e.Debug = false
	// JSON形式でより良いエラーレスポンスを表示
	e.HTTPErrorHandler = customHTTPErrorHandler

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

	// Catch-allルートを追加（存在しないパスへのフォールバック）
	e.Any("/*", func(c echo.Context) error {
		return c.JSON(404, map[string]string{
			"error": "Route not found",
			"path":  c.Request().URL.Path,
		})
	})

	// 評価関連のルートを登録
	evaluationHandler.RegisterRoutes(e)

	// Lambda用のアダプターを初期化
	echoLambda = echoadapter.New(e)
	log.Println("Lambda initialization completed")
}

// カスタムエラーハンドラー
func customHTTPErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError
	message := "Internal Server Error"

	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		message = fmt.Sprintf("%v", he.Message)
	}

	// エラー情報のみログに出力
	log.Printf("Error: Code=%d, Message=%s, Path=%s", code, message, c.Request().URL.Path)

	err = c.JSON(code, map[string]interface{}{
		"error": message,
		"path":  c.Request().URL.Path,
	})
	if err != nil {
		log.Printf("Failed to send error response: %v", err)
	}
}

// Lambda ハンドラー関数
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Printf("Request: ID=%s, Path=%s, Method=%s",
		req.RequestContext.RequestID,
		req.Path,
		req.HTTPMethod)

	// パスの修正（APIGatewayとLambdaプロキシ統合の問題対応）
	if req.Path == "" && req.PathParameters != nil {
		if proxy, ok := req.PathParameters["proxy"]; ok {
			// パスをproxyパラメータから再構築
			if strings.HasPrefix(proxy, "api/") {
				req.Path = "/" + proxy
			} else if proxy != "" {
				req.Path = "/api/" + proxy
			}
			log.Printf("Path reconstructed to: %s", req.Path)
		}
	}

	// EchoのハンドラーにAPIGatewayのリクエストを渡す
	return echoLambda.ProxyWithContext(ctx, req)
}

func main() {
	// Lambda ハンドラーを開始
	lambda.Start(Handler)
}
