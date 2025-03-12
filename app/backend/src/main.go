//go:build !wasm
// +build !wasm

package main

import (
	"github.com/aiirononeko/bra-b/app/backend/src/externals/repositories/memory"
	"github.com/aiirononeko/bra-b/app/backend/src/presentations"
	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/aiirononeko/bra-b/app/backend/src/workflows"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Echo インスタンスを作成
	e := echo.New()

	// ミドルウェアを設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// リポジトリの初期化
	todoRepo := memory.NewInMemoryTodoRepository()

	// クエリとワークフローの初期化
	todoQuery := queries.NewTodoQuery(todoRepo)
	todoWorkflow := workflows.NewTodoWorkflow(todoRepo)

	// ハンドラーの初期化と登録
	todoHandler := presentations.NewTodoHandler(todoQuery, todoWorkflow)
	todoHandler.RegisterRoutes(e)

	// 既存のルートも維持
	e.GET("/", hello)
	e.GET("/api/hello", hello)

	// サーバーを起動
	e.Logger.Fatal(e.Start(":8080"))
}

// ハンドラー
func hello(c echo.Context) error {
	return c.JSON(200, map[string]string{
		"message": "Hello, World!",
	})
}
