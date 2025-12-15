package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type SAAnomaly struct {
	ID       string    `json:"id"`
	Account  string    `json:"account"` // service-account-123
	Anomaly  string    `json:"anomaly"` // "Login from new IP"
	Severity string    `json:"severity"`
	Status   string    `json:"status"` // Investigating, Resolved
	Detected time.Time `json:"detected"`
}

type SAAnomalyEngine struct {
	db *gorm.DB
}

func NewSAAnomalyEngine(db *gorm.DB) *SAAnomalyEngine {
	return &SAAnomalyEngine{db: db}
}

func (e *SAAnomalyEngine) GetAnomalies() []SAAnomaly {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "SAAnomaly").Order("timestamp desc").Limit(10).Find(&events)

	var anomalies []SAAnomaly
	for _, ev := range events {
		anomalies = append(anomalies, SAAnomaly{
			ID:       fmt.Sprintf("sa-%d", ev.ID),
			Account:  ev.Source,
			Anomaly:  ev.Details,
			Severity: ev.Severity,
			Status:   ev.Status,
			Detected: ev.Timestamp,
		})
	}

	if len(anomalies) == 0 {
		return []SAAnomaly{{ID: "pending", Account: "Pending", Anomaly: "Waiting...", Severity: "Low", Status: "Waiting", Detected: time.Now()}}
	}
	return anomalies
}
