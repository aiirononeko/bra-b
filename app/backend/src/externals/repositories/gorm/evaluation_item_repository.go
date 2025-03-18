package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormEvaluationItemRepository はGORMを使用した評価項目リポジトリの実装です
type GormEvaluationItemRepository struct {
	db *gorm.DB
}

// NewGormEvaluationItemRepository は新しいGORM評価項目リポジトリを作成します
func NewGormEvaluationItemRepository(db *gorm.DB) repositories.EvaluationItemRepository {
	return &GormEvaluationItemRepository{db: db}
}

// FindAll はすべての評価項目を取得します
func (r *GormEvaluationItemRepository) FindAll(ctx context.Context) ([]*entity.EvaluationItem, error) {
	var items []*entity.EvaluationItem
	result := r.db.WithContext(ctx).Where("is_active = ?", true).Order("sort_order asc").Find(&items)
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

// FindByCategoryID はカテゴリIDで評価項目を検索します
func (r *GormEvaluationItemRepository) FindByCategoryID(ctx context.Context, categoryID string) ([]*entity.EvaluationItem, error) {
	var items []*entity.EvaluationItem
	result := r.db.WithContext(ctx).Where("category_id = ? AND is_active = ?", categoryID, true).Order("sort_order asc").Find(&items)
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

// FindCommonItems は共通評価項目を検索します
func (r *GormEvaluationItemRepository) FindCommonItems(ctx context.Context) ([]*entity.EvaluationItem, error) {
	var items []*entity.EvaluationItem
	result := r.db.WithContext(ctx).Where("is_common = ? AND is_active = ?", true, true).Order("sort_order asc").Find(&items)
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

// FindByID はIDで評価項目を検索します
func (r *GormEvaluationItemRepository) FindByID(ctx context.Context, id string) (*entity.EvaluationItem, error) {
	var item entity.EvaluationItem
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&item)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &item, nil
}

// Create は新しい評価項目を作成します
func (r *GormEvaluationItemRepository) Create(ctx context.Context, item *entity.EvaluationItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

// Update は評価項目を更新します
func (r *GormEvaluationItemRepository) Update(ctx context.Context, item *entity.EvaluationItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}
