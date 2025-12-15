package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type AttackPath struct {
	ID          string    `json:"id"`
	StartNode   string    `json:"start_node"` // Compromised User
	EndNode     string    `json:"end_node"`   // Domain Admin
	Hops        int       `json:"hops"`
	Probability string    `json:"probability"` // High, Medium
	LastChecked time.Time `json:"last_checked"`
}

type ADEngine struct {
	db *gorm.DB
}

func NewADEngine(db *gorm.DB) *ADEngine {
	return &ADEngine{db: db}
}

func (e *ADEngine) GetAttackPaths() []AttackPath {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "AD").Order("timestamp desc").Limit(10).Find(&events)

	var paths []AttackPath
	for _, ev := range events {
		paths = append(paths, AttackPath{
			ID:          fmt.Sprintf("ad-%d", ev.ID),
			StartNode:   ev.Source,
			EndNode:     ev.Target,
			Hops:        3,
			Probability: ev.Severity,
			LastChecked: ev.Timestamp,
		})
	}

	if len(paths) == 0 {
		return []AttackPath{{ID: "pending", StartNode: "Pending", EndNode: "Pending", Hops: 0, Probability: "Low", LastChecked: time.Now()}}
	}
	return paths
}
