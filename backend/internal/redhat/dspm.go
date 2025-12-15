package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type DataAsset struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`        // S3, RDS, Snowflake
	Sensitivity    string    `json:"sensitivity"` // PII, PCI, PHI
	Encryption     bool      `json:"encryption"`
	Exposure       string    `json:"exposure"` // Public, Internal
	LastClassified time.Time `json:"last_classified"`
}

type DSPMEngine struct {
	db *gorm.DB
}

func NewDSPMEngine(db *gorm.DB) *DSPMEngine {
	return &DSPMEngine{db: db}
}

func (e *DSPMEngine) GetAssets() []DataAsset {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "DSPM").Order("timestamp desc").Limit(10).Find(&events)

	var assets []DataAsset
	for _, ev := range events {
		assets = append(assets, DataAsset{
			ID:             fmt.Sprintf("dspm-%d", ev.ID),
			Name:           ev.Target,
			Type:           "S3 Bucket",
			Sensitivity:    ev.Severity, // Mapping Severity to Sensitivity for demo
			Encryption:     false,
			Exposure:       ev.Status,
			LastClassified: ev.Timestamp,
		})
	}

	if len(assets) == 0 {
		return []DataAsset{{ID: "pending", Name: "Pending", Type: "N/A", Sensitivity: "Low", Encryption: true, Exposure: "Internal", LastClassified: time.Now()}}
	}
	return assets
}
