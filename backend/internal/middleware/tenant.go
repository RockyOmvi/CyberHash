package middleware

import (
	"github.com/gin-gonic/gin"
)

// TenantMiddleware extracts OrgID from context (e.g., JWT) and enforces isolation
func TenantMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Mock: In reality, extract this from JWT token
		orgID := c.GetHeader("X-Org-ID")
		if orgID == "" {
			// For dev/test, default to a dummy org
			orgID = "org_default"
		}

		// Set OrgID in context for handlers to use
		c.Set("OrgID", orgID)

		c.Next()
	}
}
