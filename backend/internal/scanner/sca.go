package scanner

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/cybershield-ai/core/internal/ai"
	"gorm.io/gorm"
)

type SCAScanner struct {
	db       *gorm.DB
	aiEngine *ai.RemediationEngine
}

func NewSCAScanner(db *gorm.DB, aiEngine *ai.RemediationEngine) *SCAScanner {
	return &SCAScanner{
		db:       db,
		aiEngine: aiEngine,
	}
}

func (s *SCAScanner) Start(ctx context.Context, target string) (string, error) {
	scanID := fmt.Sprintf("sca-%d", time.Now().UnixNano())

	// Initialize result
	result := ScanResult{
		ScanID:    scanID,
		Target:    target,
		Status:    "running",
		Type:      "SCA",
		CreatedAt: time.Now(),
	}
	s.db.Create(&result)

	go s.runScan(scanID, target)

	return scanID, nil
}

func (s *SCAScanner) runScan(scanID, targetPath string) {
	var vulnerabilities []Vuln

	// 1. Detect Dependency Files
	files := []string{"go.mod", "package.json", "requirements.txt"}
	foundFiles := make(map[string]string)

	realPath := targetPath
	if targetPath == "http://localhost:8080" || targetPath == "localhost" {
		realPath = "."
	}

	for _, file := range files {
		path := filepath.Join(realPath, file)
		if content, err := os.ReadFile(path); err == nil {
			foundFiles[file] = string(content)
		}
	}

	// 2. Analyze with AI
	for filename, content := range foundFiles {
		if s.aiEngine == nil {
			fmt.Printf("WARNING: AI Engine not initialized. Skipping analysis for %s\n", filename)
			continue
		}

		ctx := context.Background()
		analysis, err := s.aiEngine.AnalyzeDependencies(ctx, filename, content)
		if err != nil {
			fmt.Printf("Failed to analyze %s: %v\n", filename, err)
			continue
		}

		if len(analysis) > 0 && analysis != "No critical issues found" {
			vulnerabilities = append(vulnerabilities, Vuln{
				ScanID:      scanID,
				Title:       "Supply Chain Risks in " + filename,
				Description: analysis,
				Severity:    "High",
				Category:    "SCA",
				Solution:    "Update dependencies or remove vulnerable packages.",
			})
		}
	}

	// Update result
	var result ScanResult
	if err := s.db.Where("scan_id = ?", scanID).First(&result).Error; err == nil {
		result.Status = "completed"
		result.UpdatedAt = time.Now()
		s.db.Save(&result)

		// Save vulns
		for _, v := range vulnerabilities {
			v.ScanID = scanID
			s.db.Create(&v)
		}
	}
}

func (s *SCAScanner) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	var result ScanResult
	if err := s.db.Where("scan_id = ?", scanID).First(&result).Error; err != nil {
		return "unknown", 0, fmt.Errorf("scan not found")
	}

	progress := 0
	if result.Status == "completed" {
		progress = 100
	}
	return result.Status, progress, nil
}

func (s *SCAScanner) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	var result ScanResult
	if err := s.db.Preload("Vulnerabilities").Where("scan_id = ?", scanID).First(&result).Error; err != nil {
		return nil, fmt.Errorf("scan not found")
	}
	return &result, nil
}

func (s *SCAScanner) GetHistory(ctx context.Context) ([]*ScanResult, error) {
	var history []*ScanResult
	s.db.Where("type = ?", "SCA").Order("created_at desc").Find(&history)
	return history, nil
}
