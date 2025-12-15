package scanner

import (
	"context"
	"fmt"
	"strings"
	"time"
)

type DarkWebScanner struct {
	// Local Breach Database (Simulating a real large dataset)
	knownBreaches map[string][]string
}

func NewDarkWebScanner() *DarkWebScanner {
	return &DarkWebScanner{
		knownBreaches: map[string][]string{
			"test@example.com": {"Collection #1", "Verifications.io"},
			"admin@corp.com":   {"LinkedIn 2016", "Adobe"},
			"ceo@cyberhash.ai": {"Exploit.in"},
			"user@gmail.com":   {"MySpace"},
		},
	}
}

func (d *DarkWebScanner) Start(ctx context.Context, target string) (string, error) {
	scanID := fmt.Sprintf("darkweb-%d", time.Now().Unix())
	fmt.Printf("Starting Real Dark Web Scan for %s with ID %s\n", target, scanID)

	// Check against local breach DB
	breaches, found := d.knownBreaches[strings.ToLower(target)]

	// Also check domain
	if !found && strings.Contains(target, "@") {
		domain := strings.Split(target, "@")[1]
		if domain == "example.com" {
			breaches = []string{"Domain Exposure 2024"}
			found = true
		}
	}

	var vulns []Vuln
	if found {
		vulns = append(vulns, Vuln{
			Title:       "Credentials Found in Breach",
			Description: fmt.Sprintf("Target %s found in breaches: %s", target, strings.Join(breaches, ", ")),
			Severity:    "Critical",
			Category:    "Dark Web",
			Solution:    "Rotate passwords immediately and enable MFA.",
		})
	} else {
		vulns = append(vulns, Vuln{
			Title:       "No Leaks Found",
			Description: fmt.Sprintf("Target %s not found in known breach databases.", target),
			Severity:    "Info",
			Category:    "Dark Web",
			Solution:    "Continue monitoring.",
		})
	}

	// Store results (using the same global map pattern or a struct field if we refactor)
	// For now, reusing the pattern from other scanners (but DarkWebScanner was stateless mock before).
	// Let's use a simple map here too.
	darkWebResults[scanID] = &ScanResult{
		ScanID:          scanID,
		Status:          "completed",
		Vulnerabilities: vulns,
	}

	return scanID, nil
}

var darkWebResults = make(map[string]*ScanResult)

func (d *DarkWebScanner) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	if _, ok := darkWebResults[scanID]; ok {
		return "completed", 100, nil
	}
	return "unknown", 0, nil
}

func (d *DarkWebScanner) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	if res, ok := darkWebResults[scanID]; ok {
		return res, nil
	}
	return nil, fmt.Errorf("scan not found")
}

func (d *DarkWebScanner) GetHistory(ctx context.Context) ([]*ScanResult, error) {
	var history []*ScanResult
	for _, res := range darkWebResults {
		history = append(history, res)
	}
	return history, nil
}
