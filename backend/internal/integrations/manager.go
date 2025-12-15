package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type IntegrationType string

const (
	Slack     IntegrationType = "Slack"
	Jira      IntegrationType = "Jira"
	Teams     IntegrationType = "Teams"
	PagerDuty IntegrationType = "PagerDuty"
)

type IntegrationManager struct {
	db *gorm.DB
}

func NewIntegrationManager(db *gorm.DB) *IntegrationManager {
	m := &IntegrationManager{db: db}
	m.SeedConfigs()
	return m
}

func (m *IntegrationManager) SeedConfigs() {
	var count int64
	m.db.Model(&models.IntegrationConfig{}).Count(&count)
	if count == 0 {
		configs := []models.IntegrationConfig{
			{Type: "Slack", Enabled: false, Webhook: ""},
			{Type: "Jira", Enabled: false, APIKey: "", Project: "SEC"},
			{Type: "Teams", Enabled: false, Webhook: ""},
			{Type: "PagerDuty", Enabled: false, APIKey: ""},
		}
		m.db.Create(&configs)
	}
}

func (m *IntegrationManager) GetConfigs() []models.IntegrationConfig {
	var configs []models.IntegrationConfig
	m.db.Find(&configs)
	return configs
}

func (m *IntegrationManager) UpdateConfig(config models.IntegrationConfig) error {
	return m.db.Save(&config).Error
}

func (m *IntegrationManager) TestIntegration(integrationType IntegrationType) error {
	var config models.IntegrationConfig
	if err := m.db.Where("type = ?", integrationType).First(&config).Error; err != nil {
		return fmt.Errorf("integration not found")
	}
	if !config.Enabled {
		return fmt.Errorf("integration not enabled")
	}

	switch integrationType {
	case Slack, Teams:
		return m.sendWebhook(config.Webhook, map[string]string{"text": "Test message from CyberHash"})
	case Jira:
		// Mock Jira test for now as it requires complex auth
		return nil
	default:
		return fmt.Errorf("unsupported integration type")
	}
}

func (m *IntegrationManager) SendAlert(integrationType IntegrationType, message string) error {
	var config models.IntegrationConfig
	if err := m.db.Where("type = ?", integrationType).First(&config).Error; err != nil {
		return fmt.Errorf("integration not found")
	}
	if !config.Enabled {
		return fmt.Errorf("integration not enabled")
	}

	switch integrationType {
	case Slack:
		payload := map[string]string{"text": fmt.Sprintf("🚨 *CyberHash Alert*: %s", message)}
		return m.sendWebhook(config.Webhook, payload)
	case Teams:
		payload := map[string]string{"text": fmt.Sprintf("🚨 **CyberHash Alert**: %s", message)}
		return m.sendWebhook(config.Webhook, payload)
	default:
		return fmt.Errorf("sending not implemented for this type")
	}
}

func (m *IntegrationManager) sendWebhook(url string, payload interface{}) error {
	if url == "" {
		return fmt.Errorf("webhook URL is empty")
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("webhook failed with status: %d", resp.StatusCode)
	}

	return nil
}
