package identity

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type IdentityAlert struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	User      string    `json:"user"`
	Attack    string    `json:"attack"` // e.g., "Golden Ticket", "DCSync"
	Status    string    `json:"status"`
	RiskScore int       `json:"risk_score"`
}

type ITDREngine struct {
	db *gorm.DB
}

func NewITDREngine(db *gorm.DB) *ITDREngine {
	return &ITDREngine{db: db}
}

func (e *ITDREngine) GetAlerts() []IdentityAlert {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "ITDR").Order("timestamp desc").Limit(10).Find(&events)

	var alerts []IdentityAlert
	for _, ev := range events {
		alerts = append(alerts, IdentityAlert{
			ID:        fmt.Sprintf("id-%d", ev.ID),
			Timestamp: ev.Timestamp,
			User:      ev.Source,
			Attack:    ev.EventType,
			Status:    ev.Status,
			RiskScore: 90, // Mock score based on severity
		})
	}

	if len(alerts) == 0 {
		return []IdentityAlert{{ID: "pending", Timestamp: time.Now(), User: "Pending", Attack: "Waiting...", Status: "Active", RiskScore: 0}}
	}
	return alerts
}
