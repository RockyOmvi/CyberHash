package context

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ContextEvent struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	Context   string    `json:"context"` // "High Value Transaction"
	Risk      string    `json:"risk"`    // Elevated
	Action    string    `json:"action"`  // Step-up Auth
	Timestamp time.Time `json:"timestamp"`
}

type ContextEngine struct {
	db *gorm.DB
}

func NewContextEngine(db *gorm.DB) *ContextEngine {
	return &ContextEngine{db: db}
}

func (e *ContextEngine) GetEvents() []ContextEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Context").Order("timestamp desc").Limit(10).Find(&events)

	var ctxEvents []ContextEvent
	for _, ev := range events {
		ctxEvents = append(ctxEvents, ContextEvent{
			ID:        fmt.Sprintf("ctx-%d", ev.ID),
			User:      ev.Source,
			Context:   ev.EventType,
			Risk:      ev.Severity,
			Action:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(ctxEvents) == 0 {
		return []ContextEvent{{ID: "pending", User: "Pending", Context: "Waiting...", Risk: "Low", Action: "None", Timestamp: time.Now()}}
	}
	return ctxEvents
}
