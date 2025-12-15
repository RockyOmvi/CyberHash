import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/monitor';

// Add auth token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface SecurityLog {
    id: number;
    created_at: string;
    ip_address: string;
    method: string;
    path: string;
    payload: string;
    risk_score: number;
    attack_type: string;
    status: string;
}

export interface BlockedIP {
    id: number;
    created_at: string;
    ip_address: string;
    reason: string;
    blocked_by: string;
    expires_at: string | null;
}

export const getMonitorLogs = async (limit: number = 50) => {
    const response = await axios.get(`${API_URL}/logs?limit=${limit}`, {
        headers: getAuthHeader(),
    });
    return response.data.logs as SecurityLog[];
};

export const getBlockedIPs = async () => {
    const response = await axios.get(`${API_URL}/blocked`, {
        headers: getAuthHeader(),
    });
    return response.data.blocked_ips as BlockedIP[];
};

export const blockIP = async (ip: string, reason: string) => {
    const response = await axios.post(
        `${API_URL}/block`,
        { ip, reason },
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const unblockIP = async (ip: string) => {
    const response = await axios.delete(`${API_URL}/block/${ip}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};
