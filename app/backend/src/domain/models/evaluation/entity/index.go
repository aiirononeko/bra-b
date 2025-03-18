package entity

import (
	"time"

	"github.com/google/uuid"
)

// Evaluation はバリスタへの評価を表すドメインモデルです
type Evaluation struct {
	ID               string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	BaristaProfileID string    `gorm:"type:uuid;index;not null"`
	EvaluatorUserID  *string   `gorm:"type:uuid;index"`
	EvaluatedAt      time.Time `gorm:"autoCreateTime"`
}

// NewEvaluation は新しい評価エンティティを作成します
func NewEvaluation(baristaProfileID string, evaluatorUserID *string) *Evaluation {
	return &Evaluation{
		ID:               uuid.New().String(),
		BaristaProfileID: baristaProfileID,
		EvaluatorUserID:  evaluatorUserID,
		EvaluatedAt:      time.Now(),
	}
}

// EvaluationDetail は評価の詳細情報を表すドメインモデルです
type EvaluationDetail struct {
	ID               string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EvaluationID     string `gorm:"type:uuid;index;not null"`
	EvaluationItemID string `gorm:"type:uuid;index;not null"`
}

// NewEvaluationDetail は新しい評価詳細エンティティを作成します
func NewEvaluationDetail(evaluationID string, evaluationItemID string) *EvaluationDetail {
	return &EvaluationDetail{
		ID:               uuid.New().String(),
		EvaluationID:     evaluationID,
		EvaluationItemID: evaluationItemID,
	}
}
