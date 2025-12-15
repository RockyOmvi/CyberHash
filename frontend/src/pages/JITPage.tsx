import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Key, Clock, UserCheck, Shield } from 'lucide-react';
import { api } from '../services/api';

interface JITRequest {
    id: string;
    user: string;
    role: string;
    reason: string;
    duration: string;
    status: string;
    approved_by: string;
    expires_at: string;
}

export function JITPage() {
    const [requests, setRequests] = useState<JITRequest[]>([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api.getJITRequests();
                setRequests(data || []);
            } catch (error) {
                console.error("Failed to fetch JIT requests:", error);
            }
        };
        fetchRequests();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Key className="text-yellow-400" />
                Just-in-Time (JIT) Access Provisioning
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-900/20 border-yellow-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Sessions</p>
                                <p className="text-2xl font-bold text-yellow-500">
                                    {requests.filter(r => r.status === 'Active').length}
                                </p>
                            </div>
                            <Clock className="text-yellow-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requests.map(r => (
                    <Card key={r.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <UserCheck size={18} className="text-yellow-400" />
                                {r.user} <span className="text-gray-500 text-sm">as {r.role}</span>
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {r.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Reason: <span className="text-white italic">"{r.reason}"</span></p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        Approved By: <span className="text-blue-400">{r.approved_by}</span>
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Duration: {r.duration}</p>
                                    <p className="text-xs text-gray-500">Expires: {new Date(r.expires_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
