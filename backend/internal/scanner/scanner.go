package scanner

import "context"

// ScanResult represents the outcome of a security scan
type ScanResult struct {
	ScanID          string `json:"scan_id"`
	Target          string `json:"target"`
	Status          string `json:"status"`
	Vulnerabilities []Vuln `json:"vulnerabilities"`
	RawReportPath   string `json:"raw_report_path"`
}

// Vuln represents a single security finding
type Vuln struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Severity    string `json:"severity"` // Critical, High, Medium, Low, Info
	Solution    string `json:"solution"`
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
