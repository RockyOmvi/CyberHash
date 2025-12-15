package compliance

import "strings"

type Standard string

const (
	ISO27001 Standard = "ISO 27001"
	GDPR     Standard = "GDPR"
	NIST     Standard = "NIST CSF"
	PCI_DSS  Standard = "PCI DSS"
)

type Control struct {
	ID          string
	Description string
}

type ComplianceMapping struct {
	Standard Standard
	Control  Control
}

// MapVulnerability returns a list of compliance controls relevant to a vulnerability category
func MapVulnerability(category string) []ComplianceMapping {
	var mappings []ComplianceMapping
	category = strings.ToUpper(category)

	// Common mappings based on vulnerability type
	if strings.Contains(category, "SQL") || strings.Contains(category, "INJECTION") {
		mappings = append(mappings,
			ComplianceMapping{ISO27001, Control{"A.14.1.2", "Securing application services on public networks"}},
			ComplianceMapping{NIST, Control{"PR.IP-1", "Data is protected at rest"}}, // Loose mapping
			ComplianceMapping{PCI_DSS, Control{"6.5.1", "Injection flaws"}},
		)
	}

	if strings.Contains(category, "XSS") || strings.Contains(category, "SCRIPTING") {
		mappings = append(mappings,
			ComplianceMapping{ISO27001, Control{"A.14.1.3", "Protecting application services transactions"}},
			ComplianceMapping{PCI_DSS, Control{"6.5.7", "Cross-site scripting (XSS)"}},
		)
	}

	if strings.Contains(category, "SCA") || strings.Contains(category, "DEPENDENCY") {
		mappings = append(mappings,
			ComplianceMapping{ISO27001, Control{"A.14.2.6", "Secure development environment"}}, // Supply chain
			ComplianceMapping{NIST, Control{"ID.SC-1", "Cyber supply chain risk management processes are identified"}},
			ComplianceMapping{GDPR, Control{"Art. 32", "Security of processing"}},
		)
	}

	if strings.Contains(category, "AUTH") || strings.Contains(category, "PASSWORD") {
		mappings = append(mappings,
			ComplianceMapping{ISO27001, Control{"A.9.2.1", "User registration and de-registration"}},
			ComplianceMapping{GDPR, Control{"Art. 32", "Security of processing"}},
			ComplianceMapping{PCI_DSS, Control{"8.2", "Use strong passwords"}},
		)
	}

	// Default catch-all for general vulnerabilities
	if len(mappings) == 0 {
		mappings = append(mappings,
			ComplianceMapping{ISO27001, Control{"A.12.6.1", "Management of technical vulnerabilities"}},
			ComplianceMapping{NIST, Control{"DE.CM-8", "Vulnerability scans are performed"}},
		)
	}

	return mappings
}
