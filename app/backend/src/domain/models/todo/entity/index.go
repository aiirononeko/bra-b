package entity

import (
	"time"
)

// Todo はTodoアイテムを表すドメインモデルです
type Todo struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Completed   bool      `json:"completed"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// NewTodo は新しいTodoエンティティを作成します
func NewTodo(title string, description string) *Todo {
	now := time.Now()
	return &Todo{
		ID:          "", // リポジトリ層で設定されます
		Title:       title,
		Description: description,
		Completed:   false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// MarkAsCompleted はTodoを完了状態にします
func (t *Todo) MarkAsCompleted() {
	t.Completed = true
	t.UpdatedAt = time.Now()
}

// MarkAsIncomplete はTodoを未完了状態にします
func (t *Todo) MarkAsIncomplete() {
	t.Completed = false
	t.UpdatedAt = time.Now()
}

// UpdateTitle はTodoのタイトルを更新します
func (t *Todo) UpdateTitle(title string) {
	t.Title = title
	t.UpdatedAt = time.Now()
}

// UpdateDescription はTodoの説明を更新します
func (t *Todo) UpdateDescription(description string) {
	t.Description = description
	t.UpdatedAt = time.Now()
}
