package apm

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type APMMetric struct {
	ID        string    `json:"id"`
	Service   string    `json:"service"` // Auth-Service, Payment-Gateway
	Metric    string    `json:"metric"`  // Latency, ErrorRate
	Value     string    `json:"value"`   // 150ms, 2%
	Status    string    `json:"status"`  // Healthy, Degraded
	Timestamp time.Time `json:"timestamp"`
}

type APMEngine struct {
	db *gorm.DB
}

func NewAPMEngine(db *gorm.DB) *APMEngine {
	return &APMEngine{db: db}
}

func (e *APMEngine) GetMetrics() []APMMetric {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "APM").Order("timestamp desc").Limit(10).Find(&events)

	var metrics []APMMetric
	for _, ev := range events {
		metrics = append(metrics, APMMetric{
			ID:        fmt.Sprintf("apm-%d", ev.ID),
			Service:   ev.Source,
			Metric:    ev.EventType,
			Value:     ev.Details,
			Status:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(metrics) == 0 {
		return []APMMetric{{ID: "pending", Service: "Pending", Metric: "N/A", Value: "0", Status: "Waiting", Timestamp: time.Now()}}
	}
	return metrics
}
