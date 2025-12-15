package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func (s *Server) getMonitorLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	logs, err := s.monitorStore.GetSecurityLogs(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

type BlockIPRequest struct {
	IP     string `json:"ip" binding:"required"`
	Reason string `json:"reason"`
}

func (s *Server) blockIP(c *gin.Context) {
	var req BlockIPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default block for 24 hours manually
	err := s.monitorStore.BlockIP(req.IP, req.Reason, "Admin", 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to block IP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "IP blocked successfully"})
}

func (s *Server) unblockIP(c *gin.Context) {
	ip := c.Param("ip")
	err := s.monitorStore.UnblockIP(ip)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unblock IP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "IP unblocked successfully"})
}

func (s *Server) getBlockedIPs(c *gin.Context) {
	ips, err := s.monitorStore.GetBlockedIPs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blocked IPs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"blocked_ips": ips})
}
