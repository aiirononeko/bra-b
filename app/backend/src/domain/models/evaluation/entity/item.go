package entity

import (
	"time"

	"github.com/google/uuid"
)

// EvaluationItem は評価項目（タグ）を表すドメインモデルです
type EvaluationItem struct {
	ID         string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CategoryID *string `gorm:"type:uuid;index"`
	Name       string  `gorm:"not null"`
	IsCommon   bool    `gorm:"default:false"`
	IsActive   bool    `gorm:"default:true"`
	SortOrder  int
	CreatedAt  time.Time
}

// NewEvaluationItem は新しい評価項目エンティティを作成します
func NewEvaluationItem(name string, categoryID *string, isCommon bool, sortOrder int) *EvaluationItem {
	return &EvaluationItem{
		ID:         uuid.New().String(),
		CategoryID: categoryID,
		Name:       name,
		IsCommon:   isCommon,
		IsActive:   true,
		SortOrder:  sortOrder,
		CreatedAt:  time.Now(),
	}
}

// Activate は評価項目をアクティブにします
func (i *EvaluationItem) Activate() {
	i.IsActive = true
}

// Deactivate は評価項目を非アクティブにします
func (i *EvaluationItem) Deactivate() {
	i.IsActive = false
}

// UpdateName は評価項目名を更新します
func (i *EvaluationItem) UpdateName(name string) {
	i.Name = name
}

// UpdateSortOrder はソート順を更新します
func (i *EvaluationItem) UpdateSortOrder(sortOrder int) {
	i.SortOrder = sortOrder
}
