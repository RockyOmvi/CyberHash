package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type JITRequest struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	Role      string    `json:"role"`     // AWSAdmin, DBSuperUser
	Duration  string    `json:"duration"` // 1h, 4h
	Reason    string    `json:"reason"`   // "Incident Response"
	Status    string    `json:"status"`   // Approved, Pending, Revoked
	Timestamp time.Time `json:"timestamp"`
}

type JITEngine struct {
	db *gorm.DB
}

func NewJITEngine(db *gorm.DB) *JITEngine {
	return &JITEngine{db: db}
}

func (e *JITEngine) GetRequests() []JITRequest {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "JIT").Order("timestamp desc").Limit(10).Find(&events)

	var reqs []JITRequest
	for _, ev := range events {
		reqs = append(reqs, JITRequest{
			ID:        fmt.Sprintf("jit-%d", ev.ID),
			User:      ev.Source,
			Role:      ev.EventType,
			Duration:  "1h",
			Reason:    ev.Details,
			Status:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(reqs) == 0 {
		return []JITRequest{{ID: "pending", User: "Pending", Role: "N/A", Duration: "0", Reason: "Waiting...", Status: "Waiting", Timestamp: time.Now()}}
	}
	return reqs
}
