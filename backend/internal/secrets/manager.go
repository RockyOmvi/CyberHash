package secrets

import (
	"fmt"
	"os"
)

// Manager defines the interface for retrieving secrets.
type Manager interface {
	GetSecret(key string) (string, error)
}

// EnvManager implements Manager using environment variables.
type EnvManager struct{}

// NewEnvManager creates a new EnvManager.
func NewEnvManager() *EnvManager {
	return &EnvManager{}
}

// GetSecret retrieves a secret from the environment.
// It returns an error if the secret is not found (optional, depending on strictness).
// For now, we'll return an empty string and no error if missing, to match os.Getenv behavior,
// but we could enforce strictness here.
func (m *EnvManager) GetSecret(key string) (string, error) {
	val := os.Getenv(key)
	if val == "" {
		return "", fmt.Errorf("secret %s not found", key)
	}
	return val, nil
}

// GetSecretWithFallback retrieves a secret or returns a fallback value.
func (m *EnvManager) GetSecretWithFallback(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
