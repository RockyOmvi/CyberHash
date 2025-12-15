package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type GodEvent struct {
	ID        string    `json:"id"`
	Event     string    `json:"event"`  // "Global Policy Override"
	Scope     string    `json:"scope"`  // All Regions
	Admin     string    `json:"admin"`  // root
	Status    string    `json:"status"` // Executed
	Timestamp time.Time `json:"timestamp"`
}

type GodModeEngine struct {
	db *gorm.DB
}

func NewGodModeEngine(db *gorm.DB) *GodModeEngine {
	return &GodModeEngine{db: db}
}

func (e *GodModeEngine) GetTimeline() []GodEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "GodMode").Order("timestamp desc").Limit(10).Find(&events)

	var timeline []GodEvent
	for _, ev := range events {
		timeline = append(timeline, GodEvent{
			ID:        fmt.Sprintf("god-%d", ev.ID),
			Event:     ev.EventType,
			Scope:     ev.Target,
			Admin:     "System",
			Status:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(timeline) == 0 {
		return []GodEvent{{ID: "pending", Event: "Pending", Scope: "N/A", Admin: "N/A", Status: "Waiting", Timestamp: time.Now()}}
	}
	return timeline
}
