package voice

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type VoiceAnalysis struct {
	ID         string    `json:"id"`
	Source     string    `json:"source"`     // Call-ID-123
	Caller     string    `json:"caller"`     // +1-555-0199
	Result     string    `json:"result"`     // Real, Deepfake
	Confidence float64   `json:"confidence"` // 98.5%
	Timestamp  time.Time `json:"timestamp"`
}

type DeepfakeScanner struct {
	db *gorm.DB
}

func NewDeepfakeScanner(db *gorm.DB) *DeepfakeScanner {
	return &DeepfakeScanner{db: db}
}

func (s *DeepfakeScanner) GetAnalyses() []VoiceAnalysis {
	var events []models.SimulationEvent
	s.db.Where("engine = ?", "Deepfake").Order("timestamp desc").Limit(10).Find(&events)

	var analyses []VoiceAnalysis
	for _, ev := range events {
		analyses = append(analyses, VoiceAnalysis{
			ID:         fmt.Sprintf("voice-%d", ev.ID),
			Source:     ev.Target,
			Caller:     ev.Source,
			Result:     ev.EventType,
			Confidence: 85.0 + rand.Float64()*14.0,
			Timestamp:  ev.Timestamp,
		})
	}

	if len(analyses) == 0 {
		return []VoiceAnalysis{{ID: "pending", Source: "Pending", Caller: "N/A", Result: "Waiting...", Confidence: 0, Timestamp: time.Now()}}
	}
	return analyses
}
