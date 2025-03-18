package gorm

import (
	"context"
	"errors"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/user/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
	"gorm.io/gorm"
)

// GormUserRepository はGORMを使用したユーザーリポジトリの実装です
type GormUserRepository struct {
	db *gorm.DB
}

// NewGormUserRepository は新しいGORMユーザーリポジトリを作成します
func NewGormUserRepository(db *gorm.DB) repositories.UserRepository {
	return &GormUserRepository{db: db}
}

// FindByID はIDでユーザーを検索します
func (r *GormUserRepository) FindByID(ctx context.Context, id string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &user, nil
}

// FindByEmail はメールアドレスでユーザーを検索します
func (r *GormUserRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &user, nil
}

// Create は新しいユーザーを作成します
func (r *GormUserRepository) Create(ctx context.Context, user *entity.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// Update は既存のユーザーを更新します
func (r *GormUserRepository) Update(ctx context.Context, user *entity.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete はユーザーを論理削除します
func (r *GormUserRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.User{}).Error
}
