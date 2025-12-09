export interface ScanResult {
    scan_id: string;
    target: string;
    status: string;
    vulnerabilities?: Vulnerability[];
    results?: { // For backward compatibility if needed, but backend sends flat structure now
        vulnerabilities: Vulnerability[];
    };
}

export interface Vulnerability {
    title: string;
    description: string;
    severity: string;
    solution: string;
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
    }
};
