//go:build !wasm
// +build !wasm

package main

import (
	"net/http"

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

	// ルートを設定
	e.GET("/", hello)
	e.GET("/api/hello", hello)

	// サーバーを起動
	e.Logger.Fatal(e.Start(":8080"))
}

// ハンドラー
func hello(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Hello, World!",
	})
}
