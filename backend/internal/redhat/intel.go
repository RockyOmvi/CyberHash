package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ThreatFeed struct {
	ID          string    `json:"id"`
	Source      string    `json:"source"`     // AlienVault, CrowdStrike
	Indicator   string    `json:"indicator"`  // IP, Hash, Domain
	Type        string    `json:"type"`       // C2, Malware
	Confidence  int       `json:"confidence"` // 0-100
	LastUpdated time.Time `json:"last_updated"`
}

type IntelEngine struct {
	db *gorm.DB
}

func NewIntelEngine(db *gorm.DB) *IntelEngine {
	return &IntelEngine{db: db}
}

func (e *IntelEngine) GetFeeds() []ThreatFeed {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Intel").Order("timestamp desc").Limit(10).Find(&events)

	var feeds []ThreatFeed
	for _, ev := range events {
		feeds = append(feeds, ThreatFeed{
			ID:          fmt.Sprintf("intel-%d", ev.ID),
			Source:      "CyberShield Intel",
			Indicator:   ev.Source,
			Type:        ev.EventType,
			Confidence:  90,
			LastUpdated: ev.Timestamp,
		})
	}

	if len(feeds) == 0 {
		return []ThreatFeed{{ID: "pending", Source: "Pending", Indicator: "N/A", Type: "N/A", Confidence: 0, LastUpdated: time.Now()}}
	}
	return feeds
}
