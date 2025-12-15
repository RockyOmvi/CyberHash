package infrastructure

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type EphemeralEnv struct {
	ID      string    `json:"id"`
	Name    string    `json:"name"`   // PR-123-Preview
	Status  string    `json:"status"` // Active, Destroyed
	TTL     string    `json:"ttl"`    // 2h remaining
	Cost    string    `json:"cost"`   // $0.45
	Created time.Time `json:"created"`
}

type EphemeralEngine struct {
	db *gorm.DB
}

func NewEphemeralEngine(db *gorm.DB) *EphemeralEngine {
	return &EphemeralEngine{db: db}
}

func (e *EphemeralEngine) GetEnvironments() []EphemeralEnv {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Ephemeral").Order("timestamp desc").Limit(10).Find(&events)

	var envs []EphemeralEnv
	for _, ev := range events {
		envs = append(envs, EphemeralEnv{
			ID:      fmt.Sprintf("env-%d", ev.ID),
			Name:    ev.Target,
			Status:  ev.Status,
			TTL:     ev.Details,
			Cost:    "$1.25",
			Created: ev.Timestamp,
		})
	}

	if len(envs) == 0 {
		return []EphemeralEnv{{ID: "pending", Name: "Pending", Status: "Waiting", TTL: "0", Cost: "$0.00", Created: time.Now()}}
	}
	return envs
}
