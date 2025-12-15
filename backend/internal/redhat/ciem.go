package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type Entitlement struct {
	ID         string    `json:"id"`
	Principal  string    `json:"principal"`  // User or Role
	Permission string    `json:"permission"` // s3:GetObject
	Resource   string    `json:"resource"`   // *
	Status     string    `json:"status"`     // Over-privileged, Unused
	LastUsed   time.Time `json:"last_used"`
}

type CIEMEngine struct {
	db *gorm.DB
}

func NewCIEMEngine(db *gorm.DB) *CIEMEngine {
	return &CIEMEngine{db: db}
}

func (e *CIEMEngine) GetEntitlements() []Entitlement {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "CIEM").Order("timestamp desc").Limit(10).Find(&events)

	var ents []Entitlement
	for _, ev := range events {
		ents = append(ents, Entitlement{
			ID:         fmt.Sprintf("ciem-%d", ev.ID),
			Principal:  ev.Source,
			Permission: ev.EventType,
			Resource:   ev.Target,
			Status:     ev.Status,
			LastUsed:   ev.Timestamp,
		})
	}

	if len(ents) == 0 {
		return []Entitlement{{ID: "pending", Principal: "Pending", Permission: "N/A", Resource: "N/A", Status: "Waiting", LastUsed: time.Now()}}
	}
	return ents
}
