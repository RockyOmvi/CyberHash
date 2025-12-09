package scanner

import (
	"context"
	"fmt"
	"sync"
)

// Orchestrator manages multiple scanner instances
type Orchestrator struct {
	scanners []Scanner
	history  []*ScanResult
	mu       sync.RWMutex
}

func NewOrchestrator(scanners ...Scanner) *Orchestrator {
	return &Orchestrator{
		scanners: scanners,
		history:  make([]*ScanResult, 0),
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
	id := scanIDs[0]

	// Add to history
	o.mu.Lock()
	o.history = append(o.history, &ScanResult{
		ScanID: id,
		Target: target,
		Status: "queued",
	})
	o.mu.Unlock()

	return id, nil
}

func (o *Orchestrator) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	// Simplified: just ask the first scanner
	if len(o.scanners) > 0 {
		status, progress, err := o.scanners[0].GetStatus(ctx, scanID)

		// Update history if status changed
		if err == nil {
			o.mu.Lock()
			for _, scan := range o.history {
				if scan.ScanID == scanID {
					scan.Status = status
					break
				}
			}
			o.mu.Unlock()
		}

		return status, progress, err
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

	result := &ScanResult{
		ScanID:          scanID,
		Target:          "unknown", // Should retrieve from history
		Status:          primaryStatus,
		Vulnerabilities: combinedVulns,
	}

	// Update history with results
	o.mu.Lock()
	for _, scan := range o.history {
		if scan.ScanID == scanID {
			scan.Status = primaryStatus
			scan.Vulnerabilities = combinedVulns
			result.Target = scan.Target
			break
		}
	}
	o.mu.Unlock()

	return result, nil
}

func (o *Orchestrator) GetHistory(ctx context.Context) ([]*ScanResult, error) {
	o.mu.RLock()
	defer o.mu.RUnlock()

	// Return a copy to avoid race conditions
	history := make([]*ScanResult, len(o.history))
	copy(history, o.history)
	return history, nil
}
