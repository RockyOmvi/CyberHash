package scheduler

import (
	"context"
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/scanner"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

type ScheduledScan struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Target    string    `json:"target"`
	Frequency string    `json:"frequency"` // e.g., "@daily", "@weekly"
	NextRun   time.Time `json:"next_run"`
	CreatedAt time.Time `json:"created_at"`
}

type Scheduler struct {
	db           *gorm.DB
	cron         *cron.Cron
	orchestrator *scanner.Orchestrator
}

func NewScheduler(db *gorm.DB, orchestrator *scanner.Orchestrator) *Scheduler {
	s := &Scheduler{
		db:           db,
		cron:         cron.New(),
		orchestrator: orchestrator,
	}
	return s
}

func (s *Scheduler) Start() {
	s.loadSchedules()
	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
}

func (s *Scheduler) AddSchedule(target, frequency string) (*ScheduledScan, error) {
	schedule := &ScheduledScan{
		Target:    target,
		Frequency: frequency,
	}

	if err := s.db.Create(schedule).Error; err != nil {
		return nil, err
	}

	if err := s.scheduleJob(schedule); err != nil {
		return nil, err
	}

	return schedule, nil
}

func (s *Scheduler) scheduleJob(schedule *ScheduledScan) error {
	_, err := s.cron.AddFunc(schedule.Frequency, func() {
		fmt.Printf("Starting scheduled scan for %s\n", schedule.Target)
		_, err := s.orchestrator.Start(context.Background(), schedule.Target)
		if err != nil {
			fmt.Printf("Failed to start scheduled scan: %v\n", err)
		}
	})
	return err
}

func (s *Scheduler) loadSchedules() {
	var schedules []ScheduledScan
	if err := s.db.Find(&schedules).Error; err != nil {
		fmt.Printf("Failed to load schedules: %v\n", err)
		return
	}

	for _, schedule := range schedules {
		if err := s.scheduleJob(&schedule); err != nil {
			fmt.Printf("Failed to schedule job %d: %v\n", schedule.ID, err)
		}
	}
}

func (s *Scheduler) GetSchedules() ([]ScheduledScan, error) {
	var schedules []ScheduledScan
	if err := s.db.Find(&schedules).Error; err != nil {
		return nil, err
	}
	return schedules, nil
}

func (s *Scheduler) RemoveSchedule(id string) error {
	if err := s.db.Delete(&ScheduledScan{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}
