package queries

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/todo/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
)

// TodoQuery はTodoに関するクエリを提供します
type TodoQuery struct {
	todoRepo repositories.TodoRepository
}

// NewTodoQuery は新しいTodoQueryを作成します
func NewTodoQuery(todoRepo repositories.TodoRepository) *TodoQuery {
	return &TodoQuery{
		todoRepo: todoRepo,
	}
}

// TodoResponse はTodoのレスポンス形式です
type TodoResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// GetAllTodos は全てのTodoを取得します
func (q *TodoQuery) GetAllTodos(ctx context.Context) ([]TodoResponse, error) {
	todos, err := q.todoRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]TodoResponse, len(todos))
	for i, todo := range todos {
		responses[i] = convertTodoToResponse(todo)
	}

	return responses, nil
}

// GetTodoByID は指定されたIDのTodoを取得します
func (q *TodoQuery) GetTodoByID(ctx context.Context, id string) (*TodoResponse, error) {
	todo, err := q.todoRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := convertTodoToResponse(todo)
	return &response, nil
}

// convertTodoToResponse はTodoエンティティをレスポンス形式に変換します
func convertTodoToResponse(todo *entity.Todo) TodoResponse {
	return TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Completed:   todo.Completed,
		CreatedAt:   todo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   todo.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
