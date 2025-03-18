package entity

import (
	"time"

	"github.com/google/uuid"
)

// Tip はバリスタへのチップを表すドメインモデルです
type Tip struct {
	ID                    string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	BaristaProfileID      string  `gorm:"type:uuid;index;not null"`
	SenderUserID          string  `gorm:"type:uuid;index"`
	Amount                float64 `gorm:"not null"`
	Message               string  `gorm:"type:text"`
	StripePaymentIntentID string  `gorm:"type:varchar(100);not null;uniqueIndex"`
	SentAt                time.Time
}

// NewTip は新しいチップエンティティを作成します
func NewTip(baristaProfileID string, senderUserID string, amount float64, message string, stripePaymentIntentID string) *Tip {
	return &Tip{
		ID:                    uuid.New().String(),
		BaristaProfileID:      baristaProfileID,
		SenderUserID:          senderUserID,
		Amount:                amount,
		Message:               message,
		StripePaymentIntentID: stripePaymentIntentID,
		SentAt:                time.Now(),
	}
}

// UpdateMessage はチップのメッセージを更新します
func (t *Tip) UpdateMessage(message string) {
	t.Message = message
}

// UpdatePaymentStatus はStripeの支払いIDを更新します
func (t *Tip) UpdatePaymentStatus(stripePaymentIntentID string) {
	t.StripePaymentIntentID = stripePaymentIntentID
}
