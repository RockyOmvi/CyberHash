package identity

import (
	"fmt"
	"time"

	"github.com/cybershield-ai/core/internal/models"
	"gorm.io/gorm"
)

type ZKPProof struct {
	ID        string    `json:"id"`
	Prover    string    `json:"prover"`   // User-123
	Verifier  string    `json:"verifier"` // Auth-Service
	Proof     string    `json:"proof"`    // zk-SNARK-xyz
	Status    string    `json:"status"`   // Verified
	Timestamp time.Time `json:"timestamp"`
}

type ZKPEngine struct {
	db *gorm.DB
}

func NewZKPEngine(db *gorm.DB) *ZKPEngine {
	return &ZKPEngine{db: db}
}

func (e *ZKPEngine) GetProofs() []ZKPProof {
	var events []models.SimulationEvent
	e.db.Where("engine = ?", "ZKP").Order("timestamp desc").Limit(10).Find(&events)

	var proofs []ZKPProof
	for _, ev := range events {
		proofs = append(proofs, ZKPProof{
			ID:        fmt.Sprintf("zkp-%d", ev.ID),
			Prover:    ev.Source,
			Verifier:  ev.Target,
			Proof:     ev.Details,
			Status:    ev.Status,
			Timestamp: ev.Timestamp,
		})
	}

	if len(proofs) == 0 {
		return []ZKPProof{{ID: "pending", Prover: "Pending", Verifier: "N/A", Proof: "Waiting...", Status: "Waiting", Timestamp: time.Now()}}
	}
	return proofs
}
