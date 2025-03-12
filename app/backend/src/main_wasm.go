//go:build wasm
// +build wasm

package main

import (
	"syscall/js"
)

func main() {
	// WebAssembly 環境向けのグローバル関数を公開
	js.Global().Set("getHelloMessage", js.FuncOf(getHelloMessage))

	// WebAssembly はメインループを終了させないようにする
	<-make(chan bool)
}

// JavaScript から呼び出し可能な関数
func getHelloMessage(_ js.Value, _ []js.Value) interface{} {
	// 実際のアプリケーションでは Echo を直接起動することはできませんが、
	// ハンドラーロジックは再利用できます

	// 応答データを返す
	return map[string]interface{}{
		"message": "Hello, World from WebAssembly!",
	}
}
