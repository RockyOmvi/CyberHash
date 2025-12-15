package gateway

import (
	"fmt"
	"sync"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type RuleType string

const (
	RuleRateLimit    RuleType = "RateLimit"
	RuleAuthCheck    RuleType = "AuthCheck"
	RuleSQLInjection RuleType = "SQLInjection"
)

type GatewayRule struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Type      RuleType `json:"type"`
	Enabled   bool     `json:"enabled"`
	Threshold int      `json:"threshold"`
}

type APIGateway struct {
	db *gorm.DB
	mu sync.Mutex
}

func NewAPIGateway(db *gorm.DB) *APIGateway {
	g := &APIGateway{db: db}
	g.SeedRules()
	return g
}

func (g *APIGateway) SeedRules() {
	var count int64
	g.db.Model(&models.GatewayRule{}).Count(&count)
	if count == 0 {
		rules := []models.GatewayRule{
			{Name: "Global Rate Limit", Type: "RateLimit", Enabled: true, Threshold: 1000},
			{Name: "Block SQL Injection", Type: "SQLInjection", Enabled: true, Threshold: 0},
			{Name: "Enforce Authentication", Type: "AuthCheck", Enabled: true, Threshold: 0},
		}
		g.db.Create(&rules)
	}
}

func (g *APIGateway) GetRules() []models.GatewayRule {
	var rules []models.GatewayRule
	g.db.Find(&rules)
	return rules
}

func (g *APIGateway) ToggleRule(id string) error {
	var rule models.GatewayRule
	if err := g.db.Where("id = ?", id).First(&rule).Error; err != nil {
		return fmt.Errorf("rule not found")
	}
	rule.Enabled = !rule.Enabled
	return g.db.Save(&rule).Error
}
