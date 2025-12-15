package middleware

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/cybershield-ai/core/internal/database"
	"github.com/cybershield-ai/core/internal/models"
	"github.com/gin-gonic/gin"
)

var (
	sqliPatterns = []string{
		`(?i)(\%27)|(\')|(\-\-)`,
		`(?i)((\%27)|(\'))union`,
		`(?i)exec(\s|\+)+(s|x)p\w+`,
		`(?i)(or|and)\s+1=1`,
	}
	xssPatterns = []string{
		`(?i)<script.*?>.*?<\/script>`,
		`(?i)javascript:`,
		`(?i)on\w+\s*=`,
	}
)

func SecurityMiddleware(store *database.MonitorStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		// 1. Check if IP is blocked
		// Allow monitor endpoints to be accessed even if blocked (to allow unblocking)
		// Also whitelist localhost for development
		if !strings.HasPrefix(c.Request.URL.Path, "/api/v1/monitor") && ip != "::1" && ip != "127.0.0.1" {
			blocked, err := store.IsIPBlocked(ip)
			if err != nil {
				// Log error but proceed? Or fail safe?
				// For now, proceed but log error internally if possible
			}
			if blocked {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied. Your IP is blocked."})
				return
			}
		}

		// 2. Analyze Request
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes)) // Restore body
		}

		payload := string(bodyBytes) + c.Request.URL.RawQuery
		riskScore := 0
		attackType := "None"

		// Check SQLi
		for _, pattern := range sqliPatterns {
			if match, _ := regexp.MatchString(pattern, payload); match {
				riskScore += 50
				attackType = "SQL Injection"
				break
			}
		}

		// Check XSS
		if riskScore == 0 {
			for _, pattern := range xssPatterns {
				if match, _ := regexp.MatchString(pattern, payload); match {
					riskScore += 30
					attackType = "XSS"
					break
				}
			}
		}

		// 3. Log Request
		status := "Logged"
		if riskScore >= 50 {
			status = "Blocked"
			// Auto-block high risk
			store.BlockIP(ip, "High Risk Activity: "+attackType, "System", 24*time.Hour)
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Malicious activity detected."})
		}

		logEntry := &models.SecurityLog{
			IPAddress:  ip,
			Method:     c.Request.Method,
			Path:       c.Request.URL.Path,
			Payload:    payload,
			RiskScore:  riskScore,
			AttackType: attackType,
			Status:     status,
		}
		store.CreateSecurityLog(logEntry)

		if status == "Blocked" {
			return
		}

		c.Next()
	}
}
