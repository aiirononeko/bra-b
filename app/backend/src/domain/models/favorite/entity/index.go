package entity

import (
	"time"

	"github.com/google/uuid"
)

// Favorite はユーザーのお気に入りバリスタを表すドメインモデルです
type Favorite struct {
	ID               string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID           string `gorm:"type:uuid;index;not null"`
	BaristaProfileID string `gorm:"type:uuid;index;not null"`
	CreatedAt        time.Time
}

// NewFavorite は新しいお気に入りエンティティを作成します
func NewFavorite(userID string, baristaProfileID string) *Favorite {
	return &Favorite{
		ID:               uuid.New().String(),
		UserID:           userID,
		BaristaProfileID: baristaProfileID,
		CreatedAt:        time.Now(),
	}
}
