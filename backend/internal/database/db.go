package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/cybershield-ai/core/internal/models"
)

var DB *gorm.DB

func InitDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "admin"),
		getEnv("DB_PASSWORD", "password"),
		getEnv("DB_NAME", "cybershield"),
		getEnv("DB_PORT", "5432"),
	)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			Colorful:                  true,        // Disable color
		},
	)

	driver := getEnv("DB_DRIVER", "sqlite")
	var err error

	if driver == "postgres" {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: newLogger})
		if err != nil {
			return nil, fmt.Errorf("failed to connect to Postgres (DB_DRIVER=postgres): %w", err)
		}
	} else {
		// Default to SQLite for local dev if not explicitly set to postgres
		fmt.Println("Using SQLite (DB_DRIVER not set to postgres)")
		dbName := getEnv("DB_NAME", "cybershield.db")
		DB, err = gorm.Open(sqlite.Open(dbName), &gorm.Config{Logger: newLogger})
		if err != nil {
			return nil, fmt.Errorf("failed to connect to SQLite: %w", err)
		}
	}

	// Auto-migrate models
	err = DB.AutoMigrate(
		&models.Vulnerability{},
		&models.SBOMComponent{},
		&models.CloudResource{},
		&models.SimulationEvent{},
		&models.ComplianceStandard{},
		&models.PhishingTemplate{},
		&models.HoneypotNode{},
		&models.HardwareTelemetry{},
		&models.UserBehavior{},
		&models.GatewayRule{},
		&models.IntegrationConfig{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	return DB, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
