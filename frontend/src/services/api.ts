export interface ScanResult {
    scan_id: string;
    target: string;
    status: string;
    vulnerabilities?: Vulnerability[];
    results?: { // For backward compatibility
        vulnerabilities: Vulnerability[];
    };
}

export interface Vulnerability {
    title: string;
    description: string;
    severity: string;
    category?: string;
    solution: string;
    compliance?: string[];
}

const API_BASE_URL = '/api/v1';
const AUTH_BASE_URL = '/auth';

const getHeaders = () => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    register: async (email: string, password: string, name: string) => {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    startScan: async (target: string) => {
        const response = await fetch(`${API_BASE_URL}/scans`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ target }),
        });
        if (!response.ok) throw new Error('Failed to start scan');
        return response.json();
    },

    getScanStatus: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/scans/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get status');
        return response.json();
    },

    remediate: async (title: string, description: string, techStack: string) => {
        const response = await fetch(`${API_BASE_URL}/remediate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, description, tech_stack: techStack }),
        });
        if (!response.ok) throw new Error('Remediation failed');
        return response.json();
    },

    getScanHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/scans`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        return response.json();
    },

    downloadReport: async (scanId: string) => {
        const response = await fetch(`${API_BASE_URL}/scans/${scanId}/report`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to download report');
        return response.blob();
    },

    createSchedule: async (target: string, frequency: string) => {
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ target, frequency }),
        });
        if (!response.ok) throw new Error('Failed to create schedule');
        return response.json();
    },

    getSchedules: async () => {
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get schedules');
        return response.json();
    },

    chat: async (message: string, history: { role: string; content: string }[]) => {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, history }),
        });
        if (!response.ok) throw new Error('Chat failed');
        return response.json();
    },
    getCloudPosture: async () => {
        const response = await fetch(`${API_BASE_URL}/cloud/posture`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch cloud posture');
        return response.json();
    },
    getIntegrations: async () => {
        const response = await fetch(`${API_BASE_URL}/integrations`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch integrations');
        return response.json();
    },
    updateIntegration: async (config: any) => {
        const response = await fetch(`${API_BASE_URL}/integrations`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to update integration');
        return response.json();
    },
    testIntegration: async (type: string, message: string) => {
        const response = await fetch(`${API_BASE_URL}/integrations/test`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ type, message }),
        });
        if (!response.ok) throw new Error('Failed to test integration');
        return response.json();
    },
    getPlaybooks: async () => {
        const response = await fetch(`${API_BASE_URL}/playbooks`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch playbooks');
        return response.json();
    },
    runPlaybook: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/playbooks/${id}/run`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to run playbook');
        return response.json();
    },
    togglePlaybook: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/playbooks/${id}/toggle`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to toggle playbook');
        return response.json();
    },
    generateReport: async (config: any) => {
        const response = await fetch(`${API_BASE_URL}/reports/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.blob();
    },
    getAnomalies: async () => {
        const response = await fetch(`${API_BASE_URL}/ueba/anomalies`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch anomalies');
        return response.json();
    },
    getHoneypots: async () => {
        const response = await fetch(`${API_BASE_URL}/honeypots`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch honeypots');
        return response.json();
    },
    getGatewayRules: async () => {
        const response = await fetch(`${API_BASE_URL}/gateway/rules`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch gateway rules');
        return response.json();
    },
    toggleGatewayRule: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/gateway/rules/${id}/toggle`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to toggle gateway rule');
        return response.json();
    },
    getContainerScans: async () => {
        const response = await fetch(`${API_BASE_URL}/containers/scan`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch container scans');
        return response.json();
    },
    getIaCScans: async () => {
        const response = await fetch(`${API_BASE_URL}/iac/scan`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch IaC scans');
        return response.json();
    },

    getDashboardStats: async () => {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    // Phishing
    getPhishingCampaigns: async () => {
        const response = await fetch(`${API_BASE_URL}/phishing/campaigns`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        return response.json();
    },

    createPhishingCampaign: async (name: string, template_id: string, targets: number) => {
        const response = await fetch(`${API_BASE_URL}/phishing/campaigns`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, template_id, targets }),
        });
        if (!response.ok) throw new Error('Failed to create campaign');
        return response.json();
    },

    getPhishingTemplates: async () => {
        const response = await fetch(`${API_BASE_URL}/phishing/templates`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json();
    },

    // Hardware Telemetry
    getHardwareTelemetry: async () => {
        const response = await fetch(`${API_BASE_URL}/hardware/telemetry`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch telemetry');
        return response.json();
    },

    // ITDR
    getIdentityAlerts: async () => {
        const response = await fetch(`${API_BASE_URL}/identity/alerts`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch identity alerts');
        return response.json();
    },

    // APM
    getAPMGraph: async () => {
        const response = await fetch(`${API_BASE_URL}/apm/graph`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch APM graph');
        return response.json();
    },

    // Ephemeral Infrastructure
    getEphemeralRotation: async () => {
        const response = await fetch(`${API_BASE_URL}/infrastructure/rotation`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch ephemeral rotation');
        return response.json();
    },

    // Deepfake Detection
    getVoiceAlerts: async () => {
        const response = await fetch(`${API_BASE_URL}/voice/alerts`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch voice alerts');
        return response.json();
    },

    // Code-to-Cloud Context
    getContextTrace: async () => {
        const response = await fetch(`${API_BASE_URL}/context/trace`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch context trace');
        return response.json();
    },

    // Secrets Mesh
    getSecretsMesh: async () => {
        const response = await fetch(`${API_BASE_URL}/secrets/mesh`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch secrets mesh');
        return response.json();
    },

    // ZKP Identity
    getZKPProofs: async () => {
        const response = await fetch(`${API_BASE_URL}/identity/zkp/verify`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch ZKP proofs');
        return response.json();
    },

    // Insider Threat
    getInsiderPredictions: async () => {
        const response = await fetch(`${API_BASE_URL}/ueba/predictions`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch insider predictions');
        return response.json();
    },

    // CART (Red Teaming)
    getCARTCampaigns: async () => {
        const response = await fetch(`${API_BASE_URL}/redteam/campaigns`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch CART campaigns');
        return response.json();
    },

    // RBI (Browser Isolation)
    getRBISessions: async () => {
        const response = await fetch(`${API_BASE_URL}/isolation/sessions`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch RBI sessions');
        return response.json();
    },

    // Sovereign Cloud
    getSovereignStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/compliance/sovereign`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch sovereign status');
        return response.json();
    },

    // Quantum Crypto
    getQuantumStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/crypto/quantum`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch quantum status');
        return response.json();
    },

    // Phase 3: Red Hat Security
    getAPTProfiles: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/apt`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch APT profiles');
        return response.json();
    },

    getSocialCampaigns: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/social`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch social campaigns');
        return response.json();
    },

    getLotLActivity: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/lotl`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch LotL activity');
        return response.json();
    },

    getRansomwareSims: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/ransomware`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch ransomware sims');
        return response.json();
    },

    getExfilTests: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/exfil`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch exfil tests');
        return response.json();
    },

    // Phase 3: Red Hat Security (Batch 2)
    getADPaths: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/ad`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch AD paths');
        return response.json();
    },

    getZeroDaySims: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/zeroday`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch zero-day sims');
        return response.json();
    },

    getEBPFEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/ebpf`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch eBPF events');
        return response.json();
    },

    getServerlessFunctions: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/serverless`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch serverless functions');
        return response.json();
    },

    getEntitlements: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/ciem`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch entitlements');
        return response.json();
    },

    // Phase 3: Red Hat Security (Batch 3)
    getDriftEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/drift`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch drift events');
        return response.json();
    },

    getAdmissionRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/admission`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch admission requests');
        return response.json();
    },

    getRASPEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/rasp`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch RASP events');
        return response.json();
    },

    getSchemaViolations: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/schema`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch schema violations');
        return response.json();
    },

    getBotEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/bot`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch bot events');
        return response.json();
    },

    // Phase 4: Red Hat Security (Part 2) - Batch 1
    getSBOMComponents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/sbom`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch SBOM components');
        return response.json();
    },

    getDataAssets: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/dspm`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch data assets');
        return response.json();
    },

    getExternalAssets: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/easm`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch external assets');
        return response.json();
    },

    getThreatFeeds: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/intel`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch threat feeds');
        return response.json();
    },

    getDataLakeQueries: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/datalake`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch data lake queries');
        return response.json();
    },

    // Phase 4: Red Hat Security (Part 2) - Batch 2
    getJITRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/jit`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch JIT requests');
        return response.json();
    },

    getSAAnomalies: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/sa-anomaly`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch SA anomalies');
        return response.json();
    },

    getEvidence: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/evidence`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch evidence');
        return response.json();
    },

    getVendorRisks: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/tprm`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch vendor risks');
        return response.json();
    },

    getPolicyChecks: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/policy`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch policy checks');
        return response.json();
    },

    // Phase 4: Red Hat Security (Part 2) - Batch 3
    getLLMEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/llm-firewall`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch LLM events');
        return response.json();
    },

    getQuantumTunnels: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/quantum`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch quantum tunnels');
        return response.json();
    },

    getIoTSlices: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/iot-slicing`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch IoT slices');
        return response.json();
    },

    getTwinSimulations: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/digital-twin`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch digital twin simulations');
        return response.json();
    },

    getGodTimeline: async () => {
        const response = await fetch(`${API_BASE_URL}/redhat/god-mode`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch God Mode timeline');
        return response.json();
    },
};
