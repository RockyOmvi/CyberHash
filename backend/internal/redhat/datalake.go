package redhat

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type LakeQuery struct {
	ID        string    `json:"id"`
	Query     string    `json:"query"`
	Status    string    `json:"status"` // Completed, Running
	Rows      int       `json:"rows"`
	Duration  string    `json:"duration"`
	Timestamp time.Time `json:"timestamp"`
}

type DataLakeEngine struct {
	db *gorm.DB
}

func NewDataLakeEngine(db *gorm.DB) *DataLakeEngine {
	return &DataLakeEngine{db: db}
}

func (e *DataLakeEngine) GetQueries() []LakeQuery {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "DataLake").Order("timestamp desc").Limit(10).Find(&events)

	var queries []LakeQuery
	for _, ev := range events {
		queries = append(queries, LakeQuery{
			ID:        fmt.Sprintf("lake-%d", ev.ID),
			Query:     fmt.Sprintf("SELECT * FROM logs WHERE source='%s'", ev.Source),
			Status:    ev.Status,
			Rows:      1500,
			Duration:  "250ms",
			Timestamp: ev.Timestamp,
		})
	}

	if len(queries) == 0 {
		return []LakeQuery{{ID: "pending", Query: "Pending", Status: "Waiting", Rows: 0, Duration: "0ms", Timestamp: time.Now()}}
	}
	return queries
}
