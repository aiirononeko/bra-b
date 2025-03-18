package presentations

import (
	"net/http"

	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/labstack/echo/v4"
)

// EvaluationHandler は評価関連のAPIリクエストを処理します
type EvaluationHandler struct {
	evaluationQuery *queries.EvaluationQuery
}

// NewEvaluationHandler は新しい評価ハンドラーを作成します
func NewEvaluationHandler(evaluationQuery *queries.EvaluationQuery) *EvaluationHandler {
	return &EvaluationHandler{
		evaluationQuery: evaluationQuery,
	}
}

// RegisterRoutes はルーティングを登録します
func (h *EvaluationHandler) RegisterRoutes(e *echo.Echo) {
	evaluationGroup := e.Group("/api")
	evaluationGroup.GET("/evaluation/categories", h.GetEvaluationCategories)
}

// EvaluationCategoryResponse は評価カテゴリと評価項目のレスポンス形式です
type EvaluationCategoryResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Tags []Tag  `json:"tags"`
}

// Tag は評価項目（タグ）のレスポンス形式です
type Tag struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// GetEvaluationCategoriesResponse は評価カテゴリ一覧のレスポンス形式です
type GetEvaluationCategoriesResponse struct {
	Categories []EvaluationCategoryResponse `json:"categories"`
	CommonTags []Tag                        `json:"commonTags"`
}

// GetEvaluationCategories は評価カテゴリと評価項目の一覧を取得します
func (h *EvaluationHandler) GetEvaluationCategories(c echo.Context) error {
	// ctx := c.Request().Context()
	ctx := c.Request().Context()

	// カテゴリと評価項目を取得
	categoriesWithItems, commonItems, err := h.evaluationQuery.GetCategoriesWithItems(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get evaluation categories")
	}

	// レスポンス形式に変換
	categories := make([]EvaluationCategoryResponse, 0, len(categoriesWithItems))
	for _, categoryWithItems := range categoriesWithItems {
		tags := make([]Tag, 0, len(categoryWithItems.Items))
		for _, item := range categoryWithItems.Items {
			tags = append(tags, Tag{
				ID:   item.ID,
				Name: item.Name,
			})
		}

		categories = append(categories, EvaluationCategoryResponse{
			ID:   categoryWithItems.ID,
			Name: categoryWithItems.Name,
			Tags: tags,
		})
	}

	// 共通タグをレスポンス形式に変換
	commonTags := make([]Tag, 0, len(commonItems))
	for _, item := range commonItems {
		commonTags = append(commonTags, Tag{
			ID:   item.ID,
			Name: item.Name,
		})
	}

	// レスポンスを返す
	return c.JSON(http.StatusOK, GetEvaluationCategoriesResponse{
		Categories: categories,
		CommonTags: commonTags,
	})
}
