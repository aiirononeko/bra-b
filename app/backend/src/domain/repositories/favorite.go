package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/favorite/entity"
)

// FavoriteRepository はお気に入りエンティティに対するリポジトリインターフェースを定義します
type FavoriteRepository interface {
	// FindByID はお気に入りをIDで検索します
	FindByID(ctx context.Context, id string) (*entity.Favorite, error)

	// FindByUserID はユーザーIDでお気に入りを検索します
	FindByUserID(ctx context.Context, userID string) ([]*entity.Favorite, error)

	// FindByUserIDAndBaristaProfileID はユーザーIDとバリスタプロフィールIDでお気に入りを検索します
	FindByUserIDAndBaristaProfileID(ctx context.Context, userID string, baristaProfileID string) (*entity.Favorite, error)

	// CountByBaristaProfileID はバリスタプロフィールIDでお気に入りの数を取得します
	CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error)

	// Create は新しいお気に入りを作成します
	Create(ctx context.Context, favorite *entity.Favorite) error

	// Delete はお気に入りを削除します
	Delete(ctx context.Context, id string) error

	// DeleteByUserIDAndBaristaProfileID はユーザーIDとバリスタプロフィールIDでお気に入りを削除します
	DeleteByUserIDAndBaristaProfileID(ctx context.Context, userID string, baristaProfileID string) error
}
