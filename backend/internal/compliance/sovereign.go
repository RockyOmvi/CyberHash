package compliance

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ResidencyStatus struct {
	ID        string    `json:"id"`
	Region    string    `json:"region"` // EU-Germany
	Data      string    `json:"data"`   // Customer PII
	Status    string    `json:"status"` // Compliant
	Issues    []string  `json:"issues"` // None
	Timestamp time.Time `json:"timestamp"`
}

type SovereignEngine struct {
	db *gorm.DB
}

func NewSovereignEngine(db *gorm.DB) *SovereignEngine {
	return &SovereignEngine{db: db}
}

func (e *SovereignEngine) GetResidencyStatus() []ResidencyStatus {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Sovereign").Order("timestamp desc").Limit(10).Find(&events)

	var statuses []ResidencyStatus
	for _, ev := range events {
		statuses = append(statuses, ResidencyStatus{
			ID:        fmt.Sprintf("sov-%d", ev.ID),
			Region:    ev.Source,
			Data:      ev.Target,
			Status:    ev.Status,
			Issues:    []string{ev.Details},
			Timestamp: ev.Timestamp,
		})
	}

	if len(statuses) == 0 {
		return []ResidencyStatus{{ID: "pending", Region: "Pending", Data: "N/A", Status: "Waiting", Issues: []string{"Waiting..."}, Timestamp: time.Now()}}
	}
	return statuses
}
