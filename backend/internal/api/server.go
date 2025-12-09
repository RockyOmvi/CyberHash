package api

import (
	"fmt"
	"net/http"
	"os"

	"github.com/cybershield-ai/core/internal/ai"
	"github.com/cybershield-ai/core/internal/auth"
	"github.com/cybershield-ai/core/internal/database"
	"github.com/cybershield-ai/core/internal/middleware"
	"github.com/cybershield-ai/core/internal/reporting"
	"github.com/cybershield-ai/core/internal/scanner"
	"github.com/cybershield-ai/core/internal/scheduler"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router       *gin.Engine
	orchestrator *scanner.Orchestrator
	userStore    *auth.UserStore
	aiEngine     *ai.RemediationEngine
	wsManager    *WebSocketManager
	scheduler    *scheduler.Scheduler
}

func NewServer() *Server {
	// Initialize Database
	db, err := database.InitDB()
	if err != nil {
		panic("failed to connect to database: " + err.Error())
	}

	// Auto Migration
	if err := db.AutoMigrate(&auth.User{}, &scanner.ScanResult{}, &scanner.Vuln{}, &scheduler.ScheduledScan{}); err != nil {
		panic("failed to migrate database: " + err.Error())
	}

	r := gin.Default()

	// Initialize WebSocket Manager
	wsManager := NewWebSocketManager()
	go wsManager.HandleMessages()

	// Initialize Scanners
	zapScanner := scanner.NewZAPScanner("dummy-zap-key")
	awsScanner := scanner.NewAWSScanner("us-east-1", "dummy-access-key", "dummy-secret-key")

	// Initialize Orchestrator with DB
	orchestrator := scanner.NewOrchestrator(db, zapScanner, awsScanner)

	// Initialize Scheduler
	sched := scheduler.NewScheduler(db, orchestrator)
	sched.Start()

	// Initialize AI Engine
	apiKey := getEnv("GEMINI_API_KEY", "")
	aiEngine := ai.NewRemediationEngine(apiKey)

	// Initialize UserStore with DB
	userStore := auth.NewUserStore(db)

	s := &Server{
		router:       r,
		orchestrator: orchestrator,
		userStore:    userStore,
		aiEngine:     aiEngine,
		wsManager:    wsManager,
		scheduler:    sched,
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
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/register", s.register)
		authGroup.POST("/login", s.login)
	}

	// API Group
	v1 := r.Group("/api/v1")
	v1.Use(middleware.TenantMiddleware()) // Apply to all v1 routes
	v1.Use(middleware.AuthMiddleware())   // Protect all v1 routes
	{
		v1.POST("/scans", s.startScan)
		v1.GET("/scans", s.getScanHistory)
		v1.GET("/scans/:id", s.getScanStatus)
		v1.GET("/scans/:id/report", s.downloadReport)
		v1.POST("/remediate", s.generateRemediation)

		v1.POST("/schedules", s.createSchedule)
		v1.GET("/schedules", s.getSchedules)
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

	scanID, err := s.orchestrator.Start(c.Request.Context(), req.Target)
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
	status, progress, err := s.orchestrator.GetStatus(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get status"})
		return
	}

	// If completed, fetch results (simplified logic)
	var results *scanner.ScanResult
	if status == "completed" {
		results, _ = s.orchestrator.GetResults(c.Request.Context(), id)
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
		fmt.Printf("AI Generation Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate fix"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"fix": fix,
	})
}

func (s *Server) getScanHistory(c *gin.Context) {
	history, err := s.orchestrator.GetHistory(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scans": history})
}

func (s *Server) downloadReport(c *gin.Context) {
	id := c.Param("id")
	results, err := s.orchestrator.GetResults(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scan not found"})
		return
	}

	pdfBytes, err := reporting.GenerateReport(results)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report"})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=report-"+id+".pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

type CreateScheduleRequest struct {
	Target    string `json:"target" binding:"required"`
	Frequency string `json:"frequency" binding:"required"` // e.g., "@daily"
}

func (s *Server) createSchedule(c *gin.Context) {
	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	schedule, err := s.scheduler.AddSchedule(req.Target, req.Frequency)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	c.JSON(http.StatusCreated, schedule)
}

func (s *Server) getSchedules(c *gin.Context) {
	schedules, err := s.scheduler.GetSchedules()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get schedules"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"schedules": schedules})
}
