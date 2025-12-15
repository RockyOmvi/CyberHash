package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type SocialCampaign struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"` // Phishing, Vishing, Smishing
	Target    string    `json:"target"`
	Status    string    `json:"status"`
	ClickRate float64   `json:"click_rate"`
	Launched  time.Time `json:"launched"`
}

type SocialEngine struct {
	db *gorm.DB
}

func NewSocialEngine(db *gorm.DB) *SocialEngine {
	return &SocialEngine{db: db}
}

func (e *SocialEngine) GetCampaigns() []SocialCampaign {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Social").Order("timestamp desc").Limit(10).Find(&events)

	var campaigns []SocialCampaign
	for _, ev := range events {
		campaigns = append(campaigns, SocialCampaign{
			ID:        fmt.Sprintf("soc-%d", ev.ID),
			Name:      ev.Details,
			Type:      ev.EventType,
			Target:    ev.Target,
			Status:    ev.Status,
			ClickRate: 12.5, // Mock metric for now
			Launched:  ev.Timestamp,
		})
	}

	if len(campaigns) == 0 {
		return []SocialCampaign{{ID: "sim-pending", Name: "Simulation Pending", Type: "Phishing", Target: "All Users", Status: "Pending", Launched: time.Now()}}
	}
	return campaigns
}
