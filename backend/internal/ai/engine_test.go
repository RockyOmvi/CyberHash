package ai

import (
	"context"
	"strings"
	"testing"
)

func TestGenerateFix(t *testing.T) {
	engine := NewRemediationEngine("dummy-key")
	
	fix, err := engine.GenerateFix(context.Background(), "SQL Injection", "Input not sanitized", "Go/Gin")
	if err != nil {
		t.Fatalf("GenerateFix failed: %v", err)
	}

	if fix == "" {
		t.Error("Expected fix to be generated, got empty string")
	}

	if !strings.Contains(fix, "SQL Injection") {
		t.Error("Expected fix to mention the vulnerability title")
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
