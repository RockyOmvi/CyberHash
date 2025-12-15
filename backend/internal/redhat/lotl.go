package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type LotLActivity struct {
	ID        string    `json:"id"`
	Tool      string    `json:"tool"`    // PowerShell, WMI, Bash
	Command   string    `json:"command"` // The exact command executed
	User      string    `json:"user"`    // User context
	Host      string    `json:"host"`
	RiskScore int       `json:"risk_score"`
	Detected  time.Time `json:"detected"`
}

type LotLEngine struct {
	db *gorm.DB
}

func NewLotLEngine(db *gorm.DB) *LotLEngine {
	return &LotLEngine{db: db}
}

func (e *LotLEngine) GetActivities() []LotLActivity {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "LotL").Order("timestamp desc").Limit(10).Find(&events)

	var activities []LotLActivity
	for _, ev := range events {
		activities = append(activities, LotLActivity{
			ID:        fmt.Sprintf("lotl-%d", ev.ID),
			Tool:      ev.EventType,
			Command:   ev.Details,
			User:      "SYSTEM",
			Host:      ev.Source,
			RiskScore: 85,
			Detected:  ev.Timestamp,
		})
	}

	if len(activities) == 0 {
		return []LotLActivity{{ID: "pending", Tool: "Pending", Command: "Waiting for simulation...", User: "N/A", Host: "N/A", RiskScore: 0, Detected: time.Now()}}
	}
	return activities
}
