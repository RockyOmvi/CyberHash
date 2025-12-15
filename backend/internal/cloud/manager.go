package cloud

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"github.com/cybershield-ai/core/internal/scanner"
	"gorm.io/gorm"
)

type CloudProvider string

const (
	AWS   CloudProvider = "AWS"
	Azure CloudProvider = "Azure"
	GCP   CloudProvider = "GCP"
)

type CloudAsset struct {
	ID        string        `json:"id"`
	Name      string        `json:"name"`
	Type      string        `json:"type"` // EC2, S3, VM, Blob, etc.
	Provider  CloudProvider `json:"provider"`
	Region    string        `json:"region"`
	Status    string        `json:"status"`
	RiskScore int           `json:"risk_score"`
}

type CloudManager struct {
	db         *gorm.DB
	awsScanner *scanner.AWSScanner
}

func NewCloudManager(db *gorm.DB, awsScanner *scanner.AWSScanner) *CloudManager {
	m := &CloudManager{
		db:         db,
		awsScanner: awsScanner,
	}
	m.SeedCloudResources()
	return m
}

func (m *CloudManager) SeedCloudResources() {
	var count int64
	m.db.Model(&models.CloudResource{}).Where("provider IN ?", []string{"Azure", "GCP"}).Count(&count)
	if count == 0 {
		resources := []models.CloudResource{
			{Provider: "Azure", Service: "Virtual Machine", ResourceID: "vm-db-primary", Region: "eastus", Status: "Running", LastScanned: time.Now()},
			{Provider: "Azure", Service: "Key Vault", ResourceID: "kv-secrets", Region: "eastus", Status: "Active", LastScanned: time.Now()},
			{Provider: "GCP", Service: "GKE Cluster", ResourceID: "gke-cluster-1", Region: "us-central1", Status: "Running", LastScanned: time.Now()},
			{Provider: "GCP", Service: "Cloud Storage", ResourceID: "gcp-bucket-logs", Region: "us-central1", Status: "Active", LastScanned: time.Now()},
		}
		m.db.Create(&resources)
	}
}

func (m *CloudManager) GetCloudPosture(ctx context.Context) ([]CloudAsset, error) {
	var assets []CloudAsset

	// 1. Real AWS Assets (if available)
	if m.awsScanner != nil {
		buckets, err := m.awsScanner.ListBuckets(ctx)
		if err == nil {
			for _, b := range buckets {
				assets = append(assets, CloudAsset{
					ID:        fmt.Sprintf("s3-%s", b.Name),
					Name:      b.Name,
					Type:      "S3 Bucket",
					Provider:  AWS,
					Region:    b.Region,
					Status:    "Active",
					RiskScore: rand.Intn(20),
				})
			}
		}
	}

	// 2. DB-Backed Assets (Azure, GCP, and historical AWS if we stored them)
	var resources []models.CloudResource
	m.db.Where("provider IN ?", []string{"Azure", "GCP"}).Find(&resources)

	for _, r := range resources {
		assets = append(assets, CloudAsset{
			ID:        r.ResourceID,
			Name:      r.ResourceID, // Using ID as name for simplicity
			Type:      r.Service,
			Provider:  CloudProvider(r.Provider),
			Region:    r.Region,
			Status:    r.Status,
			RiskScore: rand.Intn(50), // Simulate risk
		})
	}

	return assets, nil
}
