package automation

import (
	"fmt"
	"os/exec"
	"runtime"
	"time"

	"github.com/cybershield-ai/core/internal/integrations"
)

type ActionType string

const (
	ActionBlockIP   ActionType = "BlockIP"
	ActionSendAlert ActionType = "SendAlert"
	ActionLogEvent  ActionType = "LogEvent"
)

type Playbook struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Trigger     string     `json:"trigger"` // e.g., "HighSeverityVuln"
	Actions     []Action   `json:"actions"`
	Enabled     bool       `json:"enabled"`
	LastRun     *time.Time `json:"last_run"`
}

type Action struct {
	Type   ActionType        `json:"type"`
	Params map[string]string `json:"params"`
}

type AutomationEngine struct {
	Playbooks          []Playbook
	integrationManager *integrations.IntegrationManager
}

func NewAutomationEngine(im *integrations.IntegrationManager) *AutomationEngine {
	return &AutomationEngine{
		integrationManager: im,
		Playbooks: []Playbook{
			{
				ID:          "pb-001",
				Name:        "Block Malicious IPs",
				Description: "Automatically block IPs with high threat score",
				Trigger:     "HighThreatScore",
				Enabled:     true,
				Actions: []Action{
					{Type: ActionBlockIP, Params: map[string]string{"ip": "192.168.1.100"}}, // Demo IP
					{Type: ActionLogEvent, Params: map[string]string{"level": "WARN"}},
				},
			},
			{
				ID:          "pb-002",
				Name:        "Critical Vuln Alert",
				Description: "Send alert to Slack when critical vulnerability found",
				Trigger:     "CriticalVulnerability",
				Enabled:     true,
				Actions: []Action{
					{Type: ActionSendAlert, Params: map[string]string{"channel": "#security-alerts"}},
				},
			},
		},
	}
}

func (e *AutomationEngine) GetPlaybooks() []Playbook {
	return e.Playbooks
}

func (e *AutomationEngine) RunPlaybook(id string) error {
	for i, pb := range e.Playbooks {
		if pb.ID == id {
			if !pb.Enabled {
				return fmt.Errorf("playbook is disabled")
			}

			now := time.Now()
			e.Playbooks[i].LastRun = &now
			fmt.Printf("[Automation] Running Playbook: %s\n", pb.Name)

			for _, action := range pb.Actions {
				if err := e.executeAction(action); err != nil {
					fmt.Printf("  - Action Failed: %s (%v)\n", action.Type, err)
				} else {
					fmt.Printf("  - Action Executed: %s\n", action.Type)
				}
			}
			return nil
		}
	}
	return fmt.Errorf("playbook not found")
}

func (e *AutomationEngine) executeAction(action Action) error {
	switch action.Type {
	case ActionBlockIP:
		ip := action.Params["ip"]
		if ip == "" {
			return fmt.Errorf("missing ip param")
		}
		if runtime.GOOS == "windows" {
			// Real Windows Firewall Block
			cmd := exec.Command("netsh", "advfirewall", "firewall", "add", "rule", "name=\"CyberShield Block "+ip+"\"", "dir=in", "action=block", "remoteip="+ip)
			return cmd.Run()
		} else {
			// Linux
			cmd := exec.Command("iptables", "-A", "INPUT", "-s", ip, "-j", "DROP")
			return cmd.Run()
		}
	case ActionSendAlert:
		if e.integrationManager != nil {
			return e.integrationManager.SendAlert(integrations.Slack, "Playbook Triggered: "+action.Params["channel"])
		}
		return fmt.Errorf("integration manager not available")
	case ActionLogEvent:
		fmt.Printf("[LOG] %s\n", action.Params["level"])
		return nil
	default:
		return fmt.Errorf("unknown action type")
	}
}

func (e *AutomationEngine) TogglePlaybook(id string) error {
	for i, pb := range e.Playbooks {
		if pb.ID == id {
			e.Playbooks[i].Enabled = !pb.Enabled
			return nil
		}
	}
	return fmt.Errorf("playbook not found")
}
