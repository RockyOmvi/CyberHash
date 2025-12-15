package redteam

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type CARTCampaign struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`      // "Operation Blackout"
	Objective string    `json:"objective"` // "Domain Admin Compromise"
	Status    string    `json:"status"`    // "Active", "Completed"
	Progress  int       `json:"progress"`  // 45%
	Timestamp time.Time `json:"timestamp"`
}

type CARTEngine struct {
	db *gorm.DB
}

func NewCARTEngine(db *gorm.DB) *CARTEngine {
	return &CARTEngine{db: db}
}

func (e *CARTEngine) GetCampaigns() []CARTCampaign {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "CART").Order("timestamp desc").Limit(10).Find(&events)

	var campaigns []CARTCampaign
	for _, ev := range events {
		campaigns = append(campaigns, CARTCampaign{
			ID:        fmt.Sprintf("cart-%d", ev.ID),
			Name:      ev.Target,
			Objective: ev.EventType,
			Status:    ev.Status,
			Progress:  45, // Mock progress
			Timestamp: ev.Timestamp,
		})
	}

	if len(campaigns) == 0 {
		return []CARTCampaign{{ID: "pending", Name: "Pending", Objective: "Waiting...", Status: "Waiting", Progress: 0, Timestamp: time.Now()}}
	}
	return campaigns
}
