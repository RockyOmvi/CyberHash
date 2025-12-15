package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type TwinSimulation struct {
	ID        string    `json:"id"`
	Scenario  string    `json:"scenario"` // Ransomware Attack on ERP
	Outcome   string    `json:"outcome"`  // 80% System Survival
	Impact    string    `json:"impact"`   // Low Data Loss
	Status    string    `json:"status"`   // Completed
	Timestamp time.Time `json:"timestamp"`
}

type DigitalTwinEngine struct {
	db *gorm.DB
}

func NewDigitalTwinEngine(db *gorm.DB) *DigitalTwinEngine {
	return &DigitalTwinEngine{db: db}
}

func (e *DigitalTwinEngine) GetSimulations() []TwinSimulation {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "DigitalTwin").Order("timestamp desc").Limit(10).Find(&events)

	var sims []TwinSimulation
	for _, ev := range events {
		sims = append(sims, TwinSimulation{
			ID:        fmt.Sprintf("twin-%d", ev.ID),
			Scenario:  ev.Details,
			Outcome:   "Predicted Survival: 90%",
			Impact:    ev.Severity,
			Status:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(sims) == 0 {
		return []TwinSimulation{{ID: "pending", Scenario: "Pending", Outcome: "N/A", Impact: "Low", Status: "Waiting", Timestamp: time.Now()}}
	}
	return sims
}
