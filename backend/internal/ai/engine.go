package ai

import (
	"context"
	"fmt"
	"strings"
)

// RemediationEngine handles generating fixes for vulnerabilities
type RemediationEngine struct {
	apiKey string
	model  string
}

func NewRemediationEngine(apiKey string) *RemediationEngine {
	return &RemediationEngine{
		apiKey: apiKey,
		model:  "gpt-4-turbo",
	}
}

// GenerateFix creates a context-aware remediation plan
func (e *RemediationEngine) GenerateFix(ctx context.Context, vulnTitle, vulnDesc, techStack string) (string, error) {
	// 1. Construct the Prompt
	prompt := fmt.Sprintf(`
You are a Senior Security Engineer.
Vulnerability: %s
Description: %s
Technology Stack: %s

Provide a secure code snippet to fix this issue. 
Explain the fix in 2 sentences.
`, vulnTitle, vulnDesc, techStack)

	// 2. Call LLM (Mock for now)
	fmt.Printf("Sending prompt to LLM: %s\n", prompt)
	
	// Mock Response
	fix := fmt.Sprintf("To fix '%s' in %s, ensure you sanitize all user inputs using the framework's built-in escaping functions. For example, use parameterized queries instead of string concatenation.", vulnTitle, techStack)
	
	return fix, nil
}

// AnalyzeCode performs SAST-like analysis on a snippet (Stub)
func (e *RemediationEngine) AnalyzeCode(codeSnippet string) ([]string, error) {
	if strings.Contains(codeSnippet, "eval(") {
		return []string{"Critical: Avoid using eval() as it can lead to RCE."}, nil
	}
	return []string{}, nil
}
