package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ZeroDaySim struct {
	ID        string    `json:"id"`
	CVE       string    `json:"cve"`       // Simulated CVE-2025-XXXX
	Component string    `json:"component"` // Apache Struts, Log4j
	Severity  string    `json:"severity"`
	Status    string    `json:"status"` // Patched, Vulnerable, Exploited
	Detected  time.Time `json:"detected"`
}

type ZeroDayEngine struct {
	db *gorm.DB
}

func NewZeroDayEngine(db *gorm.DB) *ZeroDayEngine {
	return &ZeroDayEngine{db: db}
}

func (e *ZeroDayEngine) GetSimulations() []ZeroDaySim {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "ZeroDay").Order("timestamp desc").Limit(10).Find(&events)

	var sims []ZeroDaySim
	for _, ev := range events {
		sims = append(sims, ZeroDaySim{
			ID:        fmt.Sprintf("zd-%d", ev.ID),
			CVE:       ev.EventType,
			Component: ev.Target,
			Severity:  ev.Severity,
			Status:    ev.Status,
			Detected:  ev.Timestamp,
		})
	}

	if len(sims) == 0 {
		return []ZeroDaySim{{ID: "pending", CVE: "Pending", Component: "N/A", Severity: "Low", Status: "Waiting", Detected: time.Now()}}
	}
	return sims
}
