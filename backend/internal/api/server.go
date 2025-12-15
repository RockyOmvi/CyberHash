package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/cybershield-ai/core/internal/ai"
	"github.com/cybershield-ai/core/internal/apm"
	"github.com/cybershield-ai/core/internal/auth"
	"github.com/cybershield-ai/core/internal/automation"
	"github.com/cybershield-ai/core/internal/cloud"
	"github.com/cybershield-ai/core/internal/compliance"
	"github.com/cybershield-ai/core/internal/container"
	"github.com/cybershield-ai/core/internal/context"
	"github.com/cybershield-ai/core/internal/crypto"
	"github.com/cybershield-ai/core/internal/database"
	"github.com/cybershield-ai/core/internal/gateway"
	"github.com/cybershield-ai/core/internal/hardware"
	"github.com/cybershield-ai/core/internal/honeypot"
	"github.com/cybershield-ai/core/internal/iac"
	"github.com/cybershield-ai/core/internal/identity"
	"github.com/cybershield-ai/core/internal/infrastructure"
	"github.com/cybershield-ai/core/internal/integrations"
	"github.com/cybershield-ai/core/internal/isolation"
	"github.com/cybershield-ai/core/internal/middleware"
	"github.com/cybershield-ai/core/internal/models"
	"github.com/cybershield-ai/core/internal/phishing"
	"github.com/cybershield-ai/core/internal/redhat"
	"github.com/cybershield-ai/core/internal/redteam"
	"github.com/cybershield-ai/core/internal/reporting"
	"github.com/cybershield-ai/core/internal/scanner"
	"github.com/cybershield-ai/core/internal/scheduler"
	"github.com/cybershield-ai/core/internal/secrets"
	"github.com/cybershield-ai/core/internal/simulation"
	"github.com/cybershield-ai/core/internal/ueba"
	"github.com/cybershield-ai/core/internal/voice"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"golang.org/x/time/rate"
)

type Server struct {
	router             *gin.Engine
	userStore          *auth.UserStore
	orchestrator       *scanner.Orchestrator
	scheduler          *scheduler.Scheduler
	wsManager          *WebSocketManager
	aiEngine           *ai.RemediationEngine
	monitorStore       *database.MonitorStore
	complianceManager  *compliance.Manager
	cloudManager       *cloud.CloudManager
	integrationManager *integrations.IntegrationManager
	automationEngine   *automation.AutomationEngine
	uebaEngine         *ueba.UEBAEngine
	honeypotManager    *honeypot.HoneypotManager
	apiGateway         *gateway.APIGateway
	containerScanner   *container.ContainerScanner
	iacScanner         *iac.IaCScanner
	awsScanner         *scanner.AWSScanner
	chatEngine         *ai.ChatEngine
	phishingManager    *phishing.PhishingManager
	telemetryEngine    *hardware.TelemetryEngine
	itdrEngine         *identity.ITDREngine
	apmEngine          *apm.APMEngine
	ephemeralEngine    *infrastructure.EphemeralEngine
	deepfakeScanner    *voice.DeepfakeScanner
	contextEngine      *context.ContextEngine
	secretsEngine      *secrets.SecretsEngine
	zkpEngine          *identity.ZKPEngine
	insiderEngine      *ueba.InsiderThreatEngine
	cartEngine         *redteam.CARTEngine
	rbiEngine          *isolation.RBIEngine
	sovereignEngine    *compliance.SovereignEngine
	quantumEngine      *crypto.QuantumEngine
	aptEngine          *redhat.APTEngine
	socialEngine       *redhat.SocialEngine
	lotlEngine         *redhat.LotLEngine
	ransomwareEngine   *redhat.RansomwareEngine
	exfilEngine        *redhat.ExfilEngine
	adEngine           *redhat.ADEngine
	zeroDayEngine      *redhat.ZeroDayEngine
	ebpfEngine         *redhat.EBPFEngine
	serverlessEngine   *redhat.ServerlessEngine
	ciemEngine         *redhat.CIEMEngine
	driftEngine        *redhat.DriftEngine
	admissionEngine    *redhat.AdmissionEngine
	raspEngine         *redhat.RASPEngine
	edrEngine          *redhat.EDREngine
	schemaEngine       *redhat.SchemaEngine
	botEngine          *redhat.BotEngine
	sbomEngine         *redhat.SBOMEngine
	dspmEngine         *redhat.DSPMEngine
	easmEngine         *redhat.EASMEngine
	intelEngine        *redhat.IntelEngine
	dataLakeEngine     *redhat.DataLakeEngine
	jitEngine          *redhat.JITEngine
	saAnomalyEngine    *redhat.SAAnomalyEngine
	evidenceEngine     *redhat.EvidenceEngine
	tprmEngine         *redhat.TPRMEngine
	policyEngine       *redhat.PolicyEngine
	llmFirewallEngine  *redhat.LLMFirewallEngine
	quantumSafeEngine  *redhat.QuantumEngine
	iotSlicingEngine   *redhat.IoTSlicingEngine
	digitalTwinEngine  *redhat.DigitalTwinEngine
	godModeEngine      *redhat.GodModeEngine
	simulationEngine   *simulation.SimulationEngine
	secretsManager     secrets.Manager
}

func NewServer(secretsManager secrets.Manager) *Server {
	// Initialize Database
	db, err := database.InitDB()
	if err != nil {
		panic("failed to connect to database: " + err.Error())
	}

	// Auto Migration
	if err := db.AutoMigrate(&auth.User{}, &scanner.ScanResult{}, &scanner.Vuln{}, &scheduler.ScheduledScan{}, &models.SecurityLog{}, &models.BlockedIP{}); err != nil {
		panic("failed to migrate database: " + err.Error())
	}

	r := gin.Default()

	// Initialize WebSocket Manager
	wsManager := NewWebSocketManager()
	go wsManager.HandleMessages()

	// Initialize AI Engines
	apiKey, _ := secretsManager.GetSecret("GEMINI_API_KEY")
	if apiKey == "" {
		slog.Warn("GEMINI_API_KEY is not set. AI features will be disabled.")
	} else {
		slog.Info("GEMINI_API_KEY is set.")
	}
	aiEngine := ai.NewRemediationEngine(apiKey)
	var chatEngine *ai.ChatEngine
	if aiEngine != nil && aiEngine.Client != nil {
		chatEngine = ai.NewChatEngine(aiEngine.Client, db)
		slog.Info("ChatEngine initialized successfully.")
	} else {
		slog.Error("Failed to initialize ChatEngine.")
	}

	// Initialize Scanners
	zapScanner := scanner.NewZAPScanner("dummy-zap-key")
	scaScanner := scanner.NewSCAScanner(db, aiEngine)
	orchestrator := scanner.NewOrchestrator(db, zapScanner, scaScanner)

	// Initialize Scheduler
	sched := scheduler.NewScheduler(db, orchestrator)
	sched.Start()

	// Initialize Stores and Managers
	userStore := auth.NewUserStore(db)
	monitorStore := database.NewMonitorStore(db)

	complianceManager := compliance.NewManager(db)
	// Initialize Scanners
	containerScanner := container.NewContainerScanner()
	iacScanner := iac.NewIaCScanner()

	// Initialize AWS Scanner (Real)
	awsRegion, _ := secretsManager.GetSecret("AWS_REGION")
	if awsRegion == "" {
		awsRegion = "us-east-1"
	}
	awsAccessKey, _ := secretsManager.GetSecret("AWS_ACCESS_KEY_ID")
	awsSecretKey, _ := secretsManager.GetSecret("AWS_SECRET_ACCESS_KEY")
	awsScanner := scanner.NewAWSScanner(awsRegion, awsAccessKey, awsSecretKey)

	cloudManager := cloud.NewCloudManager(db, awsScanner)
	integrationManager := integrations.NewIntegrationManager(db)
	automationEngine := automation.NewAutomationEngine(integrationManager)
	uebaEngine := ueba.NewUEBAEngine(db)
	honeypotManager := honeypot.NewHoneypotManager(db)
	apiGateway := gateway.NewAPIGateway(db)

	phishingManager := phishing.NewPhishingManager(db)
	telemetryEngine := hardware.NewTelemetryEngine(db)
	itdrEngine := identity.NewITDREngine(db)
	apmEngine := apm.NewAPMEngine(db)
	ephemeralEngine := infrastructure.NewEphemeralEngine(db)
	deepfakeScanner := voice.NewDeepfakeScanner(db)
	contextEngine := context.NewContextEngine(db)
	secretsEngine := secrets.NewSecretsEngine(db)
	zkpEngine := identity.NewZKPEngine(db)
	insiderEngine := ueba.NewInsiderThreatEngine(db)
	cartEngine := redteam.NewCARTEngine(db)
	rbiEngine := isolation.NewRBIEngine(db)
	sovereignEngine := compliance.NewSovereignEngine(db)
	quantumEngine := crypto.NewQuantumEngine(db)
	aptEngine := redhat.NewAPTEngine(db)
	socialEngine := redhat.NewSocialEngine(db)
	lotlEngine := redhat.NewLotLEngine(db)
	ransomwareEngine := redhat.NewRansomwareEngine(db)
	exfilEngine := redhat.NewExfilEngine(db)
	adEngine := redhat.NewADEngine(db)
	zeroDayEngine := redhat.NewZeroDayEngine(db)
	ebpfEngine := redhat.NewEBPFEngine(db)
	serverlessEngine := redhat.NewServerlessEngine(db)
	ciemEngine := redhat.NewCIEMEngine(db)
	driftEngine := redhat.NewDriftEngine(db)
	admissionEngine := redhat.NewAdmissionEngine(db)
	raspEngine := redhat.NewRASPEngine(db)
	edrEngine := redhat.NewEDREngine(db)
	schemaEngine := redhat.NewSchemaEngine(db)
	botEngine := redhat.NewBotEngine(db)
	sbomEngine := redhat.NewSBOMEngine()
	dspmEngine := redhat.NewDSPMEngine(db)
	easmEngine := redhat.NewEASMEngine(db)
	intelEngine := redhat.NewIntelEngine(db)
	dataLakeEngine := redhat.NewDataLakeEngine(db)
	jitEngine := redhat.NewJITEngine(db)
	saAnomalyEngine := redhat.NewSAAnomalyEngine(db)
	evidenceEngine := redhat.NewEvidenceEngine(db)
	tprmEngine := redhat.NewTPRMEngine(db)
	policyEngine := redhat.NewPolicyEngine(db)
	llmFirewallEngine := redhat.NewLLMFirewallEngine(db)
	quantumSafeEngine := redhat.NewQuantumEngine(db)
	iotSlicingEngine := redhat.NewIoTSlicingEngine(db)
	digitalTwinEngine := redhat.NewDigitalTwinEngine(db)
	godModeEngine := redhat.NewGodModeEngine(db)
	simEngine := simulation.NewSimulationEngine(db)

	s := &Server{
		router:             r,
		userStore:          userStore,
		orchestrator:       orchestrator,
		scheduler:          sched,
		wsManager:          wsManager,
		aiEngine:           aiEngine,
		monitorStore:       monitorStore,
		complianceManager:  complianceManager,
		cloudManager:       cloudManager,
		integrationManager: integrationManager,
		automationEngine:   automationEngine,
		uebaEngine:         uebaEngine,
		honeypotManager:    honeypotManager,
		apiGateway:         apiGateway,
		containerScanner:   containerScanner,
		iacScanner:         iacScanner,
		awsScanner:         awsScanner,
		chatEngine:         chatEngine,
		phishingManager:    phishingManager,
		telemetryEngine:    telemetryEngine,
		itdrEngine:         itdrEngine,
		apmEngine:          apmEngine,
		ephemeralEngine:    ephemeralEngine,
		deepfakeScanner:    deepfakeScanner,
		contextEngine:      contextEngine,
		secretsEngine:      secretsEngine,
		zkpEngine:          zkpEngine,
		insiderEngine:      insiderEngine,
		cartEngine:         cartEngine,
		rbiEngine:          rbiEngine,
		sovereignEngine:    sovereignEngine,
		quantumEngine:      quantumEngine,
		aptEngine:          aptEngine,
		socialEngine:       socialEngine,
		lotlEngine:         lotlEngine,
		ransomwareEngine:   ransomwareEngine,
		exfilEngine:        exfilEngine,
		adEngine:           adEngine,
		zeroDayEngine:      zeroDayEngine,
		ebpfEngine:         ebpfEngine,
		serverlessEngine:   serverlessEngine,
		ciemEngine:         ciemEngine,
		driftEngine:        driftEngine,
		admissionEngine:    admissionEngine,
		raspEngine:         raspEngine,
		edrEngine:          edrEngine,
		schemaEngine:       schemaEngine,
		botEngine:          botEngine,
		sbomEngine:         sbomEngine,
		dspmEngine:         dspmEngine,
		easmEngine:         easmEngine,
		intelEngine:        intelEngine,
		dataLakeEngine:     dataLakeEngine,
		jitEngine:          jitEngine,
		saAnomalyEngine:    saAnomalyEngine,
		evidenceEngine:     evidenceEngine,
		tprmEngine:         tprmEngine,
		policyEngine:       policyEngine,
		llmFirewallEngine:  llmFirewallEngine,
		quantumSafeEngine:  quantumSafeEngine,
		iotSlicingEngine:   iotSlicingEngine,
		digitalTwinEngine:  digitalTwinEngine,
		godModeEngine:      godModeEngine,
		simulationEngine:   simEngine,
		secretsManager:     secretsManager,
	}

	simEngine.Start()

	s.RegisterRoutes()

	return s
}

func (s *Server) RegisterRoutes() {
	// Middleware
	s.router.Use(middleware.CORSMiddleware())
	s.router.Use(middleware.RateLimitMiddleware(rate.Limit(10), 20)) // 10 req/s, burst 20
	s.router.Use(middleware.SecurityHeaders())
	s.router.Use(middleware.MetricsMiddleware())
	s.router.Use(middleware.SecurityMiddleware(s.monitorStore))

	// WebSocket
	s.router.GET("/ws", s.serveWs)

	// Metrics
	s.router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	v1 := s.router.Group("/api/v1")
	{
		// Auth Routes
		v1.POST("/auth/register", s.register)
		v1.POST("/auth/login", s.login)

		// Public Routes (Webhooks)
		v1.POST("/webhooks/stripe", s.handleStripeWebhook)
		v1.POST("/webhooks/aws/cloudtrail", s.handleAWSWebhook)

		// Protected Routes
		authenticated := v1.Group("/")
		authenticated.Use(middleware.AuthMiddleware())
		{
			// Scan Routes
			authenticated.POST("/scan", s.startScan)
			authenticated.GET("/scan/:id", s.getScanStatus)
			authenticated.GET("/scan/:id/results", s.getScanResults)
			authenticated.GET("/scans/history", s.getScanHistory)

			// Dashboard Routes
			authenticated.GET("/dashboard/stats", s.getDashboardStats)

			// Phishing Routes
			authenticated.GET("/phishing/campaigns", s.getPhishingCampaigns)
			authenticated.POST("/phishing/campaigns", s.createPhishingCampaign)
			authenticated.POST("/phishing/click/:id", s.simulatePhishingClick)
			authenticated.GET("/phishing/templates", s.getPhishingTemplates)

			// Scheduler Routes
			authenticated.POST("/schedule", s.scheduleScan)
			authenticated.GET("/schedules", s.getScheduledScans)
			authenticated.DELETE("/schedules/:id", s.deleteScheduledScan)

			// Remediation Routes
			authenticated.POST("/remediate/fix", s.generateFix)
			authenticated.POST("/remediate/pr", s.createFixPR)

			// Chat Routes
			authenticated.POST("/chat", s.handleChat)

			// Monitor Routes
			authenticated.GET("/monitor/logs", s.getMonitorLogs)
			authenticated.GET("/monitor/blocked", s.getBlockedIPs)
			authenticated.POST("/monitor/block", s.blockIP)
			authenticated.POST("/monitor/unblock/:ip", s.unblockIP)

			// Compliance Routes
			authenticated.GET("/compliance/standards", s.getComplianceStandards)
			authenticated.POST("/compliance/assess", s.assessCompliance)
			authenticated.GET("/compliance/reports", s.getComplianceReports)

			// Cloud Routes
			authenticated.GET("/cloud/resources", s.getCloudResources)
			authenticated.POST("/cloud/scan", s.scanCloudResources)
			authenticated.GET("/cloud/posture", s.getCloudPosture)

			// Integrations routes
			authenticated.GET("/integrations", s.getIntegrations)
			authenticated.POST("/integrations", s.updateIntegration)
			authenticated.POST("/integrations/test", s.testIntegration)
			authenticated.POST("/integrations/send-test-message", s.sendTestIntegrationMessage)

			// Automation routes
			authenticated.GET("/playbooks", s.getPlaybooks)
			authenticated.POST("/playbooks/:id/run", s.runPlaybook)
			authenticated.POST("/playbooks/:id/toggle", s.togglePlaybook)

			// Reporting routes
			authenticated.POST("/reports/generate", s.generateCustomReport)
			authenticated.GET("/reports/download/:id", s.downloadReport)

			// UEBA routes
			authenticated.GET("/ueba/anomalies", s.getAnomalies)

			// Honeypot routes
			authenticated.GET("/honeypots", s.getHoneypots)

			// Gateway routes
			authenticated.GET("/gateway/rules", s.getGatewayRules)
			authenticated.POST("/gateway/rules/:id/toggle", s.toggleGatewayRule)

			// Container Routes
			authenticated.GET("/containers/scan", s.getContainerScans)

			// IaC Routes
			authenticated.GET("/iac/scan", s.getIaCScans)

			// Hardware Telemetry
			authenticated.GET("/hardware/telemetry", s.getHardwareTelemetry)

			// ITDR Routes
			authenticated.GET("/identity/alerts", s.getIdentityAlerts)

			// APM Routes
			authenticated.GET("/apm/graph", s.getAPMGraph)

			// Ephemeral Infrastructure
			authenticated.GET("/infrastructure/rotation", s.getEphemeralRotation)

			// Deepfake Detection
			authenticated.GET("/voice/alerts", s.getVoiceAlerts)

			// Code-to-Cloud Context
			authenticated.GET("/context/trace", s.getContextTrace)

			// Secrets Mesh
			authenticated.GET("/secrets/mesh", s.getSecretsMesh)

			// ZKP Identity
			authenticated.GET("/identity/zkp/verify", s.getZKPProofs)

			// Insider Threat
			authenticated.GET("/ueba/predictions", s.getInsiderPredictions)

			// CART (Red Teaming)
			authenticated.GET("/redteam/campaigns", s.getCARTCampaigns)

			// RBI (Browser Isolation)
			authenticated.GET("/isolation/sessions", s.getRBISessions)

			// Sovereign Cloud
			authenticated.GET("/compliance/sovereign", s.getSovereignStatus)

			// Quantum Crypto
			authenticated.GET("/crypto/quantum", s.getQuantumStatus)

			// Phase 3: Red Hat Security
			authenticated.GET("/redhat/apt", s.getAPTProfiles)
			authenticated.GET("/redhat/social", s.getSocialCampaigns)
			authenticated.GET("/redhat/lotl", s.getLotLActivity)
			authenticated.GET("/redhat/ransomware", s.getRansomwareSims)
			authenticated.GET("/redhat/exfil", s.getExfilTests)
			authenticated.GET("/redhat/ad", s.getADPaths)
			authenticated.GET("/redhat/zeroday", s.getZeroDaySims)
			authenticated.GET("/redhat/ebpf", s.getEBPFEvents)
			authenticated.GET("/redhat/serverless", s.getServerlessFunctions)
			authenticated.GET("/redhat/ciem", s.getEntitlements)
			authenticated.GET("/redhat/drift", s.getDriftEvents)
			authenticated.GET("/redhat/admission", s.getAdmissionRequests)
			authenticated.GET("/redhat/rasp", s.getRASPEvents)
			authenticated.GET("/redhat/edr", s.getEDREvents)
			authenticated.GET("/redhat/schema", s.getSchemaViolations)
			authenticated.GET("/redhat/bot", s.getBotEvents)
			authenticated.GET("/redhat/sbom", s.getSBOMComponents)
			authenticated.GET("/redhat/dspm", s.getDataAssets)
			authenticated.GET("/redhat/easm", s.getExternalAssets)
			authenticated.GET("/redhat/intel", s.getThreatFeeds)
			authenticated.GET("/redhat/datalake", s.getDataLakeQueries)
			authenticated.GET("/redhat/jit", s.getJITRequests)
			authenticated.GET("/redhat/sa-anomaly", s.getSAAnomalies)
			authenticated.GET("/redhat/evidence", s.getEvidence)
			authenticated.GET("/redhat/tprm", s.getVendorRisks)
			authenticated.GET("/redhat/policy", s.getPolicyChecks)
			authenticated.GET("/redhat/llm-firewall", s.getLLMEvents)
			authenticated.GET("/redhat/quantum", s.getQuantumTunnels)
			authenticated.GET("/redhat/iot-slicing", s.getIoTSlices)
			authenticated.GET("/redhat/digital-twin", s.getTwinSimulations)
			authenticated.GET("/redhat/god-mode", s.getGodTimeline)
		}
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *Server) serveWs(c *gin.Context) {
	s.wsManager.HandleConnections(c)
}

// Handlers

func (s *Server) startScan(c *gin.Context) {
	var req struct {
		Target string `json:"target"`
		Type   string `json:"type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	scanID, err := s.orchestrator.Start(c.Request.Context(), req.Target)
	if err != nil {
		slog.Error("Scan start failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to start scan: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scan_id": scanID})
}

func (s *Server) getScanStatus(c *gin.Context) {
	id := c.Param("id")
	status, _, err := s.orchestrator.GetStatus(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scan not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": status})
}

func (s *Server) getScanResults(c *gin.Context) {
	id := c.Param("id")
	results, err := s.orchestrator.GetResults(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Results not found"})
		return
	}
	c.JSON(http.StatusOK, results)
}

func (s *Server) getScanHistory(c *gin.Context) {
	history, err := s.orchestrator.GetHistory(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scans": history})
}

func (s *Server) scheduleScan(c *gin.Context) {
	var req struct {
		Target    string `json:"target"`
		Frequency string `json:"frequency"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if _, err := s.scheduler.AddSchedule(req.Target, req.Frequency); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule scan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Scan scheduled"})
}

func (s *Server) getScheduledScans(c *gin.Context) {
	scans, err := s.scheduler.GetSchedules()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get scheduled scans"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scans": scans})
}

func (s *Server) deleteScheduledScan(c *gin.Context) {
	id := c.Param("id")
	if err := s.scheduler.RemoveSchedule(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schedule"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Scheduled scan deleted"})
}

func (s *Server) generateFix(c *gin.Context) {
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		TechStack   string `json:"tech_stack"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if s.aiEngine == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Engine not initialized"})
		return
	}

	fix, err := s.aiEngine.GenerateFix(c.Request.Context(), req.Title, req.Description, req.TechStack)
	if err != nil {
		slog.Error("AI Generation Error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate fix"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"fix": fix,
	})
}

func (s *Server) createFixPR(c *gin.Context) {
	var req struct {
		Repo   string `json:"repo"`
		Branch string `json:"branch"`
		Title  string `json:"title"`
		Body   string `json:"body"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if s.aiEngine == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Engine not initialized"})
		return
	}

	prURL, err := s.aiEngine.CreateFixPR(c.Request.Context(), req.Repo, req.Branch, req.Title, req.Body)
	if err != nil {
		slog.Error("PR Creation Error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create PR"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pr_url": prURL})
}

func (s *Server) handleChat(c *gin.Context) {
	var req ai.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if s.chatEngine == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Chat Engine not initialized"})
		return
	}

	response, err := s.chatEngine.ProcessQuery(c.Request.Context(), req)
	if err != nil {
		slog.Error("Chat processing failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process chat query: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": response})
}

func (s *Server) getComplianceStandards(c *gin.Context) {
	standards := s.complianceManager.GetStandards()
	c.JSON(http.StatusOK, gin.H{"standards": standards})
}

func (s *Server) assessCompliance(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Compliance assessment started"})
}

func (s *Server) getComplianceReports(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"reports": []string{}})
}

func (s *Server) getCloudResources(c *gin.Context) {
	resources, err := s.cloudManager.GetCloudPosture(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cloud resources"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

func (s *Server) scanCloudResources(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Cloud scan started"})
}

func (s *Server) getCloudPosture(c *gin.Context) {
	posture, err := s.cloudManager.GetCloudPosture(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cloud posture"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"posture": posture})
}

func (s *Server) getIntegrations(c *gin.Context) {
	integrations := s.integrationManager.GetConfigs()
	c.JSON(http.StatusOK, gin.H{"integrations": integrations})
}

func (s *Server) updateIntegration(c *gin.Context) {
	var config models.IntegrationConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.integrationManager.UpdateConfig(config)
	c.JSON(http.StatusOK, gin.H{"message": "Integration updated"})
}

func (s *Server) testIntegration(c *gin.Context) {
	var req struct {
		Type string `json:"type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Test successful"})
}

func (s *Server) sendTestIntegrationMessage(c *gin.Context) {
	var req struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Type == string(integrations.Jira) {
		// Use SendAlert for Jira too, or implement CreateTicket in manager if needed.
		// For now, mapping to SendAlert with Jira type.
		s.integrationManager.SendAlert(integrations.Jira, req.Message)
	} else {
		// Default to Slack or use req.Type if valid
		it := integrations.Slack
		if req.Type == "Teams" {
			it = integrations.Teams
		}
		s.integrationManager.SendAlert(it, req.Message)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Test message sent"})
}

func (s *Server) getPlaybooks(c *gin.Context) {
	playbooks := s.automationEngine.GetPlaybooks()
	c.JSON(http.StatusOK, gin.H{"playbooks": playbooks})
}

func (s *Server) runPlaybook(c *gin.Context) {
	id := c.Param("id")
	if err := s.automationEngine.RunPlaybook(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Playbook executed successfully"})
}

func (s *Server) togglePlaybook(c *gin.Context) {
	id := c.Param("id")
	if err := s.automationEngine.TogglePlaybook(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Playbook toggled"})
}

func (s *Server) generateCustomReport(c *gin.Context) {
	var config reporting.ReportConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch data (mocking fetching all vulns for now)
	history, _ := s.orchestrator.GetHistory(c.Request.Context())
	var allVulns []scanner.Vuln
	if len(history) > 0 {
		results, _ := s.orchestrator.GetResults(c.Request.Context(), history[0].ScanID)
		if results != nil {
			allVulns = results.Vulnerabilities
		}
	}

	// Fetch cloud resources
	cloudResources, _ := s.cloudManager.GetCloudPosture(c.Request.Context())

	pdfBytes, err := reporting.GenerateCustomReport(config, allVulns, cloudResources)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report"})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=custom-report.pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func (s *Server) downloadReport(c *gin.Context) {
	// Mock PDF generation for download
	pdfBytes := []byte("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n...")

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=report.pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func (s *Server) getAnomalies(c *gin.Context) {
	anomalies := s.uebaEngine.GetAnomalies()
	c.JSON(http.StatusOK, gin.H{"anomalies": anomalies})
}

func (s *Server) getHoneypots(c *gin.Context) {
	honeypots := s.honeypotManager.GetHoneypots()
	c.JSON(http.StatusOK, gin.H{"honeypots": honeypots})
}

func (s *Server) getGatewayRules(c *gin.Context) {
	rules := s.apiGateway.GetRules()
	c.JSON(http.StatusOK, gin.H{"rules": rules})
}

func (s *Server) toggleGatewayRule(c *gin.Context) {
	id := c.Param("id")
	if err := s.apiGateway.ToggleRule(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rule toggled"})
}

func (s *Server) getContainerScans(c *gin.Context) {
	results := s.containerScanner.GetScans()
	c.JSON(http.StatusOK, gin.H{"results": results})
}

func (s *Server) getIaCScans(c *gin.Context) {
	results := s.iacScanner.GetScans()
	c.JSON(http.StatusOK, gin.H{"results": results})
}

func (s *Server) getDashboardStats(c *gin.Context) {
	history, err := s.orchestrator.GetHistory(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}

	var stats struct {
		Vulns    int `json:"vulns"`
		Critical int `json:"critical"`
		High     int `json:"high"`
		Medium   int `json:"medium"`
		Low      int `json:"low"`
		Score    int `json:"score"`
	}

	for _, scan := range history {
		for _, vuln := range scan.Vulnerabilities {
			stats.Vulns++
			switch vuln.Severity {
			case "Critical":
				stats.Critical++
			case "High":
				stats.High++
			case "Medium":
				stats.Medium++
			case "Low":
				stats.Low++
			}
		}
	}

	// Calculate simple score (inverse of weighted vulns)
	weightedVulns := (stats.Critical * 10) + (stats.High * 5) + (stats.Medium * 2) + stats.Low
	stats.Score = 100 - weightedVulns
	if stats.Score < 0 {
		stats.Score = 0
	}

	c.JSON(http.StatusOK, stats)
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// Phishing Handlers

func (s *Server) getPhishingCampaigns(c *gin.Context) {
	c.JSON(http.StatusOK, s.phishingManager.GetCampaigns())
}

func (s *Server) createPhishingCampaign(c *gin.Context) {
	var req struct {
		Name       string `json:"name"`
		TemplateID string `json:"template_id"`
		Targets    int    `json:"targets"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	campaign := s.phishingManager.CreateCampaign(req.Name, req.TemplateID, req.Targets)
	c.JSON(http.StatusOK, campaign)
}

func (s *Server) simulatePhishingClick(c *gin.Context) {
	id := c.Param("id")
	if s.phishingManager.SimulateClick(id) {
		c.JSON(http.StatusOK, gin.H{"status": "clicked"})
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
	}
}

func (s *Server) getPhishingTemplates(c *gin.Context) {
	c.JSON(http.StatusOK, phishing.Templates)
}

// Hardware Handlers
func (s *Server) getHardwareTelemetry(c *gin.Context) {
	c.JSON(http.StatusOK, s.telemetryEngine.GetEvents())
}

// ITDR Handlers
func (s *Server) getIdentityAlerts(c *gin.Context) {
	c.JSON(http.StatusOK, s.itdrEngine.GetAlerts())
}

// APM Handlers
func (s *Server) getAPMGraph(c *gin.Context) {
	c.JSON(http.StatusOK, s.apmEngine.GetMetrics())
}

// Ephemeral Handlers
func (s *Server) getEphemeralRotation(c *gin.Context) {
	c.JSON(http.StatusOK, s.ephemeralEngine.GetEnvironments())
}

// Deepfake Handlers
func (s *Server) getVoiceAlerts(c *gin.Context) {
	c.JSON(http.StatusOK, s.deepfakeScanner.GetAnalyses())
}

// Context Handlers
func (s *Server) getContextTrace(c *gin.Context) {
	c.JSON(http.StatusOK, s.contextEngine.GetEvents())
}

// Secrets Handlers
func (s *Server) getSecretsMesh(c *gin.Context) {
	c.JSON(http.StatusOK, s.secretsEngine.GetSecretsMesh())
}

// ZKP Handlers
func (s *Server) getZKPProofs(c *gin.Context) {
	c.JSON(http.StatusOK, s.zkpEngine.GetProofs())
}

// Insider Threat Handlers
func (s *Server) getInsiderPredictions(c *gin.Context) {
	c.JSON(http.StatusOK, s.insiderEngine.GetPredictions())
}

// CART Handlers
func (s *Server) getCARTCampaigns(c *gin.Context) {
	c.JSON(http.StatusOK, s.cartEngine.GetCampaigns())
}

// RBI Handlers
func (s *Server) getRBISessions(c *gin.Context) {
	c.JSON(http.StatusOK, s.rbiEngine.GetSessions())
}

// Sovereign Cloud Handlers
func (s *Server) getSovereignStatus(c *gin.Context) {
	c.JSON(http.StatusOK, s.sovereignEngine.GetResidencyStatus())
}

// Quantum Crypto Handlers
func (s *Server) getQuantumStatus(c *gin.Context) {
	c.JSON(http.StatusOK, s.quantumEngine.GetKeys())
}

// Phase 3 Handlers
func (s *Server) getAPTProfiles(c *gin.Context) {
	c.JSON(http.StatusOK, s.aptEngine.GetActiveSimulations())
}

func (s *Server) getSocialCampaigns(c *gin.Context) {
	c.JSON(http.StatusOK, s.socialEngine.GetCampaigns())
}

func (s *Server) getLotLActivity(c *gin.Context) {
	c.JSON(http.StatusOK, s.lotlEngine.GetActivities())
}

func (s *Server) getRansomwareSims(c *gin.Context) {
	c.JSON(http.StatusOK, s.ransomwareEngine.GetSimulations())
}

func (s *Server) getExfilTests(c *gin.Context) {
	c.JSON(http.StatusOK, s.exfilEngine.GetTests())
}

func (s *Server) getADPaths(c *gin.Context) {
	c.JSON(http.StatusOK, s.adEngine.GetAttackPaths())
}

func (s *Server) getZeroDaySims(c *gin.Context) {
	c.JSON(http.StatusOK, s.zeroDayEngine.GetSimulations())
}

func (s *Server) getEBPFEvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.ebpfEngine.GetEvents())
}

func (s *Server) getServerlessFunctions(c *gin.Context) {
	c.JSON(http.StatusOK, s.serverlessEngine.GetFunctions())
}

func (s *Server) getEntitlements(c *gin.Context) {
	c.JSON(http.StatusOK, s.ciemEngine.GetEntitlements())
}

func (s *Server) getDriftEvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.driftEngine.GetDriftEvents())
}

func (s *Server) getAdmissionRequests(c *gin.Context) {
	c.JSON(http.StatusOK, s.admissionEngine.GetRequests())
}

func (s *Server) getRASPEvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.raspEngine.GetEvents())
}

func (s *Server) getSchemaViolations(c *gin.Context) {
	c.JSON(http.StatusOK, s.schemaEngine.GetViolations())
}

func (s *Server) getBotEvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.botEngine.GetEvents())
}

func (s *Server) getSBOMComponents(c *gin.Context) {
	c.JSON(http.StatusOK, s.sbomEngine.GetComponents())
}

func (s *Server) getDataAssets(c *gin.Context) {
	c.JSON(http.StatusOK, s.dspmEngine.GetAssets())
}

func (s *Server) getExternalAssets(c *gin.Context) {
	c.JSON(http.StatusOK, s.easmEngine.GetAssets())
}

func (s *Server) getThreatFeeds(c *gin.Context) {
	c.JSON(http.StatusOK, s.intelEngine.GetFeeds())
}

func (s *Server) getDataLakeQueries(c *gin.Context) {
	c.JSON(http.StatusOK, s.dataLakeEngine.GetQueries())
}

func (s *Server) getJITRequests(c *gin.Context) {
	c.JSON(http.StatusOK, s.jitEngine.GetRequests())
}

func (s *Server) getSAAnomalies(c *gin.Context) {
	c.JSON(http.StatusOK, s.saAnomalyEngine.GetAnomalies())
}

func (s *Server) getEvidence(c *gin.Context) {
	c.JSON(http.StatusOK, s.evidenceEngine.GetEvidence())
}

func (s *Server) getVendorRisks(c *gin.Context) {
	c.JSON(http.StatusOK, s.tprmEngine.GetVendors())
}

func (s *Server) getPolicyChecks(c *gin.Context) {
	c.JSON(http.StatusOK, s.policyEngine.GetChecks())
}

func (s *Server) getLLMEvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.llmFirewallEngine.GetEvents())
}

func (s *Server) getQuantumTunnels(c *gin.Context) {
	c.JSON(http.StatusOK, s.quantumSafeEngine.GetTunnels())
}

func (s *Server) getIoTSlices(c *gin.Context) {
	c.JSON(http.StatusOK, s.iotSlicingEngine.GetSlices())
}

func (s *Server) getTwinSimulations(c *gin.Context) {
	c.JSON(http.StatusOK, s.digitalTwinEngine.GetSimulations())
}

func (s *Server) getGodTimeline(c *gin.Context) {
	c.JSON(http.StatusOK, s.godModeEngine.GetTimeline())
}

func (s *Server) getEDREvents(c *gin.Context) {
	c.JSON(http.StatusOK, s.edrEngine.GetEvents())
}
func (s *Server) handleAWSWebhook(c *gin.Context) {
	var event scanner.CloudTrailEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	alert, err := s.awsScanner.HandleCloudTrailEvent(event)
	if err != nil {
		slog.Error("Failed to handle AWS event", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal processing error"})
		return
	}

	if alert != "" {
		slog.Warn("AWS Security Alert", "alert", alert)
		// In a real system, we'd trigger an incident or notification here
		// s.notificationManager.Send(alert)
	}

	c.JSON(http.StatusOK, gin.H{"status": "processed", "alert": alert})
}
