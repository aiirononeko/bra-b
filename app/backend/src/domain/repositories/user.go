package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/user/entity"
)

// UserRepository はユーザーエンティティに対するリポジトリインターフェースを定義します
type UserRepository interface {
	// FindByID はIDでユーザーを検索します
	FindByID(ctx context.Context, id string) (*entity.User, error)

	// FindByEmail はメールアドレスでユーザーを検索します
	FindByEmail(ctx context.Context, email string) (*entity.User, error)

	// Create は新しいユーザーを作成します
	Create(ctx context.Context, user *entity.User) error

	// Update は既存のユーザーを更新します
	Update(ctx context.Context, user *entity.User) error

	// Delete はユーザーを論理削除します
	Delete(ctx context.Context, id string) error
}
