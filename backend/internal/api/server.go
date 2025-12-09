package api

import (
	"net/http"

	"github.com/cybershield-ai/core/internal/ai"
	"github.com/cybershield-ai/core/internal/auth"
	"github.com/cybershield-ai/core/internal/middleware"
	"github.com/cybershield-ai/core/internal/scanner"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router    *gin.Engine
	scanner   scanner.Scanner
	aiEngine  *ai.RemediationEngine
	wsManager *WebSocketManager
	userStore *auth.UserStore
}

func NewServer() *Server {
	r := gin.Default()

	// Initialize WebSocket Manager
	wsManager := NewWebSocketManager()
	go wsManager.HandleMessages()

	// Initialize Scanners
	zapScanner := scanner.NewZAPScanner("dummy-api-key")
	awsScanner := scanner.NewAWSScanner("us-east-1", "AKIA...", "SECRET...")

	// Create Orchestrator with both scanners
	orchestrator := scanner.NewOrchestrator(zapScanner, awsScanner)

	// Initialize AI Engine
	aiEngine := ai.NewRemediationEngine("dummy-openai-key")

	// Initialize User Store
	userStore := auth.NewUserStore()

	s := &Server{
		router:    r,
		scanner:   orchestrator,
		aiEngine:  aiEngine,
		wsManager: wsManager,
		userStore: userStore,
	}

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "cybershield-core",
		})
	})

	// WebSocket Endpoint
	r.GET("/ws", s.wsManager.HandleConnections)

	// Auth Routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", s.register)
		auth.POST("/login", s.login)
	}

	// API Group
	v1 := r.Group("/api/v1")
	v1.Use(middleware.TenantMiddleware()) // Apply to all v1 routes
	v1.Use(middleware.AuthMiddleware())   // Protect all v1 routes
	{
		v1.POST("/scans", s.startScan)
		v1.GET("/scans", s.getScanHistory)
		v1.GET("/scans/:id", s.getScanStatus)
		v1.POST("/remediate", s.generateRemediation)
	}

	// Webhooks (Public)
	r.POST("/webhooks/stripe", s.handleStripeWebhook)

	return s
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

// Handlers
type StartScanRequest struct {
	Target string `json:"target" binding:"required"`
}

func (s *Server) startScan(c *gin.Context) {
	var req StartScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.wsManager.BroadcastLog("INFO", "Initiating scan for target: "+req.Target)

	scanID, err := s.scanner.Start(c.Request.Context(), req.Target)
	if err != nil {
		s.wsManager.BroadcastLog("ERROR", "Failed to start scan: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start scan"})
		return
	}

	s.wsManager.BroadcastLog("SUCCESS", "Scan started successfully. ID: "+scanID)

	c.JSON(http.StatusAccepted, gin.H{
		"scan_id": scanID,
		"status":  "queued",
		"message": "Scan started successfully",
	})
}

func (s *Server) getScanStatus(c *gin.Context) {
	id := c.Param("id")
	status, progress, err := s.scanner.GetStatus(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get status"})
		return
	}

	// If completed, fetch results (simplified logic)
	var results *scanner.ScanResult
	if status == "completed" {
		results, _ = s.scanner.GetResults(c.Request.Context(), id)
	}

	c.JSON(http.StatusOK, gin.H{
		"scan_id":  id,
		"status":   status,
		"progress": progress,
		"results":  results,
	})
}

type RemediationRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	TechStack   string `json:"tech_stack" binding:"required"`
}

func (s *Server) generateRemediation(c *gin.Context) {
	var req RemediationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fix, err := s.aiEngine.GenerateFix(c.Request.Context(), req.Title, req.Description, req.TechStack)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate fix"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"fix": fix,
	})
}

func (s *Server) getScanHistory(c *gin.Context) {
	history, err := s.scanner.GetHistory(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scans": history})
}
