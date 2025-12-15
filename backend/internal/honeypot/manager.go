package honeypot

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type HoneypotType string

const (
	TypeSSH      HoneypotType = "SSH"
	TypeHTTP     HoneypotType = "HTTP"
	TypeDatabase HoneypotType = "Database"
)

type Honeypot struct {
	ID         string       `json:"id"`
	Name       string       `json:"name"`
	Type       HoneypotType `json:"type"`
	Port       int          `json:"port"`
	Status     string       `json:"status"` // "Running", "Stopped"
	Attacks    int          `json:"attacks"`
	LastAttack time.Time    `json:"last_attack"`
}

type HoneypotManager struct {
	db *gorm.DB
}

func NewHoneypotManager(db *gorm.DB) *HoneypotManager {
	m := &HoneypotManager{db: db}
	m.SeedHoneypots()
	return m
}

func (m *HoneypotManager) SeedHoneypots() {
	var count int64
	m.db.Model(&models.HoneypotNode{}).Count(&count)
	if count == 0 {
		nodes := []models.HoneypotNode{
			{Name: "Fake SSH Server", Type: "SSH", Region: "us-east-1", Status: "Active", Attacks: 15, LastAttack: time.Now().Add(-10 * time.Minute)},
			{Name: "Vulnerable Web App", Type: "HTTP", Region: "us-west-2", Status: "Active", Attacks: 42, LastAttack: time.Now().Add(-2 * time.Minute)},
			{Name: "Decoy Database", Type: "Database", Region: "eu-central-1", Status: "Stopped", Attacks: 0, LastAttack: time.Time{}},
		}
		m.db.Create(&nodes)
	}
}

func (m *HoneypotManager) GetHoneypots() []models.HoneypotNode {
	var nodes []models.HoneypotNode
	m.db.Find(&nodes)
	return nodes
}

func (m *HoneypotManager) DeployHoneypot(name string, hpType HoneypotType, port int) {
	fmt.Printf("[Honeypot] Deploying %s honeypot '%s' on port %d\n", hpType, name, port)

	node := models.HoneypotNode{
		Name:       name,
		Type:       string(hpType),
		Region:     "us-east-1", // Default
		Status:     "Active",
		Attacks:    0,
		LastAttack: time.Time{},
	}
	m.db.Create(&node)
}
