package simulation

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type SimulationEngine struct {
	db *gorm.DB
}

func NewSimulationEngine(db *gorm.DB) *SimulationEngine {
	return &SimulationEngine{db: db}
}

func (s *SimulationEngine) Start() {
	go func() {
		for {
			s.generateRandomEvent()
			time.Sleep(30 * time.Second) // Generate event every 30s
		}
	}()
}

func (s *SimulationEngine) generateRandomEvent() {
	engines := []string{
		"APT", "Quantum", "IoT", "DigitalTwin", "GodMode", "LLMFirewall", "ZeroDay", "Ransomware",
		"ITDR", "APM", "Ephemeral", "Deepfake", "Context", "Secrets", "ZKP", "Insider", "CART", "RBI", "Sovereign", "QuantumCrypto",
	}
	severities := []string{"Critical", "High", "Medium", "Low"}

	engine := engines[rand.Intn(len(engines))]

	event := models.SimulationEvent{
		Engine:    engine,
		EventType: fmt.Sprintf("%s_DETECTED", engine),
		Severity:  severities[rand.Intn(len(severities))],
		Source:    fmt.Sprintf("192.168.1.%d", rand.Intn(255)),
		Target:    "Production-DB",
		Details:   fmt.Sprintf("Simulated %s activity detected by CyberShield AI", engine),
		Status:    "Active",
		Timestamp: time.Now(),
	}

	if err := s.db.Create(&event).Error; err != nil {
		fmt.Printf("Failed to create simulation event: %v\n", err)
	} else {
		fmt.Printf("Generated Simulation Event: %s [%s]\n", event.EventType, event.Severity)
	}
}

func (s *SimulationEngine) GetEvents(engine string) []models.SimulationEvent {
	var events []models.SimulationEvent
	s.db.Where("engine = ?", engine).Order("timestamp desc").Limit(50).Find(&events)
	return events
}
