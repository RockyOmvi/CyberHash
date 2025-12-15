package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type Evidence struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`   // Log, Pcap, Memory Dump
	Source    string    `json:"source"` // Host-01
	Size      string    `json:"size"`   // 50MB
	Hash      string    `json:"hash"`   // SHA256
	Collected time.Time `json:"collected"`
}

type EvidenceEngine struct {
	db *gorm.DB
}

func NewEvidenceEngine(db *gorm.DB) *EvidenceEngine {
	return &EvidenceEngine{db: db}
}

func (e *EvidenceEngine) GetEvidence() []Evidence {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Evidence").Order("timestamp desc").Limit(10).Find(&events)

	var evidence []Evidence
	for _, ev := range events {
		evidence = append(evidence, Evidence{
			ID:        fmt.Sprintf("ev-%d", ev.ID),
			Type:      ev.EventType,
			Source:    ev.Source,
			Size:      "10MB",
			Hash:      "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
			Collected: ev.Timestamp,
		})
	}

	if len(evidence) == 0 {
		return []Evidence{{ID: "pending", Type: "Pending", Source: "N/A", Size: "0", Hash: "N/A", Collected: time.Now()}}
	}
	return evidence
}
