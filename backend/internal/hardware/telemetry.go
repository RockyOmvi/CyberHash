package hardware

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"gorm.io/gorm"
)

type TelemetryEngine struct {
	db *gorm.DB
}

func NewTelemetryEngine(db *gorm.DB) *TelemetryEngine {
	e := &TelemetryEngine{db: db}
	e.StartRealMonitoring()
	return e
}

func (e *TelemetryEngine) StartRealMonitoring() {
	go func() {
		for {
			// 1. Get Real CPU Usage
			cpuPercent, err := cpu.Percent(0, false)
			cpuVal := 0.0
			if err == nil && len(cpuPercent) > 0 {
				cpuVal = cpuPercent[0]
			}

			// 2. Get Real Memory Usage
			vMem, err := mem.VirtualMemory()
			memVal := 0.0
			if err == nil {
				memVal = vMem.UsedPercent
			}

			// 3. Determine Status
			status := "Healthy"
			if cpuVal > 90 || memVal > 90 {
				status = "Critical Load"
			} else if cpuVal > 70 || memVal > 70 {
				status = "High Load"
			}

			// 4. Persist to DB
			telemetry := models.HardwareTelemetry{
				DeviceID:    "HOST-SERVER-01",
				CPUUsage:    cpuVal,
				MemoryUsage: memVal,
				Temperature: 45.5, // Temp is hard to get cross-platform without admin, keeping mock
				Status:      status,
				Timestamp:   time.Now(),
			}

			if err := e.db.Create(&telemetry).Error; err != nil {
				fmt.Printf("Failed to save real telemetry: %v\n", err)
			}

			time.Sleep(5 * time.Second)
		}
	}()
}

func (e *TelemetryEngine) GetEvents() []models.HardwareTelemetry {
	var events []models.HardwareTelemetry
	e.db.Order("timestamp desc").Limit(20).Find(&events)
	return events
}
