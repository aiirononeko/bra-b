package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/profile/entity"
)

// ProfileRepository はプロフィールエンティティに対するリポジトリインターフェースを定義します
type ProfileRepository interface {
	// FindByID はIDでプロフィールを検索します
	FindByID(ctx context.Context, id string) (*entity.Profile, error)

	// FindByUserID はユーザーIDでプロフィールを検索します
	FindByUserID(ctx context.Context, userID string) (*entity.Profile, error)

	// FindBaristaByID はIDでバリスタプロフィールを検索します（タイプがバリスタのプロフィール）
	FindBaristaByID(ctx context.Context, id string) (*entity.Profile, error)

	// CreateProfile は新しいプロフィールを作成します
	Create(ctx context.Context, profile *entity.Profile) error

	// Update は既存のプロフィールを更新します
	Update(ctx context.Context, profile *entity.Profile) error
}
