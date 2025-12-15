package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type EBPFEvent struct {
	ID        string    `json:"id"`
	Process   string    `json:"process"`
	Syscall   string    `json:"syscall"` // execve, connect, open
	User      string    `json:"user"`
	Action    string    `json:"action"` // Allowed, Blocked
	Timestamp time.Time `json:"timestamp"`
}

type EBPFEngine struct {
	db *gorm.DB
}

func NewEBPFEngine(db *gorm.DB) *EBPFEngine {
	return &EBPFEngine{db: db}
}

func (e *EBPFEngine) GetEvents() []EBPFEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "EBPF").Order("timestamp desc").Limit(10).Find(&events)

	var ebpfEvents []EBPFEvent
	for _, ev := range events {
		ebpfEvents = append(ebpfEvents, EBPFEvent{
			ID:        fmt.Sprintf("ebpf-%d", ev.ID),
			Process:   ev.Source,
			Syscall:   ev.EventType,
			User:      "root",
			Action:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(ebpfEvents) == 0 {
		return []EBPFEvent{{ID: "pending", Process: "Pending", Syscall: "N/A", User: "N/A", Action: "Waiting", Timestamp: time.Now()}}
	}
	return ebpfEvents
}
