package compliance

import (
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type Manager struct {
	db *gorm.DB
}

func NewManager(db *gorm.DB) *Manager {
	m := &Manager{db: db}
	m.SeedStandards()
	return m
}

func (m *Manager) SeedStandards() {
	var count int64
	m.db.Model(&models.ComplianceStandard{}).Count(&count)
	if count == 0 {
		standards := []models.ComplianceStandard{
			{Name: "ISO 27001", Description: "Information Security Management", Status: "Compliant", Score: 85, LastAudit: time.Now()},
			{Name: "GDPR", Description: "General Data Protection Regulation", Status: "Non-Compliant", Score: 60, LastAudit: time.Now()},
			{Name: "NIST CSF", Description: "Cybersecurity Framework", Status: "Compliant", Score: 90, LastAudit: time.Now()},
			{Name: "PCI DSS", Description: "Payment Card Industry Data Security Standard", Status: "Compliant", Score: 100, LastAudit: time.Now()},
			{Name: "HIPAA", Description: "Health Insurance Portability and Accountability Act", Status: "N/A", Score: 0, LastAudit: time.Now()},
		}
		m.db.Create(&standards)
	}
}

func (m *Manager) GetStandards() []models.ComplianceStandard {
	var standards []models.ComplianceStandard
	m.db.Find(&standards)
	return standards
}
