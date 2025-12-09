# CyberShield AI

## Prerequisites

1.  **Node.js** (v18+)
2.  **Go** (v1.21+) - [Download Here](https://go.dev/dl/)
3.  **Docker** (Optional, for containerization)
4.  **Terraform** (Optional, for infrastructure)

## Setup

### 1. Backend (Go)

```bash
cd backend
# Install dependencies
go mod tidy
# Run the server
go run main.go
```

The API will start at `http://localhost:8080`.

### 2. Frontend (React)

```bash
cd frontend
# Install dependencies
npm install
# Start the dev server
npm run dev
```

The Dashboard will open at `http://localhost:5173`.

## Architecture

-   **Backend**: Gin (Go) + ZAP Scanner Wrapper
-   **Frontend**: React + TypeScript + Vite
-   **Infrastructure**: AWS EKS + RDS (Terraform)
