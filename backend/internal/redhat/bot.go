package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type BotEvent struct {
	ID        string    `json:"id"`
	IP        string    `json:"ip"`
	UserAgent string    `json:"user_agent"`
	Behavior  string    `json:"behavior"` // Credential Stuffing, Scraping
	Action    string    `json:"action"`   // CAPTCHA, Blocked
	Timestamp time.Time `json:"timestamp"`
}

type BotEngine struct {
	db *gorm.DB
}

func NewBotEngine(db *gorm.DB) *BotEngine {
	return &BotEngine{db: db}
}

func (e *BotEngine) GetEvents() []BotEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "Bot").Order("timestamp desc").Limit(10).Find(&events)

	var botEvents []BotEvent
	for _, ev := range events {
		botEvents = append(botEvents, BotEvent{
			ID:        fmt.Sprintf("bot-%d", ev.ID),
			IP:        ev.Source,
			UserAgent: "Mozilla/5.0 (Headless)",
			Behavior:  ev.EventType,
			Action:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(botEvents) == 0 {
		return []BotEvent{{ID: "pending", IP: "Pending", UserAgent: "N/A", Behavior: "Waiting...", Action: "Waiting", Timestamp: time.Now()}}
	}
	return botEvents
}
