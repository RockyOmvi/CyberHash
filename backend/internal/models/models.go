package models

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Hash
	OrgID     string    `json:"org_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Organization struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	SubscriptionID string    `json:"subscription_id"` // Stripe Sub ID
	Plan           string    `json:"plan"`            // Free, Pro, Enterprise
	CreatedAt      time.Time `json:"created_at"`
}

type Project struct {
	ID        string    `json:"id"`
	OrgID     string    `json:"org_id"`
	Name      string    `json:"name"`
	TargetURL string    `json:"target_url"`
	CreatedAt time.Time `json:"created_at"`
}
