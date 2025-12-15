package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type SchemaViolation struct {
	ID        string    `json:"id"`
	API       string    `json:"api"`    // /api/v1/users
	Method    string    `json:"method"` // POST
	Issue     string    `json:"issue"`  // "Unexpected field 'admin': true"
	Severity  string    `json:"severity"`
	Timestamp time.Time `json:"timestamp"`
}

type SchemaEngine struct {
	db *gorm.DB
}

func NewSchemaEngine(db *gorm.DB) *SchemaEngine {
	return &SchemaEngine{db: db}
}

func (e *SchemaEngine) GetViolations() []SchemaViolation {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Schema").Order("timestamp desc").Limit(10).Find(&events)

	var violations []SchemaViolation
	for _, ev := range events {
		violations = append(violations, SchemaViolation{
			ID:        fmt.Sprintf("sch-%d", ev.ID),
			API:       ev.Target,
			Method:    "POST",
			Issue:     ev.Details,
			Severity:  ev.Severity,
			Timestamp: ev.Timestamp,
		})
	}

	if len(violations) == 0 {
		return []SchemaViolation{{ID: "pending", API: "Pending", Method: "N/A", Issue: "Waiting...", Severity: "Low", Timestamp: time.Now()}}
	}
	return violations
}
