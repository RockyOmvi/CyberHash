package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type RansomwareSim struct {
	ID          string    `json:"id"`
	Variant     string    `json:"variant"` // WannaCry, Ryuk, LockBit
	Status      string    `json:"status"`  // Encrypting, Blocked, Quarantined
	FilesLocked int       `json:"files_locked"`
	RansomNote  string    `json:"ransom_note"`
	Timestamp   time.Time `json:"timestamp"`
}

type RansomwareEngine struct {
	db *gorm.DB
}

func NewRansomwareEngine(db *gorm.DB) *RansomwareEngine {
	return &RansomwareEngine{db: db}
}

func (e *RansomwareEngine) GetSimulations() []RansomwareSim {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Ransomware").Order("timestamp desc").Limit(10).Find(&events)

	var sims []RansomwareSim
	for _, ev := range events {
		sims = append(sims, RansomwareSim{
			ID:          fmt.Sprintf("rans-%d", ev.ID),
			Variant:     ev.EventType,
			Status:      ev.Status,
			FilesLocked: 150, // Mock metric
			RansomNote:  ev.Details,
			Timestamp:   ev.Timestamp,
		})
	}

	if len(sims) == 0 {
		return []RansomwareSim{{ID: "pending", Variant: "Pending", Status: "Waiting", FilesLocked: 0, RansomNote: "N/A", Timestamp: time.Now()}}
	}
	return sims
}
