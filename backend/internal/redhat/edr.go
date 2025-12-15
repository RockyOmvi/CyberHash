package redhat

import (
	"fmt"
	"strings"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"github.com/shirou/gopsutil/v3/process"
	"gorm.io/gorm"
)

type EDREngine struct {
	db *gorm.DB
}

func NewEDREngine(db *gorm.DB) *EDREngine {
	e := &EDREngine{db: db}
	e.StartRealMonitoring()
	return e
}

func (e *EDREngine) StartRealMonitoring() {
	go func() {
		for {
			processes, err := process.Processes()
			if err != nil {
				fmt.Printf("Error fetching processes: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			for _, p := range processes {
				name, err := p.Name()
				if err != nil {
					continue
				}

				// Simple "Malicious" Detection Logic
				// In a real product, this would check signatures/hashes.
				// Here we flag common tools often used by attackers if found.
				isSuspicious := false
				details := ""

				lowerName := strings.ToLower(name)
				switch lowerName {
				case "ncat.exe", "nc.exe":
					isSuspicious = true
					details = "Netcat detected (Potential Reverse Shell)"
				case "mimikatz.exe":
					isSuspicious = true
					details = "Mimikatz detected (Credential Dumping)"
				}

				if isSuspicious {
					// Active Enforcement: Kill the process
					if err := p.Kill(); err == nil {
						details += " [REMEDIATED: Process Killed]"
					} else {
						details += fmt.Sprintf(" [REMEDIATION FAILED: %v]", err)
					}

					event := models.SimulationEvent{
						Engine:    "EDR",
						EventType: "SUSPICIOUS_PROCESS",
						Severity:  "High",
						Source:    fmt.Sprintf("PID: %d", p.Pid),
						Target:    name,
						Details:   details,
						Status:    "Active",
						Timestamp: time.Now(),
					}
					e.db.Create(&event)
				}
			}

			// Also log a heartbeat event to show it's scanning
			if len(processes) > 0 {
				// Log stats occasionally
			}

			time.Sleep(30 * time.Second)
		}
	}()
}

func (e *EDREngine) GetEvents() []models.SimulationEvent {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "EDR").Order("timestamp desc").Limit(20).Find(&events)
	return events
}
