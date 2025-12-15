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

## Commercial Roadmap

We are actively developing 30+ advanced features to position CyberShield AI as a market leader:

1.  **AI-Powered Threat Hunting**: Conversational log analysis.
2.  **Compliance Mapping**: Automated ISO 27001/SOC 2 mapping.
3.  **Supply Chain Security**: SCA for `go.mod` and `package.json`.
4.  **Real-time 3D Visualization**: Interactive global threat map.
5.  **Post-Quantum Cryptography**: Future-proofing against quantum attacks.
6.  **Autonomous Defense Agents**: AI that fights back in real-time.
7.  **Blockchain Audit Logs**: Immutable forensic trails.
8.  **Hardware Telemetry**: Intel TDT/AMD PRO integration.
9.  **Moving Target Defense**: Ephemeral infrastructure rotation.
10. **Identity Threat Detection**: Deep integration with Okta/AD.

*See `enhancements_roadmap.md` for the full list of 30 features.*
