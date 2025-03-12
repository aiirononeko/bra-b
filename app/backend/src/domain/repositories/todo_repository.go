package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/todo/entity"
)

// TodoRepository はTodoエンティティの永続化を担当するリポジトリのインターフェースです
type TodoRepository interface {
	// FindAll は全てのTodoを取得します
	FindAll(ctx context.Context) ([]*entity.Todo, error)

	// FindByID は指定されたIDのTodoを取得します
	FindByID(ctx context.Context, id string) (*entity.Todo, error)

	// Create は新しいTodoを作成します
	Create(ctx context.Context, todo *entity.Todo) (*entity.Todo, error)

	// Update は既存のTodoを更新します
	Update(ctx context.Context, todo *entity.Todo) (*entity.Todo, error)

	// Delete は指定されたIDのTodoを削除します
	Delete(ctx context.Context, id string) error
}
