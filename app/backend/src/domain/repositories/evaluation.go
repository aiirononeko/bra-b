package repositories

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
)

// EvaluationRepository は評価エンティティに対するリポジトリインターフェースを定義します
type EvaluationRepository interface {
	// FindByID は評価をIDで検索します
	FindByID(ctx context.Context, id string) (*entity.Evaluation, error)

	// FindByBaristaProfileID はバリスタプロフィールIDで評価を検索します
	FindByBaristaProfileID(ctx context.Context, baristaProfileID string, limit, offset int) ([]*entity.Evaluation, error)

	// CountByBaristaProfileID はバリスタが受け取った評価の件数を取得します
	CountByBaristaProfileID(ctx context.Context, baristaProfileID string) (int64, error)

	// Create は新しい評価を作成します
	Create(ctx context.Context, evaluation *entity.Evaluation) error
}

// EvaluationDetailRepository は評価詳細に対するリポジトリインターフェースを定義します
type EvaluationDetailRepository interface {
	// FindByEvaluationID は評価IDで評価詳細を検索します
	FindByEvaluationID(ctx context.Context, evaluationID string) ([]*entity.EvaluationDetail, error)

	// Create は新しい評価詳細を作成します
	Create(ctx context.Context, evaluationDetail *entity.EvaluationDetail) error

	// BatchCreate は複数の評価詳細をバッチで作成します
	BatchCreate(ctx context.Context, evaluationDetails []*entity.EvaluationDetail) error
}

// EvaluationCategoryRepository は評価カテゴリに対するリポジトリインターフェースを定義します
type EvaluationCategoryRepository interface {
	// FindAll はすべての評価カテゴリを取得します
	FindAll(ctx context.Context) ([]*entity.EvaluationCategory, error)

	// FindByID はIDで評価カテゴリを検索します
	FindByID(ctx context.Context, id string) (*entity.EvaluationCategory, error)

	// Create は新しい評価カテゴリを作成します
	Create(ctx context.Context, category *entity.EvaluationCategory) error

	// Update は評価カテゴリを更新します
	Update(ctx context.Context, category *entity.EvaluationCategory) error
}

// EvaluationItemRepository は評価項目に対するリポジトリインターフェースを定義します
type EvaluationItemRepository interface {
	// FindAll はすべての評価項目を取得します
	FindAll(ctx context.Context) ([]*entity.EvaluationItem, error)

	// FindByCategoryID はカテゴリIDで評価項目を検索します
	FindByCategoryID(ctx context.Context, categoryID string) ([]*entity.EvaluationItem, error)

	// FindCommonItems は共通評価項目を検索します
	FindCommonItems(ctx context.Context) ([]*entity.EvaluationItem, error)

	// FindByID はIDで評価項目を検索します
	FindByID(ctx context.Context, id string) (*entity.EvaluationItem, error)

	// Create は新しい評価項目を作成します
	Create(ctx context.Context, item *entity.EvaluationItem) error

	// Update は評価項目を更新します
	Update(ctx context.Context, item *entity.EvaluationItem) error
}
