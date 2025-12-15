package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ExternalAsset struct {
	ID        string    `json:"id"`
	Domain    string    `json:"domain"`
	IP        string    `json:"ip"`
	Port      int       `json:"port"`
	Service   string    `json:"service"` // SSH, HTTP, RDP
	Vulns     int       `json:"vulns"`
	FirstSeen time.Time `json:"first_seen"`
}

type EASMEngine struct {
	db *gorm.DB
}

func NewEASMEngine(db *gorm.DB) *EASMEngine {
	return &EASMEngine{db: db}
}

func (e *EASMEngine) GetAssets() []ExternalAsset {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "EASM").Order("timestamp desc").Limit(10).Find(&events)

	var assets []ExternalAsset
	for _, ev := range events {
		assets = append(assets, ExternalAsset{
			ID:        fmt.Sprintf("easm-%d", ev.ID),
			Domain:    ev.Target,
			IP:        ev.Source,
			Port:      443,
			Service:   ev.EventType,
			Vulns:     3,
			FirstSeen: ev.Timestamp,
		})
	}

	if len(assets) == 0 {
		return []ExternalAsset{{ID: "pending", Domain: "Pending", IP: "0.0.0.0", Port: 0, Service: "N/A", Vulns: 0, FirstSeen: time.Now()}}
	}
	return assets
}
