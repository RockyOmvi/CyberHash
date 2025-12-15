package ai

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"gorm.io/gorm"
)

// ChatRequest represents a user query
type ChatRequest struct {
	Message string        `json:"message"`
	History []ChatMessage `json:"history"`
}

type ChatMessage struct {
	Role    string `json:"role"` // "user" or "model"
	Content string `json:"content"`
}

// ChatResponse represents the AI's answer
type ChatResponse struct {
	Response string `json:"response"`
}

// ChatEngine handles the conversational logic
type ChatEngine struct {
	model *genai.GenerativeModel
	db    *gorm.DB
}

func NewChatEngine(client *genai.Client, db *gorm.DB) *ChatEngine {
	model := client.GenerativeModel("gemini-1.5-flash")
	return &ChatEngine{
		model: model,
		db:    db,
	}
}

// Local struct to avoid import cycle with scanner package
type VulnContext struct {
	Title       string
	Description string
	Severity    string
}

// TableName overrides the table name to match the existing schema
func (VulnContext) TableName() string {
	return "vulns"
}

func (e *ChatEngine) ProcessQuery(ctx context.Context, req ChatRequest) (string, error) {
	// 1. Gather Context from DB (RAG-lite)
	var recentVulns []VulnContext
	// We use the local struct which maps to the 'vulns' table
	e.db.Where("severity IN ?", []string{"Critical", "High"}).Order("id desc").Limit(5).Find(&recentVulns)

	contextStr := "Current System Context:\n"
	if len(recentVulns) > 0 {
		contextStr += "Recent High Severity Vulnerabilities:\n"
		for _, v := range recentVulns {
			contextStr += fmt.Sprintf("- [%s] %s: %s\n", v.Severity, v.Title, v.Description)
		}
	} else {
		contextStr += "No recent critical vulnerabilities found.\n"
	}

	// 2. Construct Chat Session
	cs := e.model.StartChat()

	// Set History
	var history []*genai.Content

	// System Prompt as first history item
	systemPrompt := `You are CyberShield AI, an elite security operations assistant. 
Your goal is to help security analysts identify threats, understand vulnerabilities, and suggest remediations.
Use the provided system context to answer questions about the current security posture.
If the user asks about something not in the context, answer based on your general cybersecurity knowledge.
Be concise, professional, and actionable.`

	// Add system prompt + context as the first "turned" message
	history = append(history, &genai.Content{
		Parts: []genai.Part{genai.Text(systemPrompt + "\n\n" + contextStr)},
		Role:  "user",
	})
	history = append(history, &genai.Content{
		Parts: []genai.Part{genai.Text("Understood. I am ready to assist.")},
		Role:  "model",
	})

	for _, msg := range req.History {
		role := "user"
		if msg.Role == "model" || msg.Role == "assistant" {
			role = "model"
		}
		history = append(history, &genai.Content{
			Parts: []genai.Part{genai.Text(msg.Content)},
			Role:  role,
		})
	}

	cs.History = history

	// 3. Generate Response
	resp, err := cs.SendMessage(ctx, genai.Text(req.Message))
	if err != nil {
		return "", fmt.Errorf("gemini error: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from AI")
	}

	var sb strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			sb.WriteString(string(txt))
		}
	}

	return sb.String(), nil
}
