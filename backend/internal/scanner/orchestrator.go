package scanner

import (
	"context"
	"fmt"
	"sync"
)

// Orchestrator manages multiple scanner instances
type Orchestrator struct {
	scanners []Scanner
}

func NewOrchestrator(scanners ...Scanner) *Orchestrator {
	return &Orchestrator{
		scanners: scanners,
	}
}

func (o *Orchestrator) Start(ctx context.Context, target string) (string, error) {
	// In a real system, this would spin up a workflow or DAG of scans.
	// For now, we just start them all in parallel and return a combined ID.
	
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

	// Check for errors (simplified)
	for _, err := range errors {
		if err != nil {
			return "", fmt.Errorf("one or more scanners failed to start: %v", err)
		}
	}

	// Return the ID of the primary scanner (ZAP) for now, or a composite ID
	return scanIDs[0], nil
}

func (o *Orchestrator) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	// Simplified: just ask the first scanner
	if len(o.scanners) > 0 {
		return o.scanners[0].GetStatus(ctx, scanID)
	}
	return "unknown", 0, nil
}

func (o *Orchestrator) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	// Aggregate results from all scanners
	var combinedVulns []Vuln
	var primaryStatus string = "completed"
	
	for _, s := range o.scanners {
		res, err := s.GetResults(ctx, scanID)
		if err != nil {
			continue // Skip failed scanners for now
		}
		if res.Status == "running" {
			primaryStatus = "running"
		}
		combinedVulns = append(combinedVulns, res.Vulnerabilities...)
	}

	return &ScanResult{
		ScanID:          scanID,
		Status:          primaryStatus,
		Vulnerabilities: combinedVulns,
	}, nil
}
