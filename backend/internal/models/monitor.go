package models

import (
	"time"

	"gorm.io/gorm"
)

type SecurityLog struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	IPAddress  string         `json:"ip_address"`
	Method     string         `json:"method"`
	Path       string         `json:"path"`
	Payload    string         `json:"payload"` // Request body or query params
	RiskScore  int            `json:"risk_score"`
	AttackType string         `json:"attack_type"` // SQLi, XSS, etc.
	Status     string         `json:"status"`      // Blocked, Logged, Resolved
}

type BlockedIP struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	IPAddress string         `gorm:"uniqueIndex" json:"ip_address"`
	Reason    string         `json:"reason"`
	BlockedBy string         `json:"blocked_by"` // System or Admin
	ExpiresAt *time.Time     `json:"expires_at"` // Null for permanent
}
