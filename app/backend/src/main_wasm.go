//go:build wasm
// +build wasm

package main

import (
	"encoding/json"
	"syscall/js"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/todo/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/externals/repositories/memory"
	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/aiirononeko/bra-b/app/backend/src/workflows"
)

var (
	todoRepo     = memory.NewInMemoryTodoRepository()
	todoQuery    = queries.NewTodoQuery(todoRepo)
	todoWorkflow = workflows.NewTodoWorkflow(todoRepo)
)

func main() {
	// WebAssembly 環境向けのグローバル関数を公開
	js.Global().Set("getHelloMessage", js.FuncOf(getHelloMessage))

	// Todo関連の関数を公開
	js.Global().Set("getAllTodos", js.FuncOf(getAllTodos))
	js.Global().Set("getTodoById", js.FuncOf(getTodoById))
	js.Global().Set("createTodo", js.FuncOf(createTodo))
	js.Global().Set("updateTodo", js.FuncOf(updateTodo))
	js.Global().Set("deleteTodo", js.FuncOf(deleteTodo))

	// WebAssembly はメインループを終了させないようにする
	<-make(chan bool)
}

// JavaScript から呼び出し可能な関数
func getHelloMessage(_ js.Value, _ []js.Value) interface{} {
	// 応答データを返す
	return map[string]interface{}{
		"message": "Hello, World from WebAssembly!",
	}
}

// getAllTodos は全てのTodoを取得します
func getAllTodos(_ js.Value, _ []js.Value) interface{} {
	todos, err := todoQuery.GetAllTodos(nil)
	if err != nil {
		return map[string]interface{}{
			"error": err.Error(),
		}
	}

	return todos
}

// getTodoById は指定されたIDのTodoを取得します
func getTodoById(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return map[string]interface{}{
			"error": "Invalid arguments",
		}
	}

	id := args[0].String()
	todo, err := todoQuery.GetTodoByID(nil, id)
	if err != nil {
		return map[string]interface{}{
			"error": "Todo not found",
		}
	}

	return todo
}

// createTodo は新しいTodoを作成します
func createTodo(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return map[string]interface{}{
			"error": "Invalid arguments",
		}
	}

	// JSONからCreateTodoInputに変換
	var input workflows.CreateTodoInput
	err := json.Unmarshal([]byte(args[0].String()), &input)
	if err != nil {
		return map[string]interface{}{
			"error": "Invalid JSON",
		}
	}

	// Todoを作成
	todo, err := todoWorkflow.CreateTodo(nil, input)
	if err != nil {
		return map[string]interface{}{
			"error": err.Error(),
		}
	}

	// レスポンス形式に変換
	response := todoToResponse(todo)
	return response
}

// updateTodo は既存のTodoを更新します
func updateTodo(_ js.Value, args []js.Value) interface{} {
	if len(args) < 2 {
		return map[string]interface{}{
			"error": "Invalid arguments",
		}
	}

	id := args[0].String()

	// JSONからUpdateTodoInputに変換
	var input workflows.UpdateTodoInput
	err := json.Unmarshal([]byte(args[1].String()), &input)
	if err != nil {
		return map[string]interface{}{
			"error": "Invalid JSON",
		}
	}

	// Todoを更新
	todo, err := todoWorkflow.UpdateTodo(nil, id, input)
	if err != nil {
		return map[string]interface{}{
			"error": "Todo not found",
		}
	}

	// レスポンス形式に変換
	response := todoToResponse(todo)
	return response
}

// deleteTodo は指定されたIDのTodoを削除します
func deleteTodo(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return map[string]interface{}{
			"error": "Invalid arguments",
		}
	}

	id := args[0].String()
	err := todoWorkflow.DeleteTodo(nil, id)
	if err != nil {
		return map[string]interface{}{
			"error": "Todo not found",
		}
	}

	return map[string]interface{}{
		"success": true,
	}
}

// todoToResponse はTodoエンティティをレスポンス形式に変換します
func todoToResponse(todo *entity.Todo) map[string]interface{} {
	return map[string]interface{}{
		"id":          todo.ID,
		"title":       todo.Title,
		"description": todo.Description,
		"completed":   todo.Completed,
		"createdAt":   todo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"updatedAt":   todo.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
