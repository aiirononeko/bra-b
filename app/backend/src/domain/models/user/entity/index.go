package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User はユーザーを表すドメインモデルです
type User struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email     string `gorm:"uniqueIndex;not null"`
	AuthType  string `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// NewUser は新しいユーザーエンティティを作成します
func NewUser(email string, authType string) *User {
	now := time.Now()
	return &User{
		ID:        uuid.New().String(),
		Email:     email,
		AuthType:  authType,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// UpdateEmail はユーザーのメールアドレスを更新します
func (u *User) UpdateEmail(email string) {
	u.Email = email
	u.UpdatedAt = time.Now()
}

// UpdateAuthType は認証タイプを更新します
func (u *User) UpdateAuthType(authType string) {
	u.AuthType = authType
	u.UpdatedAt = time.Now()
}
