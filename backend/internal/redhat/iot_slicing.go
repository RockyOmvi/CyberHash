package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type NetworkSlice struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"` // Critical-IoT, Guest-WiFi
	Devices   int       `json:"devices"`
	Isolation string    `json:"isolation"` // Strict, Partial
	Status    string    `json:"status"`    // Active, Compromised
	Bandwidth string    `json:"bandwidth"` // 10Gbps
	Timestamp time.Time `json:"timestamp"`
}

type IoTSlicingEngine struct {
	db *gorm.DB
}

func NewIoTSlicingEngine(db *gorm.DB) *IoTSlicingEngine {
	return &IoTSlicingEngine{db: db}
}

func (e *IoTSlicingEngine) GetSlices() []NetworkSlice {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "IoT").Order("timestamp desc").Limit(10).Find(&events)

	var slices []NetworkSlice
	for _, ev := range events {
		slices = append(slices, NetworkSlice{
			ID:        fmt.Sprintf("iot-%d", ev.ID),
			Name:      ev.Target,
			Devices:   50,
			Isolation: "Strict",
			Status:    ev.Status,
			Bandwidth: "1Gbps",
			Timestamp: ev.Timestamp,
		})
	}

	if len(slices) == 0 {
		return []NetworkSlice{{ID: "pending", Name: "Pending", Devices: 0, Isolation: "N/A", Status: "Waiting", Bandwidth: "0", Timestamp: time.Now()}}
	}
	return slices
}
