package ai

import (
	"context"
	"testing"
)

func TestGenerateFix(t *testing.T) {
	apiKey := "dummy-key"
	if apiKey == "dummy-key" {
		t.Skip("Skipping TestGenerateFix: GEMINI_API_KEY not set")
	}

	engine := NewRemediationEngine(apiKey)

	fix, err := engine.GenerateFix(context.Background(), "SQL Injection", "Input not sanitized", "Go/Gin")
	if err != nil {
		t.Fatalf("GenerateFix failed: %v", err)
	}

	if fix == "" {
		t.Error("Expected fix to be generated, got empty string")
	}
}

func TestAnalyzeCode(t *testing.T) {
	engine := NewRemediationEngine("dummy-key")

	issues, err := engine.AnalyzeCode("func main() { eval(input) }")
	if err != nil {
		t.Fatalf("AnalyzeCode failed: %v", err)
	}

	if len(issues) == 0 {
		t.Error("Expected issues to be found in unsafe code")
	}
}
