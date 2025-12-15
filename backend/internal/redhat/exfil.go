package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ExfilTest struct {
	ID          string    `json:"id"`
	Method      string    `json:"method"`      // DNS Tunneling, HTTPS POST, Steganography
	DataVolume  string    `json:"data_volume"` // 50MB, 1GB
	Destination string    `json:"destination"`
	Status      string    `json:"status"` // Blocked, Successful
	Timestamp   time.Time `json:"timestamp"`
}

type ExfilEngine struct {
	db *gorm.DB
}

func NewExfilEngine(db *gorm.DB) *ExfilEngine {
	return &ExfilEngine{db: db}
}

func (e *ExfilEngine) GetTests() []ExfilTest {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Exfil").Order("timestamp desc").Limit(10).Find(&events)

	var tests []ExfilTest
	for _, ev := range events {
		tests = append(tests, ExfilTest{
			ID:          fmt.Sprintf("exf-%d", ev.ID),
			Method:      ev.EventType,
			DataVolume:  "10MB",
			Destination: ev.Target,
			Status:      ev.Status,
			Timestamp:   ev.Timestamp,
		})
	}

	if len(tests) == 0 {
		return []ExfilTest{{ID: "pending", Method: "Pending", DataVolume: "0", Destination: "N/A", Status: "Waiting", Timestamp: time.Now()}}
	}
	return tests
}
