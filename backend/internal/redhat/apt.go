package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type APTProfile struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`        // e.g., "APT29 (Cozy Bear)"
	Description string    `json:"description"` // "Russian state-sponsored group targeting gov/energy"
	TTPs        []string  `json:"ttps"`        // "Spearphishing", "PowerShell Empire", "Mimikatz"
	Status      string    `json:"status"`      // "Simulating", "Detected", "Blocked"
	LastSeen    time.Time `json:"last_seen"`
}

type APTEngine struct {
	db *gorm.DB
}

func NewAPTEngine(db *gorm.DB) *APTEngine {
	return &APTEngine{db: db}
}

func (e *APTEngine) GetActiveSimulations() []APTProfile {
	var events []models.SimulationEvent
	// Fetch dynamic events from DB
	if err := e.db.Where("engine = ?", "APT").Order("timestamp desc").Limit(10).Find(&events).Error; err != nil {
		fmt.Printf("Error fetching APT events: %v\n", err)
	}

	var profiles []APTProfile
	for _, ev := range events {
		profiles = append(profiles, APTProfile{
			ID:          fmt.Sprintf("%d", ev.ID),
			Name:        ev.EventType, // e.g., "APT_DETECTED"
			Description: ev.Details,
			TTPs:        []string{ev.Source, ev.Target}, // Mapping source/target to TTPs for display
			Status:      ev.Status,
			LastSeen:    ev.Timestamp,
		})
	}

	// Fallback if no events yet (so UI isn't empty initially)
	if len(profiles) == 0 {
		return []APTProfile{
			{
				ID:          "apt-sim-waiting",
				Name:        "Simulation Pending",
				Description: "Waiting for simulation engine to generate events...",
				TTPs:        []string{"Pending"},
				Status:      "Initializing",
				LastSeen:    time.Now(),
			},
		}
	}

	return profiles
}
