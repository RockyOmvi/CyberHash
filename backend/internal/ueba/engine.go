package ueba

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type AnomalySeverity string

const (
	SeverityLow      AnomalySeverity = "Low"
	SeverityMedium   AnomalySeverity = "Medium"
	SeverityHigh     AnomalySeverity = "High"
	SeverityCritical AnomalySeverity = "Critical"
)

type Anomaly struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	Type        string          `json:"type"` // e.g., "ImpossibleTravel", "ExcessiveDownloads"
	Description string          `json:"description"`
	Severity    AnomalySeverity `json:"severity"`
	Timestamp   time.Time       `json:"timestamp"`
}

type UEBAEngine struct {
	db *gorm.DB
}

func NewUEBAEngine(db *gorm.DB) *UEBAEngine {
	e := &UEBAEngine{db: db}
	e.StartSimulation()
	return e
}

func (e *UEBAEngine) StartSimulation() {
	go func() {
		for {
			// Simulate user behavior
			behavior := models.UserBehavior{
				UserID:     fmt.Sprintf("user-%d", rand.Intn(100)),
				RiskScore:  rand.Intn(100),
				Anomalies:  rand.Intn(5),
				Status:     "Normal",
				LastActive: time.Now(),
			}
			if behavior.RiskScore > 80 {
				behavior.Status = "High Risk"
			} else if behavior.RiskScore > 50 {
				behavior.Status = "Suspicious"
			}
			e.db.Create(&behavior)
			time.Sleep(15 * time.Second)
		}
	}()
}

func (e *UEBAEngine) GetAnomalies() []Anomaly {
	var behaviors []models.UserBehavior
	e.db.Where("status != ?", "Normal").Order("last_active desc").Limit(10).Find(&behaviors)

	var anomalies []Anomaly
	for _, b := range behaviors {
		severity := SeverityMedium
		desc := "Unusual activity detected"
		if b.RiskScore > 80 {
			severity = SeverityHigh
			desc = "Critical risk behavior detected"
		}

		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("anom-%d", b.ID),
			UserID:      b.UserID,
			Type:        b.Status,
			Description: desc,
			Severity:    severity,
			Timestamp:   b.LastActive,
		})
	}

	if len(anomalies) == 0 {
		return []Anomaly{{ID: "pending", UserID: "Pending", Type: "N/A", Description: "Waiting for anomalies...", Severity: SeverityLow, Timestamp: time.Now()}}
	}
	return anomalies
}

func (e *UEBAEngine) AnalyzeEvent(userID string, eventType string) {
	fmt.Printf("[UEBA] Analyzing event for user %s: %s\n", userID, eventType)
}
