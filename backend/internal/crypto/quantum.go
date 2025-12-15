package crypto

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type QuantumKey struct {
	ID        string    `json:"id"`
	Algorithm string    `json:"algorithm"` // Kyber-1024
	Strength  int       `json:"strength"`  // 256 bits
	Status    string    `json:"status"`    // Active, Rotated
	Created   time.Time `json:"created"`
}

type QuantumEngine struct {
	db *gorm.DB
}

func NewQuantumEngine(db *gorm.DB) *QuantumEngine {
	return &QuantumEngine{db: db}
}

func (e *QuantumEngine) GetKeys() []QuantumKey {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "QuantumCrypto").Order("timestamp desc").Limit(10).Find(&events)

	var keys []QuantumKey
	for _, ev := range events {
		keys = append(keys, QuantumKey{
			ID:        fmt.Sprintf("key-%d", ev.ID),
			Algorithm: ev.EventType,
			Strength:  256,
			Status:    ev.Status,
			Created:   ev.Timestamp,
		})
	}

	if len(keys) == 0 {
		return []QuantumKey{{ID: "pending", Algorithm: "Pending", Strength: 0, Status: "Waiting", Created: time.Now()}}
	}
	return keys
}
