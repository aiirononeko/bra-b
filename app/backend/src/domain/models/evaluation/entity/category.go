package entity

import (
	"time"

	"github.com/google/uuid"
)

// EvaluationCategory は評価カテゴリを表すドメインモデルです
type EvaluationCategory struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name      string `gorm:"not null"`
	IsActive  bool   `gorm:"default:true"`
	SortOrder int
	CreatedAt time.Time
}

// NewEvaluationCategory は新しい評価カテゴリエンティティを作成します
func NewEvaluationCategory(name string, sortOrder int) *EvaluationCategory {
	return &EvaluationCategory{
		ID:        uuid.New().String(),
		Name:      name,
		IsActive:  true,
		SortOrder: sortOrder,
		CreatedAt: time.Now(),
	}
}

// Activate はカテゴリをアクティブにします
func (c *EvaluationCategory) Activate() {
	c.IsActive = true
}

// Deactivate はカテゴリを非アクティブにします
func (c *EvaluationCategory) Deactivate() {
	c.IsActive = false
}

// UpdateName はカテゴリ名を更新します
func (c *EvaluationCategory) UpdateName(name string) {
	c.Name = name
}

// UpdateSortOrder はソート順を更新します
func (c *EvaluationCategory) UpdateSortOrder(sortOrder int) {
	c.SortOrder = sortOrder
}
