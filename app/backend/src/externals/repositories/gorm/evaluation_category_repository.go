package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormEvaluationCategoryRepository はGORMを使用した評価カテゴリリポジトリの実装です
type GormEvaluationCategoryRepository struct {
	db *gorm.DB
}

// NewGormEvaluationCategoryRepository は新しいGORM評価カテゴリリポジトリを作成します
func NewGormEvaluationCategoryRepository(db *gorm.DB) repositories.EvaluationCategoryRepository {
	return &GormEvaluationCategoryRepository{db: db}
}

// FindAll はすべての評価カテゴリを取得します
func (r *GormEvaluationCategoryRepository) FindAll(ctx context.Context) ([]*entity.EvaluationCategory, error) {
	var categories []*entity.EvaluationCategory
	result := r.db.WithContext(ctx).Order("sort_order asc").Find(&categories)
	if result.Error != nil {
		return nil, result.Error
	}
	return categories, nil
}

// FindByID はIDで評価カテゴリを検索します
func (r *GormEvaluationCategoryRepository) FindByID(ctx context.Context, id string) (*entity.EvaluationCategory, error) {
	var category entity.EvaluationCategory
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&category)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &category, nil
}

// Create は新しい評価カテゴリを作成します
func (r *GormEvaluationCategoryRepository) Create(ctx context.Context, category *entity.EvaluationCategory) error {
	return r.db.WithContext(ctx).Create(category).Error
}

// Update は評価カテゴリを更新します
func (r *GormEvaluationCategoryRepository) Update(ctx context.Context, category *entity.EvaluationCategory) error {
	return r.db.WithContext(ctx).Save(category).Error
}
