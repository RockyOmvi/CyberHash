package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestTenantMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(TenantMiddleware())
	
	r.GET("/test", func(c *gin.Context) {
		orgID, exists := c.Get("OrgID")
		if !exists {
			t.Error("OrgID not found in context")
		}
		if orgID != "org_123" {
			t.Errorf("Expected OrgID 'org_123', got '%v'", orgID)
		}
		c.Status(http.StatusOK)
	})

	// Test with Header
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Org-ID", "org_123")
	w := httptest.NewRecorder()
	
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestTenantMiddleware_Default(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(TenantMiddleware())
	
	r.GET("/test_default", func(c *gin.Context) {
		orgID, _ := c.Get("OrgID")
		if orgID != "org_default" {
			t.Errorf("Expected default OrgID 'org_default', got '%v'", orgID)
		}
		c.Status(http.StatusOK)
	})

	// Test without Header
	req, _ := http.NewRequest("GET", "/test_default", nil)
	w := httptest.NewRecorder()
	
	r.ServeHTTP(w, req)
}
