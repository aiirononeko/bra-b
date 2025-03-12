package workflows

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/todo/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
)

// TodoWorkflow はTodoに関するワークフローを提供します
type TodoWorkflow struct {
	todoRepo repositories.TodoRepository
}

// NewTodoWorkflow は新しいTodoWorkflowを作成します
func NewTodoWorkflow(todoRepo repositories.TodoRepository) *TodoWorkflow {
	return &TodoWorkflow{
		todoRepo: todoRepo,
	}
}

// CreateTodoInput は新しいTodoを作成するための入力です
type CreateTodoInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// UpdateTodoInput はTodoを更新するための入力です
type UpdateTodoInput struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Completed   *bool   `json:"completed"`
}

// CreateTodo は新しいTodoを作成します
func (w *TodoWorkflow) CreateTodo(ctx context.Context, input CreateTodoInput) (*entity.Todo, error) {
	if input.Title == "" {
		return nil, errors.New("title is required")
	}

	todo := entity.NewTodo(input.Title, input.Description)
	return w.todoRepo.Create(ctx, todo)
}

// UpdateTodo は既存のTodoを更新します
func (w *TodoWorkflow) UpdateTodo(ctx context.Context, id string, input UpdateTodoInput) (*entity.Todo, error) {
	todo, err := w.todoRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Title != nil {
		todo.UpdateTitle(*input.Title)
	}

	if input.Description != nil {
		todo.UpdateDescription(*input.Description)
	}

	if input.Completed != nil {
		if *input.Completed {
			todo.MarkAsCompleted()
		} else {
			todo.MarkAsIncomplete()
		}
	}

	return w.todoRepo.Update(ctx, todo)
}

// DeleteTodo は指定されたIDのTodoを削除します
func (w *TodoWorkflow) DeleteTodo(ctx context.Context, id string) error {
	return w.todoRepo.Delete(ctx, id)
}
