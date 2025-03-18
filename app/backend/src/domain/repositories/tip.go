package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/tip/entity"
)

// TipRepository はチップエンティティに対するリポジトリインターフェースを定義します
type TipRepository interface {
	// FindByID はチップをIDで検索します
	FindByID(ctx context.Context, id string) (*entity.Tip, error)

	// FindByBaristaProfileID はバリスタプロフィールIDでチップを検索します
	FindByBaristaProfileID(ctx context.Context, baristaProfileID string, limit, offset int) ([]*entity.Tip, error)

	// CountByBaristaProfileID はバリスタが受け取ったチップの件数を取得します
	CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error)

	// SumAmountByBaristaProfileID はバリスタが受け取ったチップの合計金額を取得します
	SumAmountByBaristaProfileID(ctx context.Context, baristaProfileID string) (float64, error)

	// FindByStripePaymentIntentID はStripe決済IDでチップを検索します
	FindByStripePaymentIntentID(ctx context.Context, stripePaymentIntentID string) (*entity.Tip, error)

	// Create は新しいチップを作成します
	Create(ctx context.Context, tip *entity.Tip) error

	// Update は既存のチップを更新します
	Update(ctx context.Context, tip *entity.Tip) error
}
