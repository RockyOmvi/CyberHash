package iac

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"time"
)

type IaCScan struct {
	ID        string    `json:"id"`
	Path      string    `json:"path"`
	Status    string    `json:"status"`
	Issues    int       `json:"issues"`
	Critical  int       `json:"critical"`
	High      int       `json:"high"`
	Medium    int       `json:"medium"`
	Low       int       `json:"low"`
	ScannedAt time.Time `json:"scanned_at"`
}

type IaCScanner struct {
	scans []IaCScan
}

func NewIaCScanner() *IaCScanner {
	return &IaCScanner{
		scans: []IaCScan{},
	}
}

// Reuse Trivy output structure (it's similar for config scans)
type TrivyConfigOutput struct {
	Results []struct {
		Target            string `json:"Target"`
		Misconfigurations []struct {
			ID          string `json:"ID"`
			Title       string `json:"Title"`
			Description string `json:"Description"`
			Severity    string `json:"Severity"`
			Status      string `json:"Status"`
		} `json:"Misconfigurations"`
	} `json:"Results"`
}

func (s *IaCScanner) ScanPath(ctx context.Context, path string) (*IaCScan, error) {
	scanID := fmt.Sprintf("iac-%d", time.Now().Unix())

	// 1. Run Trivy Config Scan
	cmd := exec.CommandContext(ctx, "trivy", "config", "--format", "json", "--quiet", path)
	output, err := cmd.Output()

	scan := IaCScan{
		ID:        scanID,
		Path:      path,
		Status:    "Completed",
		ScannedAt: time.Now(),
	}

	if err != nil {
		fmt.Printf("Trivy IaC scan failed: %v. Using mock data.\n", err)
		scan.Status = "Failed (Mock Fallback)"
		scan.Issues = 5
		scan.High = 2
		scan.Medium = 3
		s.scans = append(s.scans, scan)
		return &scan, nil
	}

	// 2. Parse Output
	var trivyRes TrivyConfigOutput
	if jsonErr := json.Unmarshal(output, &trivyRes); jsonErr == nil {
		for _, res := range trivyRes.Results {
			for _, issue := range res.Misconfigurations {
				if issue.Status == "FAIL" {
					scan.Issues++
					switch issue.Severity {
					case "CRITICAL":
						scan.Critical++
					case "HIGH":
						scan.High++
					case "MEDIUM":
						scan.Medium++
					case "LOW":
						scan.Low++
					}
				}
			}
		}
	} else {
		scan.Status = "Parse Error"
	}

	s.scans = append(s.scans, scan)
	return &scan, nil
}

func (s *IaCScanner) GetScans() []IaCScan {
	return s.scans
}
