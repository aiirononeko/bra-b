package queries

import (
	"context"

	"github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
	"github.com/aiirononeko/bra-b/app/backend/src/domain/repositories"
)

// EvaluationQuery は評価関連のクエリを処理します
type EvaluationQuery struct {
	categoryRepository repositories.EvaluationCategoryRepository
	itemRepository     repositories.EvaluationItemRepository
}

// NewEvaluationQuery は新しい評価クエリを作成します
func NewEvaluationQuery(
	categoryRepository repositories.EvaluationCategoryRepository,
	itemRepository repositories.EvaluationItemRepository,
) *EvaluationQuery {
	return &EvaluationQuery{
		categoryRepository: categoryRepository,
		itemRepository:     itemRepository,
	}
}

// CategoryWithItems はカテゴリと関連する評価項目を格納する構造体です
type CategoryWithItems struct {
	ID    string                   `json:"id"`
	Name  string                   `json:"name"`
	Items []*entity.EvaluationItem `json:"items"`
}

// GetCategoriesWithItems はカテゴリと関連する評価項目のリストを取得します
func (q *EvaluationQuery) GetCategoriesWithItems(ctx context.Context) ([]*CategoryWithItems, []*entity.EvaluationItem, error) {
	// カテゴリを取得
	categories, err := q.categoryRepository.FindAll(ctx)
	if err != nil {
		return nil, nil, err
	}

	// 共通タグを取得
	commonItems, err := q.itemRepository.FindCommonItems(ctx)
	if err != nil {
		return nil, nil, err
	}

	// カテゴリごとに評価項目を取得
	categoriesWithItems := make([]*CategoryWithItems, 0, len(categories))
	for _, category := range categories {
		if !category.IsActive {
			continue
		}

		// カテゴリIDに紐づく評価項目を取得
		items, err := q.itemRepository.FindByCategoryID(ctx, category.ID)
		if err != nil {
			return nil, nil, err
		}

		// カテゴリと評価項目を結合
		categoriesWithItems = append(categoriesWithItems, &CategoryWithItems{
			ID:    category.ID,
			Name:  category.Name,
			Items: items,
		})
	}

	return categoriesWithItems, commonItems, nil
}
