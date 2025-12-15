package isolation

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type RBISession struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	URL       string    `json:"url"`      // "malicious-site.com"
	Status    string    `json:"status"`   // "Isolated", "Active"
	Duration  string    `json:"duration"` // "5m 23s"
	Timestamp time.Time `json:"timestamp"`
}

type RBIEngine struct {
	db *gorm.DB
}

func NewRBIEngine(db *gorm.DB) *RBIEngine {
	return &RBIEngine{db: db}
}

func (e *RBIEngine) GetSessions() []RBISession {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "RBI").Order("timestamp desc").Limit(10).Find(&events)

	var sessions []RBISession
	for _, ev := range events {
		sessions = append(sessions, RBISession{
			ID:        fmt.Sprintf("rbi-%d", ev.ID),
			User:      ev.Source,
			URL:       ev.Target,
			Status:    ev.Status,
			Duration:  "5m",
			Timestamp: ev.Timestamp,
		})
	}

	if len(sessions) == 0 {
		return []RBISession{{ID: "pending", User: "Pending", URL: "Waiting...", Status: "Waiting", Duration: "0", Timestamp: time.Now()}}
	}
	return sessions
}
