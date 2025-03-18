package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/tip/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormTipRepository はGORMを使用したチップリポジトリの実装です
type GormTipRepository struct {
	db *gorm.DB
}

// NewGormTipRepository は新しいGORMチップリポジトリを作成します
func NewGormTipRepository(db *gorm.DB) repositories.TipRepository {
	return &GormTipRepository{db: db}
}

// FindByID はチップをIDで検索します
func (r *GormTipRepository) FindByID(ctx context.Context, id string) (*entity.Tip, error) {
	var tip entity.Tip
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&tip)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &tip, nil
}

// FindByBaristaProfileID はバリスタプロフィールIDでチップを検索します
func (r *GormTipRepository) FindByBaristaProfileID(ctx context.Context, baristaProfileID string, limit, offset int) ([]*entity.Tip, error) {
	var tips []*entity.Tip
	result := r.db.WithContext(ctx).
		Where("barista_profile_id = ?", baristaProfileID).
		Order("sent_at desc").
		Limit(limit).
		Offset(offset).
		Find(&tips)
	if result.Error != nil {
		return nil, result.Error
	}
	return tips, nil
}

// CountByBaristaProfileID はバリスタが受け取ったチップの件数を取得します
func (r *GormTipRepository) CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).
		Model(&entity.Tip{}).
		Where("barista_profile_id = ?", baristaProfileID).
		Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

// SumAmountByBaristaProfileID はバリスタが受け取ったチップの合計金額を取得します
func (r *GormTipRepository) SumAmountByBaristaProfileID(ctx context.Context, baristaProfileID string) (float64, error) {
	var sum float64
	result := r.db.WithContext(ctx).
		Model(&entity.Tip{}).
		Where("barista_profile_id = ?", baristaProfileID).
		Select("COALESCE(SUM(amount), 0) as total").
		Pluck("total", &sum)
	if result.Error != nil {
		return 0, result.Error
	}
	return sum, nil
}

// FindByStripePaymentIntentID はStripe決済IDでチップを検索します
func (r *GormTipRepository) FindByStripePaymentIntentID(ctx context.Context, stripePaymentIntentID string) (*entity.Tip, error) {
	var tip entity.Tip
	result := r.db.WithContext(ctx).Where("stripe_payment_intent_id = ?", stripePaymentIntentID).First(&tip)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &tip, nil
}

// Create は新しいチップを作成します
func (r *GormTipRepository) Create(ctx context.Context, tip *entity.Tip) error {
	return r.db.WithContext(ctx).Create(tip).Error
}

// Update は既存のチップを更新します
func (r *GormTipRepository) Update(ctx context.Context, tip *entity.Tip) error {
	return r.db.WithContext(ctx).Save(tip).Error
}
