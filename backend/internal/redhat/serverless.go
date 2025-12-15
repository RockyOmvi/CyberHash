package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ServerlessFunc struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Runtime  string    `json:"runtime"` // Node.js 18, Python 3.9
	Risk     string    `json:"risk"`    // High, Medium
	Issues   []string  `json:"issues"`  // "Over-privileged IAM", "Vulnerable Dependency"
	LastScan time.Time `json:"last_scan"`
}

type ServerlessEngine struct {
	db *gorm.DB
}

func NewServerlessEngine(db *gorm.DB) *ServerlessEngine {
	return &ServerlessEngine{db: db}
}

func (e *ServerlessEngine) GetFunctions() []ServerlessFunc {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Serverless").Order("timestamp desc").Limit(10).Find(&events)

	var funcs []ServerlessFunc
	for _, ev := range events {
		funcs = append(funcs, ServerlessFunc{
			ID:       fmt.Sprintf("sls-%d", ev.ID),
			Name:     ev.Target,
			Runtime:  "Node.js 18",
			Risk:     ev.Severity,
			Issues:   []string{ev.Details},
			LastScan: ev.Timestamp,
		})
	}

	if len(funcs) == 0 {
		return []ServerlessFunc{{ID: "pending", Name: "Pending", Runtime: "N/A", Risk: "Low", Issues: []string{"Waiting..."}, LastScan: time.Now()}}
	}
	return funcs
}
