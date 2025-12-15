package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type LLMEvent struct {
	ID        string    `json:"id"`
	Model     string    `json:"model"`  // GPT-4, Llama 2
	Prompt    string    `json:"prompt"` // "Ignore previous instructions..."
	Risk      string    `json:"risk"`   // Prompt Injection, PII Leak
	Action    string    `json:"action"` // Blocked, Redacted
	Timestamp time.Time `json:"timestamp"`
}

type LLMFirewallEngine struct {
	db *gorm.DB
}

func NewLLMFirewallEngine(db *gorm.DB) *LLMFirewallEngine {
	return &LLMFirewallEngine{db: db}
}

func (e *LLMFirewallEngine) GetEvents() []LLMEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "LLMFirewall").Order("timestamp desc").Limit(10).Find(&events)

	var llmEvents []LLMEvent
	for _, ev := range events {
		llmEvents = append(llmEvents, LLMEvent{
			ID:        fmt.Sprintf("llm-%d", ev.ID),
			Model:     ev.Target,
			Prompt:    ev.Details,
			Risk:      ev.EventType,
			Action:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(llmEvents) == 0 {
		return []LLMEvent{{ID: "pending", Model: "Pending", Prompt: "Waiting...", Risk: "Low", Action: "Waiting", Timestamp: time.Now()}}
	}
	return llmEvents
}
