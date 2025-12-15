package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type VendorRisk struct {
	ID        string    `json:"id"`
	Vendor    string    `json:"vendor"`
	RiskScore int       `json:"risk_score"`
	Status    string    `json:"status"` // Active, Under Review
	Issues    []string  `json:"issues"` // "Data Breach 2024", "Poor Security Score"
	LastAudit time.Time `json:"last_audit"`
}

type TPRMEngine struct {
	db *gorm.DB
}

func NewTPRMEngine(db *gorm.DB) *TPRMEngine {
	return &TPRMEngine{db: db}
}

func (e *TPRMEngine) GetVendors() []VendorRisk {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "TPRM").Order("timestamp desc").Limit(10).Find(&events)

	var vendors []VendorRisk
	for _, ev := range events {
		vendors = append(vendors, VendorRisk{
			ID:        fmt.Sprintf("tprm-%d", ev.ID),
			Vendor:    ev.Target,
			RiskScore: 75,
			Status:    ev.Status,
			Issues:    []string{ev.Details},
			LastAudit: ev.Timestamp,
		})
	}

	if len(vendors) == 0 {
		return []VendorRisk{{ID: "pending", Vendor: "Pending", RiskScore: 0, Status: "Waiting", Issues: []string{"Waiting..."}, LastAudit: time.Now()}}
	}
	return vendors
}
