package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type AdmissionRequest struct {
	ID        string    `json:"id"`
	Pod       string    `json:"pod"`
	Namespace string    `json:"namespace"`
	Image     string    `json:"image"`
	Status    string    `json:"status"` // Allowed, Denied
	Reason    string    `json:"reason"` // "Privileged container not allowed"
	Timestamp time.Time `json:"timestamp"`
}

type AdmissionEngine struct {
	db *gorm.DB
}

func NewAdmissionEngine(db *gorm.DB) *AdmissionEngine {
	return &AdmissionEngine{db: db}
}

func (e *AdmissionEngine) GetRequests() []AdmissionRequest {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Admission").Order("timestamp desc").Limit(10).Find(&events)

	var reqs []AdmissionRequest
	for _, ev := range events {
		reqs = append(reqs, AdmissionRequest{
			ID:        fmt.Sprintf("adm-%d", ev.ID),
			Pod:       ev.Target,
			Namespace: "default",
			Image:     ev.Source,
			Status:    ev.Status,
			Reason:    ev.Details,
			Timestamp: ev.Timestamp,
		})
	}

	if len(reqs) == 0 {
		return []AdmissionRequest{{ID: "pending", Pod: "Pending", Namespace: "N/A", Image: "N/A", Status: "Waiting", Reason: "Waiting...", Timestamp: time.Now()}}
	}
	return reqs
}
