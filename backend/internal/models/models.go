package models

import (
	"time"

	"gorm.io/gorm"
)

// Vulnerability represents a security finding
type Vulnerability struct {
	gorm.Model
	ScanID      string `json:"scan_id" gorm:"index"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Severity    string `json:"severity"` // Critical, High, Medium, Low
	Category    string `json:"category"` // AWS, SBOM, Code, etc.
	Solution    string `json:"solution"`
	Status      string `json:"status"` // Open, Fixed, Ignored
}

// SBOMComponent represents a software dependency
type SBOMComponent struct {
	gorm.Model
	Name      string `json:"name"`
	Version   string `json:"version"`
	Type      string `json:"type"` // Library, OS Package
	License   string `json:"license"`
	RiskLevel string `json:"risk_level"`
}

// CloudResource represents a discovered cloud asset
type CloudResource struct {
	gorm.Model
	Provider    string `json:"provider"` // AWS, Azure, GCP
	AccountID   string `json:"account_id"`
	Region      string `json:"region"`
	Service     string `json:"service"` // S3, EC2, RDS
	ResourceID  string `json:"resource_id" gorm:"uniqueIndex"`
	Status      string `json:"status"` // Active, Compliant, NonCompliant
	LastScanned time.Time
}

// SimulationEvent represents a dynamic event for Red Hat engines (APT, Quantum, etc.)
type SimulationEvent struct {
	gorm.Model
	Engine    string    `json:"engine"` // e.g., "APT", "Quantum", "IoT"
	EventType string    `json:"event_type"`
	Severity  string    `json:"severity"`
	Source    string    `json:"source"`
	Target    string    `json:"target"`
	Details   string    `json:"details"`
	Status    string    `json:"status"` // Active, Mitigated
	Timestamp time.Time `json:"timestamp"`
}

// ComplianceStandard represents a compliance framework
type ComplianceStandard struct {
	gorm.Model
	Name        string    `json:"name"` // ISO 27001, NIST
	Description string    `json:"description"`
	Status      string    `json:"status"` // Compliant, Non-Compliant
	Score       int       `json:"score"`
	LastAudit   time.Time `json:"last_audit"`
}

// PhishingTemplate represents an email template for campaigns
type PhishingTemplate struct {
	gorm.Model
	Name       string `json:"name"`
	Subject    string `json:"subject"`
	Body       string `json:"body"`
	Difficulty string `json:"difficulty"` // Easy, Medium, Hard
	CreatedBy  string `json:"created_by"`
}

// HoneypotNode represents a deployed honeypot
type HoneypotNode struct {
	gorm.Model
	Name       string    `json:"name"`
	Type       string    `json:"type"` // SSH, HTTP, Database
	Region     string    `json:"region"`
	Status     string    `json:"status"` // Active, Attacked
	Attacks    int       `json:"attacks"`
	LastAttack time.Time `json:"last_attack"`
}

// HardwareTelemetry represents device telemetry
type HardwareTelemetry struct {
	gorm.Model
	DeviceID    string    `json:"device_id"`
	CPUUsage    float64   `json:"cpu_usage"`
	MemoryUsage float64   `json:"memory_usage"`
	Temperature float64   `json:"temperature"`
	Status      string    `json:"status"` // Healthy, Overheating
	Timestamp   time.Time `json:"timestamp"`
}

// UserBehavior represents UEBA analysis
type UserBehavior struct {
	gorm.Model
	UserID     string    `json:"user_id"`
	RiskScore  int       `json:"risk_score"`
	Anomalies  int       `json:"anomalies"`
	Status     string    `json:"status"` // Normal, Suspicious, High Risk
	LastActive time.Time `json:"last_active"`
}

// GatewayRule represents an API Gateway rule
type GatewayRule struct {
	gorm.Model
	Name      string `json:"name"`
	Type      string `json:"type"` // RateLimit, AuthCheck, SQLInjection
	Enabled   bool   `json:"enabled"`
	Threshold int    `json:"threshold"`
}

// IntegrationConfig represents an external integration
type IntegrationConfig struct {
	gorm.Model
	Type    string `json:"type"` // Slack, Jira, Teams
	Enabled bool   `json:"enabled"`
	Webhook string `json:"webhook"`
	APIKey  string `json:"api_key"`
	Project string `json:"project"`
}
