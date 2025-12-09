package reporting

import (
	"bytes"
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/scanner"
	"github.com/jung-kurt/gofpdf"
)

func GenerateReport(scan *scanner.ScanResult) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	// Header
	pdf.Cell(40, 10, "CyberShield AI - Security Scan Report")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Target: %s", scan.Target))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Scan ID: %s", scan.ScanID))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Date: %s", time.Now().Format("2006-01-02 15:04:05")))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Status: %s", scan.Status))
	pdf.Ln(20)

	// Summary
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Executive Summary")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Total Vulnerabilities Found: %d", len(scan.Vulnerabilities)))
	pdf.Ln(15)

	// Vulnerabilities
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Detailed Findings")
	pdf.Ln(10)

	for i, vuln := range scan.Vulnerabilities {
		pdf.SetFont("Arial", "B", 12)
		pdf.Cell(40, 10, fmt.Sprintf("%d. %s", i+1, vuln.Title))
		pdf.Ln(8)

		pdf.SetFont("Arial", "I", 11)
		pdf.Cell(40, 10, fmt.Sprintf("Severity: %s", vuln.Severity))
		pdf.Ln(8)

		pdf.SetFont("Arial", "", 11)
		pdf.MultiCell(0, 6, fmt.Sprintf("Description: %s", vuln.Description), "", "", false)
		pdf.Ln(4)

		pdf.SetFont("Arial", "I", 11)
		pdf.MultiCell(0, 6, fmt.Sprintf("Remediation: %s", vuln.Solution), "", "", false)
		pdf.Ln(10)

		// Add a line separator
		pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
		pdf.Ln(5)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
