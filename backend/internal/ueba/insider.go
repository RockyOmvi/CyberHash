package ueba

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type InsiderPrediction struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	Risk      string    `json:"risk"`   // High, Medium
	Reason    string    `json:"reason"` // "Data Exfiltration Pattern"
	Score     int       `json:"score"`  // 85
	Timestamp time.Time `json:"timestamp"`
}

type InsiderThreatEngine struct {
	db *gorm.DB
}

func NewInsiderThreatEngine(db *gorm.DB) *InsiderThreatEngine {
	return &InsiderThreatEngine{db: db}
}

func (e *InsiderThreatEngine) GetPredictions() []InsiderPrediction {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Insider").Order("timestamp desc").Limit(10).Find(&events)

	var preds []InsiderPrediction
	for _, ev := range events {
		preds = append(preds, InsiderPrediction{
			ID:        fmt.Sprintf("ins-%d", ev.ID),
			User:      ev.Source,
			Risk:      ev.Severity,
			Reason:    ev.Details,
			Score:     85, // Mock score
			Timestamp: ev.Timestamp,
		})
	}

	if len(preds) == 0 {
		return []InsiderPrediction{{ID: "pending", User: "Pending", Risk: "Low", Reason: "Waiting...", Score: 0, Timestamp: time.Now()}}
	}
	return preds
}
