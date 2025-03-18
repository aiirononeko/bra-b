package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/favorite/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormFavoriteRepository はGORMを使用したお気に入りリポジトリの実装です
type GormFavoriteRepository struct {
	db *gorm.DB
}

// NewGormFavoriteRepository は新しいGORMお気に入りリポジトリを作成します
func NewGormFavoriteRepository(db *gorm.DB) repositories.FavoriteRepository {
	return &GormFavoriteRepository{db: db}
}

// FindByID はお気に入りをIDで検索します
func (r *GormFavoriteRepository) FindByID(ctx context.Context, id string) (*entity.Favorite, error) {
	var favorite entity.Favorite
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&favorite)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &favorite, nil
}

// FindByUserID はユーザーIDでお気に入りを検索します
func (r *GormFavoriteRepository) FindByUserID(ctx context.Context, userID string) ([]*entity.Favorite, error) {
	var favorites []*entity.Favorite
	result := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&favorites)
	if result.Error != nil {
		return nil, result.Error
	}
	return favorites, nil
}

// FindByUserIDAndBaristaProfileID はユーザーIDとバリスタプロフィールIDでお気に入りを検索します
func (r *GormFavoriteRepository) FindByUserIDAndBaristaProfileID(ctx context.Context, userID string, baristaProfileID string) (*entity.Favorite, error) {
	var favorite entity.Favorite
	result := r.db.WithContext(ctx).
		Where("user_id = ? AND barista_profile_id = ?", userID, baristaProfileID).
		First(&favorite)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &favorite, nil
}

// CountByBaristaProfileID はバリスタプロフィールIDでお気に入りの数を取得します
func (r *GormFavoriteRepository) CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).
		Model(&entity.Favorite{}).
		Where("barista_profile_id = ?", baristaProfileID).
		Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

// Create は新しいお気に入りを作成します
func (r *GormFavoriteRepository) Create(ctx context.Context, favorite *entity.Favorite) error {
	return r.db.WithContext(ctx).Create(favorite).Error
}

// Delete はお気に入りを削除します
func (r *GormFavoriteRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&entity.Favorite{}, "id = ?", id).Error
}

// DeleteByUserIDAndBaristaProfileID はユーザーIDとバリスタプロフィールIDでお気に入りを削除します
func (r *GormFavoriteRepository) DeleteByUserIDAndBaristaProfileID(ctx context.Context, userID string, baristaProfileID string) error {
	return r.db.WithContext(ctx).
		Delete(&entity.Favorite{}, "user_id = ? AND barista_profile_id = ?", userID, baristaProfileID).
		Error
}
