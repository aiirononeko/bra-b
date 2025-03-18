package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/profile/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormProfileRepository はGORMを使用したプロフィールリポジトリの実装です
type GormProfileRepository struct {
	db *gorm.DB
}

// NewGormProfileRepository は新しいGORMプロフィールリポジトリを作成します
func NewGormProfileRepository(db *gorm.DB) repositories.ProfileRepository {
	return &GormProfileRepository{db: db}
}

// FindByID はIDでプロフィールを検索します
func (r *GormProfileRepository) FindByID(ctx context.Context, id string) (*entity.Profile, error) {
	var profile entity.Profile
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&profile)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &profile, nil
}

// FindByUserID はユーザーIDでプロフィールを検索します
func (r *GormProfileRepository) FindByUserID(ctx context.Context, userID string) (*entity.Profile, error) {
	var profile entity.Profile
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&profile)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &profile, nil
}

// FindBaristaByID はIDでバリスタプロフィールを検索します
func (r *GormProfileRepository) FindBaristaByID(ctx context.Context, id string) (*entity.Profile, error) {
	var profile entity.Profile
	result := r.db.WithContext(ctx).Where("id = ? AND type = ?", id, "barista").First(&profile)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &profile, nil
}

// Create は新しいプロフィールを作成します
func (r *GormProfileRepository) Create(ctx context.Context, profile *entity.Profile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

// Update は既存のプロフィールを更新します
func (r *GormProfileRepository) Update(ctx context.Context, profile *entity.Profile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}
