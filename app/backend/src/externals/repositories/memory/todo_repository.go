package memory

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/todo/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"github.com/google/uuid"
)

// InMemoryTodoRepository はTodoリポジトリのインメモリ実装です
type InMemoryTodoRepository struct {
	todos map[string]*entity.Todo
	mu    sync.RWMutex
}

// NewInMemoryTodoRepository は新しいInMemoryTodoRepositoryを作成します
func NewInMemoryTodoRepository() repositories.TodoRepository {
	return &InMemoryTodoRepository{
		todos: make(map[string]*entity.Todo),
	}
}

// FindAll は全てのTodoを取得します
func (r *InMemoryTodoRepository) FindAll(ctx context.Context) ([]*entity.Todo, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	todos := make([]*entity.Todo, 0, len(r.todos))
	for _, todo := range r.todos {
		todos = append(todos, todo)
	}
	return todos, nil
}

// FindByID は指定されたIDのTodoを取得します
func (r *InMemoryTodoRepository) FindByID(ctx context.Context, id string) (*entity.Todo, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	todo, exists := r.todos[id]
	if !exists {
		return nil, errors.New("todo not found")
	}
	return todo, nil
}

// Create は新しいTodoを作成します
func (r *InMemoryTodoRepository) Create(ctx context.Context, todo *entity.Todo) (*entity.Todo, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// IDを生成
	todo.ID = uuid.New().String()
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now

	// 保存
	r.todos[todo.ID] = todo
	return todo, nil
}

// Update は既存のTodoを更新します
func (r *InMemoryTodoRepository) Update(ctx context.Context, todo *entity.Todo) (*entity.Todo, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, exists := r.todos[todo.ID]
	if !exists {
		return nil, errors.New("todo not found")
	}

	todo.UpdatedAt = time.Now()
	r.todos[todo.ID] = todo
	return todo, nil
}

// Delete は指定されたIDのTodoを削除します
func (r *InMemoryTodoRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, exists := r.todos[id]
	if !exists {
		return errors.New("todo not found")
	}

	delete(r.todos, id)
	return nil
}
