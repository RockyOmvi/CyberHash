package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type DriftEvent struct {
	ID        string    `json:"id"`
	Resource  string    `json:"resource"` // aws_s3_bucket.my-bucket
	Expected  string    `json:"expected"` // versioning: enabled
	Actual    string    `json:"actual"`   // versioning: disabled
	Severity  string    `json:"severity"`
	Timestamp time.Time `json:"timestamp"`
}

type DriftEngine struct {
	db *gorm.DB
}

func NewDriftEngine(db *gorm.DB) *DriftEngine {
	return &DriftEngine{db: db}
}

func (e *DriftEngine) GetDriftEvents() []DriftEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Drift").Order("timestamp desc").Limit(10).Find(&events)

	var drifts []DriftEvent
	for _, ev := range events {
		drifts = append(drifts, DriftEvent{
			ID:        fmt.Sprintf("drift-%d", ev.ID),
			Resource:  ev.Target,
			Expected:  "Secure Config",
			Actual:    ev.Details,
			Severity:  ev.Severity,
			Timestamp: ev.Timestamp,
		})
	}

	if len(drifts) == 0 {
		return []DriftEvent{{ID: "pending", Resource: "Pending", Expected: "N/A", Actual: "Waiting...", Severity: "Low", Timestamp: time.Now()}}
	}
	return drifts
}
