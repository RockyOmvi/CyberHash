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
				isSuspicious, details := e.IsMalicious(name)

				// Behavioral Analysis: Check Parent-Child Relationship
				if !isSuspicious {
					parent, err := p.Parent()
					if err == nil {
						parentName, err := parent.Name()
						if err == nil {
							isBehavioral, behavioralDetails := e.IsSuspiciousBehavior(name, parentName)
							if isBehavioral {
								isSuspicious = true
								details = behavioralDetails
							}
						}
					}
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

// IsMalicious checks if a process name matches known malicious tools
func (e *EDREngine) IsMalicious(name string) (bool, string) {
	lowerName := strings.ToLower(name)
	switch lowerName {
	case "ncat.exe", "nc.exe":
		return true, "Netcat detected (Potential Reverse Shell)"
	case "mimikatz.exe":
		return true, "Mimikatz detected (Credential Dumping)"
	}
	return false, ""
}

// IsSuspiciousBehavior checks for suspicious parent-child process chains
func (e *EDREngine) IsSuspiciousBehavior(childName, parentName string) (bool, string) {
	child := strings.ToLower(childName)
	parent := strings.ToLower(parentName)

	// Rule 1: Office apps spawning shells (Macro malware)
	if (parent == "winword.exe" || parent == "excel.exe" || parent == "powerpnt.exe") &&
		(child == "cmd.exe" || child == "powershell.exe") {
		return true, fmt.Sprintf("Suspicious: Office app (%s) spawned shell (%s)", parentName, childName)
	}

	// Rule 2: Web servers spawning shells (Webshell)
	if (parent == "w3wp.exe" || parent == "httpd.exe" || parent == "nginx.exe" || parent == "apache.exe") &&
		(child == "cmd.exe" || child == "powershell.exe" || child == "bash") {
		return true, fmt.Sprintf("Suspicious: Web server (%s) spawned shell (%s)", parentName, childName)
	}

	// Rule 3: Java spawning shell (Log4j / Deserialization)
	if parent == "java.exe" && (child == "cmd.exe" || child == "powershell.exe" || child == "bash") {
		return true, fmt.Sprintf("Suspicious: Java process (%s) spawned shell (%s)", parentName, childName)
	}

	return false, ""
}
