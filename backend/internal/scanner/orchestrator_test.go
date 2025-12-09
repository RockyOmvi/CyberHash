package scanner

import (
	"context"
	"testing"
)

// MockScanner for testing
type MockScanner struct {
	ID string
}

func (m *MockScanner) Start(ctx context.Context, target string) (string, error) {
	return m.ID + "-scan", nil
}

func (m *MockScanner) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	return "completed", 100, nil
}

func (m *MockScanner) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	return &ScanResult{
		ScanID: scanID,
		Status: "completed",
		Vulnerabilities: []Vuln{
			{Title: "Mock Vuln from " + m.ID, Severity: "High"},
		},
	}, nil
}

func TestOrchestrator_Start(t *testing.T) {
	mock1 := &MockScanner{ID: "scanner1"}
	mock2 := &MockScanner{ID: "scanner2"}
	orch := NewOrchestrator(mock1, mock2)

	id, err := orch.Start(context.Background(), "localhost")
	if err != nil {
		t.Fatalf("Start failed: %v", err)
	}
	if id == "" {
		t.Error("Expected scan ID, got empty string")
	}
}

func TestOrchestrator_GetResults(t *testing.T) {
	mock1 := &MockScanner{ID: "scanner1"}
	mock2 := &MockScanner{ID: "scanner2"}
	orch := NewOrchestrator(mock1, mock2)

	results, err := orch.GetResults(context.Background(), "scan-123")
	if err != nil {
		t.Fatalf("GetResults failed: %v", err)
	}

	if len(results.Vulnerabilities) != 2 {
		t.Errorf("Expected 2 vulnerabilities, got %d", len(results.Vulnerabilities))
	}
}
