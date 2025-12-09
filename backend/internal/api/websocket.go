package api

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}

type LogMessage struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Message   string `json:"message"`
}

type WebSocketManager struct {
	clients   map[*websocket.Conn]bool
	broadcast chan LogMessage
	mutex     sync.Mutex
}

func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan LogMessage),
	}
}

func (m *WebSocketManager) HandleConnections(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	m.mutex.Lock()
	m.clients[ws] = true
	m.mutex.Unlock()

	for {
		// Keep connection alive, read (and ignore) messages
		var msg map[string]interface{}
		err := ws.ReadJSON(&msg)
		if err != nil {
			m.mutex.Lock()
			delete(m.clients, ws)
			m.mutex.Unlock()
			break
		}
	}
}

func (m *WebSocketManager) HandleMessages() {
	for {
		msg := <-m.broadcast
		m.mutex.Lock()
		for client := range m.clients {
			err := client.WriteJSON(msg)
			if err != nil {
				client.Close()
				delete(m.clients, client)
			}
		}
		m.mutex.Unlock()
	}
}

func (m *WebSocketManager) BroadcastLog(level, message string) {
	msg := LogMessage{
		Timestamp: "Now", // In real app, use time.Now().Format(...)
		Level:     level,
		Message:   message,
	}
	m.broadcast <- msg
}
