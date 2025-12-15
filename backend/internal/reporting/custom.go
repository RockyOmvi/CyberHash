package reporting

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/cloud"
	"github.com/cybershield-ai/core/internal/scanner"
)

type ReportConfig struct {
	Title        string `json:"title"`
	IncludeVulns bool   `json:"include_vulns"`
	IncludeCloud bool   `json:"include_cloud"`
	IncludeLogs  bool   `json:"include_logs"`
	Format       string `json:"format"` // "pdf" or "csv"
}

type CustomReport struct {
	ID        string `json:"id"`
	Config    ReportConfig
	Generated time.Time `json:"generated"`
	URL       string    `json:"url"`
}

func GenerateCustomReport(config ReportConfig, vulns []scanner.Vuln, cloudResources []cloud.CloudAsset) ([]byte, error) {
	// Mock PDF generation
	fmt.Printf("[Reporting] Generating %s report: %s\n", config.Format, config.Title)

	content := fmt.Sprintf("Report: %s\nGenerated: %s\n\n", config.Title, time.Now().Format(time.RFC1123))

	if config.IncludeVulns {
		content += fmt.Sprintf("Vulnerabilities Found: %d\n", len(vulns))
		for _, v := range vulns {
			content += fmt.Sprintf("- [%s] %s\n", v.Severity, v.Title)
		}
	}

	if config.IncludeCloud {
		content += fmt.Sprintf("\nCloud Posture: %d Assets Scanned\n", len(cloudResources))
		for _, r := range cloudResources {
			content += fmt.Sprintf("- [%s] %s (%s) - Risk: %d\n", r.Provider, r.Name, r.Type, r.RiskScore)
		}
	}

	return []byte(content), nil
}
