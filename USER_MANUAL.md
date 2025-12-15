# CyberHash: The Unified Security Operating System
**User Manual & Administrator Guide (Beta v1.0)**

---

## 1. Introduction
**CyberHash** is a next-generation security platform that unifies **Cloud Security (CSPM)**, **Endpoint Detection (EDR)**, **Application Security (ASPM)**, and **AI Remediation** into a single "Operating System" for your security posture.

Unlike traditional tools that just *alert* you, CyberHash **acts**. It uses AI to fix code vulnerabilities and active agents to terminate malicious processes in real-time.

---

## 2. Getting Started

### Option A: Docker Deployment (Recommended)
The easiest way to run CyberHash is using the pre-configured Docker setup. This spins up the Backend, Frontend, and PostgreSQL database.

**Prerequisites:**
*   Docker & Docker Compose installed.
*   A Google Gemini API Key (for AI features).

**Steps:**
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-org/cyberhash.git
    cd cyberhash
    ```
2.  **Configure Environment:**
    Create a `.env` file in the root directory (or edit `docker-compose.yml` directly):
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    JWT_SECRET=your_secure_random_string
    ```
3.  **Launch:**
    ```bash
    docker-compose up --build -d
    ```
4.  **Access:**
    *   **Dashboard:** `http://localhost:5173`
    *   **API:** `http://localhost:8080`

### Option B: Local Development (Manual)
If you want to modify the code, run the services individually.

**Backend:**
```bash
cd backend
export GEMINI_API_KEY="your_key"
go mod tidy
go run main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Core Features & How to Use Them

### 🛡️ Endpoint Detection & Response (EDR)
**How it works:**
The backend runs an active monitor on the host server (where the backend is running). It scans the process list every 30 seconds.

**Active Enforcement:**
*   **Detection:** It looks for known malicious tools (e.g., `ncat.exe`, `mimikatz.exe`, `nc.exe`).
*   **Action:** If found, it **automatically kills the process**.
*   **Verification:** Open a terminal and try to run `ncat.exe`. You will see it terminate immediately, and an alert will appear in the "Red Hat > EDR" dashboard.

### ☁️ Cloud Security (CSPM)
**How it works:**
Connects to your AWS account to scan for misconfigurations (e.g., Public S3 Buckets).

**Setup:**
1.  Ensure you have AWS credentials configured on the host (`~/.aws/credentials` or env vars `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
2.  Navigate to **Cloud Posture** in the dashboard.
3.  Click **"Scan Now"**.
4.  The system will list all S3 buckets and flag those with public access.

### 🤖 AI Remediation
**How it works:**
CyberHash uses Google Gemini to analyze vulnerabilities and generate code fixes.

**Usage:**
1.  Go to the **Vulnerabilities** page.
2.  Click on a High/Critical vulnerability.
3.  Click the **"Generate Fix"** button.
4.  The AI will analyze the issue and provide a copy-pasteable code snippet to resolve it.

### 🕵️ Code Security (SCA & IaC)
**How it works:**
Integrates with **Trivy** to scan your codebase for:
*   **SCA:** Vulnerable dependencies in `go.mod`, `package.json`.
*   **IaC:** Misconfigurations in Terraform/Kubernetes files.
*   **Secrets:** Hardcoded keys or passwords.

---

## 4. Configuration Reference

| Environment Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend API Port | `8080` |
| `DB_DRIVER` | Database Driver (`sqlite` or `postgres`) | `sqlite` |
| `DB_HOST` | Database Host (for Postgres) | `localhost` |
| `GEMINI_API_KEY` | **Required** for AI features | - |
| `JWT_SECRET` | Secret for signing auth tokens | `super-secret-key` |
| `AWS_REGION` | AWS Region for Cloud Scanning | `us-east-1` |

---

## 5. Troubleshooting

**"AI Engine not initialized"**
*   **Cause:** `GEMINI_API_KEY` is missing or invalid.
*   **Fix:** Check your `.env` file or docker-compose environment variables.

**"Failed to connect to database"**
*   **Cause:** Postgres container is not ready yet.
*   **Fix:** The backend will auto-retry. If it fails permanently, check `docker-compose logs db`.

**"EDR not killing processes"**
*   **Cause:** The backend might lack permissions to kill system processes.
*   **Fix:** Run the backend/docker container with appropriate privileges (e.g., Administrator on Windows or `sudo` on Linux).

---

**CyberHash Beta v1.0** - *Secure Everything. Trust Nothing.*
