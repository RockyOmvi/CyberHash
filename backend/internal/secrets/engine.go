package secrets

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type SecretMesh struct {
	ID       string    `json:"id"`
	Service  string    `json:"service"`  // Payment-Service
	Secret   string    `json:"secret"`   // API_KEY_STRIPE
	Rotation string    `json:"rotation"` // 24h
	Status   string    `json:"status"`   // Rotated, Expiring
	LastUsed time.Time `json:"last_used"`
}

type SecretsEngine struct {
	db *gorm.DB
}

func NewSecretsEngine(db *gorm.DB) *SecretsEngine {
	return &SecretsEngine{db: db}
}

func (e *SecretsEngine) GetSecretsMesh() []SecretMesh {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Secrets").Order("timestamp desc").Limit(10).Find(&events)

	var mesh []SecretMesh
	for _, ev := range events {
		mesh = append(mesh, SecretMesh{
			ID:       fmt.Sprintf("sec-%d", ev.ID),
			Service:  ev.Source,
			Secret:   ev.Target,
			Rotation: "24h",
			Status:   ev.Status,
			LastUsed: ev.Timestamp,
		})
	}

	if len(mesh) == 0 {
		return []SecretMesh{{ID: "pending", Service: "Pending", Secret: "N/A", Rotation: "0", Status: "Waiting", LastUsed: time.Now()}}
	}
	return mesh
}
