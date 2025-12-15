package database

import (
	"errors"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type MonitorStore struct {
	db *gorm.DB
}

func NewMonitorStore(db *gorm.DB) *MonitorStore {
	return &MonitorStore{db: db}
}

// CreateSecurityLog creates a new security log entry
func (s *MonitorStore) CreateSecurityLog(log *models.SecurityLog) error {
	return s.db.Create(log).Error
}

// GetSecurityLogs fetches the most recent security logs
func (s *MonitorStore) GetSecurityLogs(limit int) ([]models.SecurityLog, error) {
	var logs []models.SecurityLog
	err := s.db.Order("created_at desc").Limit(limit).Find(&logs).Error
	return logs, err
}

// BlockIP adds an IP to the blocked list
func (s *MonitorStore) BlockIP(ip string, reason string, blockedBy string, duration time.Duration) error {
	var expiresAt *time.Time
	if duration > 0 {
		t := time.Now().Add(duration)
		expiresAt = &t
	}

	blockedIP := models.BlockedIP{
		IPAddress: ip,
		Reason:    reason,
		BlockedBy: blockedBy,
		ExpiresAt: expiresAt,
	}

	return s.db.Create(&blockedIP).Error
}

// UnblockIP removes an IP from the blocked list
func (s *MonitorStore) UnblockIP(ip string) error {
	return s.db.Where("ip_address = ?", ip).Delete(&models.BlockedIP{}).Error
}

// IsIPBlocked checks if an IP is currently blocked
func (s *MonitorStore) IsIPBlocked(ip string) (bool, error) {
	var blockedIP models.BlockedIP
	err := s.db.Where("ip_address = ?", ip).First(&blockedIP).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}

	// Check expiration
	if blockedIP.ExpiresAt != nil && time.Now().After(*blockedIP.ExpiresAt) {
		// Clean up expired block
		s.UnblockIP(ip)
		return false, nil
	}

	return true, nil
}

// GetBlockedIPs fetches all currently blocked IPs
func (s *MonitorStore) GetBlockedIPs() ([]models.BlockedIP, error) {
	var ips []models.BlockedIP
	err := s.db.Find(&ips).Error
	return ips, err
}
