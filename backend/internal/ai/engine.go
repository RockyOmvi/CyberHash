package ai

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// RemediationEngine handles generating fixes for vulnerabilities
type RemediationEngine struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

func NewRemediationEngine(apiKey string) *RemediationEngine {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		// In a real app, we should handle this error better or propagate it.
		// For now, we'll just log it if we could, but since constructor signature
		// is fixed, we might panic or return nil (which is risky).
		// Let's assume the key is valid or client creation is lazy enough.
		// Actually, genai.NewClient checks options.
		fmt.Printf("Error creating Gemini client: %v\n", err)
		return nil
	}

	model := client.GenerativeModel("gemini-1.5-flash") // Use a cost-effective model
	return &RemediationEngine{
		client: client,
		model:  model,
	}
}

// GenerateFix creates a context-aware remediation plan
func (e *RemediationEngine) GenerateFix(ctx context.Context, vulnTitle, vulnDesc, techStack string) (string, error) {
	if e.client == nil {
		return "", fmt.Errorf("gemini client not initialized")
	}

	// 1. Construct the Prompt
	prompt := fmt.Sprintf(`
You are a Senior Security Engineer.
Vulnerability: %s
Description: %s
Technology Stack: %s

Provide a secure code snippet to fix this issue. 
Explain the fix in 2 sentences.
`, vulnTitle, vulnDesc, techStack)

	// 2. Call Gemini API
	resp, err := e.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("gemini API error: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from gemini")
	}

	// Extract text from parts
	var sb strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			sb.WriteString(string(txt))
		}
	}

	return sb.String(), nil
}

// AnalyzeCode performs SAST-like analysis on a snippet (Stub)
func (e *RemediationEngine) AnalyzeCode(codeSnippet string) ([]string, error) {
	if strings.Contains(codeSnippet, "eval(") {
		return []string{"Critical: Avoid using eval() as it can lead to RCE."}, nil
	}
	return []string{}, nil
}

func (e *RemediationEngine) Close() {
	if e.client != nil {
		e.client.Close()
	}
}
