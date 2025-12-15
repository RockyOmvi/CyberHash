package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type QuantumTunnel struct {
	ID        string    `json:"id"`
	Source    string    `json:"source"`    // HQ-Main
	Dest      string    `json:"dest"`      // DC-Backup
	Algorithm string    `json:"algorithm"` // Kyber-1024
	Status    string    `json:"status"`    // Secured, Rekeying
	Latency   string    `json:"latency"`   // 12ms
	Timestamp time.Time `json:"timestamp"`
}

type QuantumEngine struct {
	db *gorm.DB
}

func NewQuantumEngine(db *gorm.DB) *QuantumEngine {
	return &QuantumEngine{db: db}
}

func (e *QuantumEngine) GetTunnels() []QuantumTunnel {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Quantum").Order("timestamp desc").Limit(10).Find(&events)

	var tunnels []QuantumTunnel
	for _, ev := range events {
		tunnels = append(tunnels, QuantumTunnel{
			ID:        fmt.Sprintf("qtm-%d", ev.ID),
			Source:    ev.Source,
			Dest:      ev.Target,
			Algorithm: "Kyber-1024",
			Status:    ev.Status,
			Latency:   "15ms",
			Timestamp: ev.Timestamp,
		})
	}

	if len(tunnels) == 0 {
		return []QuantumTunnel{{ID: "pending", Source: "Pending", Dest: "N/A", Algorithm: "N/A", Status: "Waiting", Latency: "0ms", Timestamp: time.Now()}}
	}
	return tunnels
}
