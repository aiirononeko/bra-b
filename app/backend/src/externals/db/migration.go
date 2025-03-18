package db

import (
	"fmt"
	"log"

	evaluationEntity "github.com/aiirononeko/bra-b/app/backend/src/domain/models/evaluation/entity"
	favoriteEntity "github.com/aiirononeko/bra-b/app/backend/src/domain/models/favorite/entity"
	profileEntity "github.com/aiirononeko/bra-b/app/backend/src/domain/models/profile/entity"
	tipEntity "github.com/aiirononeko/bra-b/app/backend/src/domain/models/tip/entity"
	userEntity "github.com/aiirononeko/bra-b/app/backend/src/domain/models/user/entity"
)

// RunMigration はデータベースのマイグレーションを実行します
func RunMigration(db *PostgresDB) error {
	log.Println("Running database migration...")

	// マイグレーションを実行するモデルの一覧
	models := []interface{}{
		// ユーザー関連
		&userEntity.User{},

		// プロフィール関連
		&profileEntity.Profile{},

		// 評価関連
		&evaluationEntity.EvaluationCategory{},
		&evaluationEntity.EvaluationItem{},
		&evaluationEntity.Evaluation{},
		&evaluationEntity.EvaluationDetail{},

		// チップ関連
		&tipEntity.Tip{},

		// お気に入り関連
		&favoriteEntity.Favorite{},
	}

	// マイグレーションを実行
	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

// SeedInitialData は初期データを投入します
func SeedInitialData(db *PostgresDB) error {
	log.Println("Seeding initial data...")

	// 評価カテゴリを作成
	if err := seedEvaluationCategories(db); err != nil {
		return err
	}

	// 評価項目を作成
	if err := seedEvaluationItems(db); err != nil {
		return err
	}

	log.Println("Initial data seeding completed successfully")
	return nil
}

// seedEvaluationCategories は評価カテゴリの初期データを投入します
func seedEvaluationCategories(db *PostgresDB) error {
	// カテゴリデータ
	categories := []struct {
		name      string
		sortOrder int
	}{
		{"接客", 1},
		{"ドリンク品質", 2},
		{"サービス", 3},
	}

	for _, c := range categories {
		// カテゴリが既に存在するかチェック
		var count int64
		db.DB().Model(&evaluationEntity.EvaluationCategory{}).
			Where("name = ?", c.name).
			Count(&count)

		if count == 0 {
			category := evaluationEntity.NewEvaluationCategory(c.name, c.sortOrder)
			if err := db.DB().Create(category).Error; err != nil {
				return fmt.Errorf("failed to create category %s: %w", c.name, err)
			}
			log.Printf("Created category: %s", c.name)
		}
	}

	return nil
}

// seedEvaluationItems は評価項目の初期データを投入します
func seedEvaluationItems(db *PostgresDB) error {
	// カテゴリIDを取得
	var categories []evaluationEntity.EvaluationCategory
	if err := db.DB().Find(&categories).Error; err != nil {
		return fmt.Errorf("failed to fetch categories: %w", err)
	}

	categoryMap := make(map[string]string)
	for _, c := range categories {
		categoryMap[c.Name] = c.ID
	}

	// カテゴリごとの評価項目
	categoryItems := map[string][]string{
		"接客": {
			"笑顔が素敵",
			"気遣いがある",
			"丁寧な接客",
			"説明がわかりやすい",
			"会話が心地よい",
		},
		"ドリンク品質": {
			"ラテアートが美しい",
			"味が素晴らしい",
			"温度が適切",
			"品質が安定している",
			"ドリンクへのこだわりを感じる",
		},
		"サービス": {
			"提供がスピーディー",
			"注文がスムーズ",
			"無駄な動きがない",
			"丁寧な作業",
		},
	}

	// 共通タグ
	commonTags := []string{
		"またお願いしたい",
		"プロフェッショナル",
		"親しみやすい",
	}

	// カテゴリごとの評価項目を作成
	for category, items := range categoryItems {
		categoryID, ok := categoryMap[category]
		if !ok {
			continue
		}

		for i, name := range items {
			// 項目が既に存在するかチェック
			var count int64
			db.DB().Model(&evaluationEntity.EvaluationItem{}).
				Where("name = ? AND category_id = ?", name, categoryID).
				Count(&count)

			if count == 0 {
				categoryIDPtr := &categoryID
				item := evaluationEntity.NewEvaluationItem(name, categoryIDPtr, false, i+1)
				if err := db.DB().Create(item).Error; err != nil {
					return fmt.Errorf("failed to create item %s: %w", name, err)
				}
				log.Printf("Created item: %s in category %s", name, category)
			}
		}
	}

	// 共通タグを作成
	for i, name := range commonTags {
		// 項目が既に存在するかチェック
		var count int64
		db.DB().Model(&evaluationEntity.EvaluationItem{}).
			Where("name = ? AND is_common = ?", name, true).
			Count(&count)

		if count == 0 {
			item := evaluationEntity.NewEvaluationItem(name, nil, true, i+1)
			if err := db.DB().Create(item).Error; err != nil {
				return fmt.Errorf("failed to create common item %s: %w", name, err)
			}
			log.Printf("Created common item: %s", name)
		}
	}

	return nil
}
