package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type PolicyCheck struct {
	ID        string    `json:"id"`
	Policy    string    `json:"policy"`   // "S3 Buckets must be private"
	Resource  string    `json:"resource"` // aws_s3_bucket.public-bucket
	Status    string    `json:"status"`   // Failed, Passed
	Severity  string    `json:"severity"`
	Timestamp time.Time `json:"timestamp"`
}

type PolicyEngine struct {
	db *gorm.DB
}

func NewPolicyEngine(db *gorm.DB) *PolicyEngine {
	return &PolicyEngine{db: db}
}

func (e *PolicyEngine) GetChecks() []PolicyCheck {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Policy").Order("timestamp desc").Limit(10).Find(&events)

	var checks []PolicyCheck
	for _, ev := range events {
		checks = append(checks, PolicyCheck{
			ID:        fmt.Sprintf("pol-%d", ev.ID),
			Policy:    ev.Details,
			Resource:  ev.Target,
			Status:    ev.Status,
			Severity:  ev.Severity,
			Timestamp: ev.Timestamp,
		})
	}

	if len(checks) == 0 {
		return []PolicyCheck{{ID: "pending", Policy: "Pending", Resource: "N/A", Status: "Waiting", Severity: "Low", Timestamp: time.Now()}}
	}
	return checks
}
