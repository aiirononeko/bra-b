package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormEvaluationRepository はGORMを使用した評価リポジトリの実装です
type GormEvaluationRepository struct {
	db *gorm.DB
}

// NewGormEvaluationRepository は新しいGORM評価リポジトリを作成します
func NewGormEvaluationRepository(db *gorm.DB) repositories.EvaluationRepository {
	return &GormEvaluationRepository{db: db}
}

// FindByID は評価をIDで検索します
func (r *GormEvaluationRepository) FindByID(ctx context.Context, id string) (*entity.Evaluation, error) {
	var evaluation entity.Evaluation
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&evaluation)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &evaluation, nil
}

// FindByBaristaProfileID はバリスタプロフィールIDで評価を検索します
func (r *GormEvaluationRepository) FindByBaristaProfileID(ctx context.Context, baristaProfileID string, limit, offset int) ([]*entity.Evaluation, error) {
	var evaluations []*entity.Evaluation
	result := r.db.WithContext(ctx).
		Where("barista_profile_id = ?", baristaProfileID).
		Order("evaluated_at desc").
		Limit(limit).
		Offset(offset).
		Find(&evaluations)
	if result.Error != nil {
		return nil, result.Error
	}
	return evaluations, nil
}

// CountByBaristaProfileID はバリスタが受け取った評価の件数を取得します
func (r *GormEvaluationRepository) CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).
		Model(&entity.Evaluation{}).
		Where("barista_profile_id = ?", baristaProfileID).
		Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

// Create は新しい評価を作成します
func (r *GormEvaluationRepository) Create(ctx context.Context, evaluation *entity.Evaluation) error {
	return r.db.WithContext(ctx).Create(evaluation).Error
}

// GormEvaluationDetailRepository はGORMを使用した評価詳細リポジトリの実装です
type GormEvaluationDetailRepository struct {
	db *gorm.DB
}

// NewGormEvaluationDetailRepository は新しいGORM評価詳細リポジトリを作成します
func NewGormEvaluationDetailRepository(db *gorm.DB) repositories.EvaluationDetailRepository {
	return &GormEvaluationDetailRepository{db: db}
}

// FindByEvaluationID は評価IDで評価詳細を検索します
func (r *GormEvaluationDetailRepository) FindByEvaluationID(ctx context.Context, evaluationID string) ([]*entity.EvaluationDetail, error) {
	var details []*entity.EvaluationDetail
	result := r.db.WithContext(ctx).
		Where("evaluation_id = ?", evaluationID).
		Find(&details)
	if result.Error != nil {
		return nil, result.Error
	}
	return details, nil
}

// Create は新しい評価詳細を作成します
func (r *GormEvaluationDetailRepository) Create(ctx context.Context, detail *entity.EvaluationDetail) error {
	return r.db.WithContext(ctx).Create(detail).Error
}

// BatchCreate は複数の評価詳細をバッチで作成します
func (r *GormEvaluationDetailRepository) BatchCreate(ctx context.Context, details []*entity.EvaluationDetail) error {
	return r.db.WithContext(ctx).CreateInBatches(details, len(details)).Error
}
