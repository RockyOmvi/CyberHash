package scanner

import (
	"context"
	"time"
)

// ScanResult represents the outcome of a security scan
type ScanResult struct {
	ScanID          string    `json:"scan_id" gorm:"primaryKey"`
	Target          string    `json:"target"`
	Type            string    `json:"type"` // ZAP, SCA, AWS, etc.
	Status          string    `json:"status"`
	Vulnerabilities []Vuln    `json:"vulnerabilities" gorm:"foreignKey:ScanID"`
	RawReportPath   string    `json:"raw_report_path"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Vuln represents a single security finding
type Vuln struct {
	ID          uint     `json:"id" gorm:"primaryKey"`
	ScanID      string   `json:"scan_id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Severity    string   `json:"severity"` // Critical, High, Medium, Low, Info
	Category    string   `json:"category"` // SCA, SAST, DAST, Container, etc.
	Solution    string   `json:"solution"`
	Compliance  []string `json:"compliance" gorm:"serializer:json"` // e.g., "ISO 27001: A.12.6.1"
}

// Scanner defines the interface for all security scanners (ZAP, Nuclei, etc.)
type Scanner interface {
	// Start initiates a scan against the target
	Start(ctx context.Context, target string) (string, error)

	// GetStatus returns the current progress of the scan
	GetStatus(ctx context.Context, scanID string) (string, int, error)

	// GetResults returns the findings after completion
	GetResults(ctx context.Context, scanID string) (*ScanResult, error)

	// GetHistory returns the list of past scans
	GetHistory(ctx context.Context) ([]*ScanResult, error)
}
