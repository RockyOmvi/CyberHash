package scanner

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gorm"
)

// Orchestrator manages multiple scanner instances
type Orchestrator struct {
	scanners []Scanner
	db       *gorm.DB
}

func NewOrchestrator(db *gorm.DB, scanners ...Scanner) *Orchestrator {
	return &Orchestrator{
		scanners: scanners,
		db:       db,
	}
}

func (o *Orchestrator) Start(ctx context.Context, target string) (string, error) {
	var wg sync.WaitGroup
	scanIDs := make([]string, len(o.scanners))
	errors := make([]error, len(o.scanners))

	for i, s := range o.scanners {
		wg.Add(1)
		go func(index int, sc Scanner) {
			defer wg.Done()
			id, err := sc.Start(ctx, target)
			if err != nil {
				errors[index] = err
				return
			}
			scanIDs[index] = id
		}(i, s)
	}
	wg.Wait()

	for _, err := range errors {
		if err != nil {
			return "", fmt.Errorf("one or more scanners failed to start: %v", err)
		}
	}

	id := scanIDs[0]

	// Persist to DB
	scan := &ScanResult{
		ScanID: id,
		Target: target,
		Status: "queued",
	}
	if err := o.db.Create(scan).Error; err != nil {
		return "", fmt.Errorf("failed to create scan record: %v", err)
	}

	return id, nil
}

func (o *Orchestrator) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	if len(o.scanners) > 0 {
		status, progress, err := o.scanners[0].GetStatus(ctx, scanID)

		if err == nil {
			// Update status in DB
			o.db.Model(&ScanResult{}).Where("scan_id = ?", scanID).Update("status", status)
		}

		return status, progress, err
	}
	return "unknown", 0, nil
}

func (o *Orchestrator) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	var combinedVulns []Vuln
	var primaryStatus string = "completed"

	for _, s := range o.scanners {
		res, err := s.GetResults(ctx, scanID)
		if err != nil {
			continue
		}
		if res.Status == "running" {
			primaryStatus = "running"
		}
		combinedVulns = append(combinedVulns, res.Vulnerabilities...)
	}

	// Update DB
	var scan ScanResult
	if err := o.db.First(&scan, "scan_id = ?", scanID).Error; err != nil {
		return nil, err
	}

	scan.Status = primaryStatus
	scan.Vulnerabilities = combinedVulns

	// Save scan and replace vulnerabilities
	if err := o.db.Save(&scan).Error; err != nil {
		return nil, err
	}

	// Explicitly replace associations to handle updates
	if err := o.db.Model(&scan).Association("Vulnerabilities").Replace(combinedVulns); err != nil {
		return nil, err
	}

	return &scan, nil
}

func (o *Orchestrator) GetHistory(ctx context.Context) ([]*ScanResult, error) {
	var history []*ScanResult
	if err := o.db.Preload("Vulnerabilities").Order("created_at desc").Find(&history).Error; err != nil {
		return nil, err
	}
	return history, nil
}
