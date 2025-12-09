export interface ScanResult {
    scan_id: string;
    status: string;
    progress: number;
    results?: {
        vulnerabilities: Vulnerability[];
    };
}

export interface Vulnerability {
    title: string;
    description: string;
    severity: string;
    solution: string;
}

export const api = {
    startScan: async (target: string) => {
        const response = await fetch('/api/v1/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target }),
        });
        if (!response.ok) throw new Error('Failed to start scan');
        return response.json();
    },

    getScanStatus: async (id: string) => {
        const response = await fetch(`/api/v1/scans/${id}`);
        if (!response.ok) throw new Error('Failed to get status');
        return response.json();
    },

    remediate: async (title: string, description: string, techStack: string) => {
        const response = await fetch('/api/v1/remediate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, tech_stack: techStack }),
        });
        if (!response.ok) throw new Error('Failed to generate remediation');
        return response.json();
    },
};
