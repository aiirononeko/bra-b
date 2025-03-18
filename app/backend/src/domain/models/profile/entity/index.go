package entity

import (
	"time"

	"github.com/google/uuid"
)

// Profile はプロフィールを表すドメインモデルです
type Profile struct {
	ID          string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      string `gorm:"type:uuid;uniqueIndex;not null"`
	Type        string `gorm:"type:varchar(20);not null"` // バリスタ、カスタマーなどのタイプ
	DisplayName string `gorm:"type:varchar(100);not null"`
	IconURL     string `gorm:"type:text"`
	Bio         string `gorm:"type:text"`
	SNSLinks    string `gorm:"type:text"`
	ShopName    string `gorm:"type:varchar(100)"`
	CreatedAt   time.Time
}

// NewProfile は新しいプロフィールエンティティを作成します
func NewProfile(userID, profileType, displayName string) *Profile {
	return &Profile{
		ID:          uuid.New().String(),
		UserID:      userID,
		Type:        profileType,
		DisplayName: displayName,
		CreatedAt:   time.Time{},
	}
}

// UpdateDisplayName はプロフィールの表示名を更新します
func (p *Profile) UpdateDisplayName(displayName string) {
	p.DisplayName = displayName
}

// UpdateIcon はプロフィールのアイコンURLを更新します
func (p *Profile) UpdateIcon(iconURL string) {
	p.IconURL = iconURL
}

// UpdateBio はプロフィールの自己紹介を更新します
func (p *Profile) UpdateBio(bio string) {
	p.Bio = bio
}

// UpdateSNSLinks はプロフィールのSNSリンクを更新します
func (p *Profile) UpdateSNSLinks(snsLinks string) {
	p.SNSLinks = snsLinks
}

// UpdateShopName はプロフィールの店舗名を更新します
func (p *Profile) UpdateShopName(shopName string) {
	p.ShopName = shopName
}
