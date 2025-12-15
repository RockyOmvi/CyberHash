package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type RASPEvent struct {
	ID        string    `json:"id"`
	App       string    `json:"app"`
	Attack    string    `json:"attack"` // SQLi, XSS, RCE
	Payload   string    `json:"payload"`
	Action    string    `json:"action"` // Blocked
	Timestamp time.Time `json:"timestamp"`
}

type RASPEngine struct {
	db *gorm.DB
}

func NewRASPEngine(db *gorm.DB) *RASPEngine {
	return &RASPEngine{db: db}
}

func (e *RASPEngine) GetEvents() []RASPEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "RASP").Order("timestamp desc").Limit(10).Find(&events)

	var raspEvents []RASPEvent
	for _, ev := range events {
		raspEvents = append(raspEvents, RASPEvent{
			ID:        fmt.Sprintf("rasp-%d", ev.ID),
			App:       ev.Target,
			Attack:    ev.EventType,
			Payload:   ev.Details,
			Action:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(raspEvents) == 0 {
		return []RASPEvent{{ID: "pending", App: "Pending", Attack: "N/A", Payload: "Waiting...", Action: "Waiting", Timestamp: time.Now()}}
	}
	return raspEvents
}
