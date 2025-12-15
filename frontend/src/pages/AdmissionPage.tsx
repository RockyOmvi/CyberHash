import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, AlertOctagon, Box, User } from 'lucide-react';
import { api } from '../services/api';

interface AdmissionRequest {
    id: string;
    pod_name: string;
    namespace: string;
    violation: string;
    action: string;
    user: string;
    timestamp: string;
}

export function AdmissionPage() {
    const [requests, setRequests] = useState<AdmissionRequest[]>([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api.getAdmissionRequests();
                setRequests(data || []);
            } catch (error) {
                console.error("Failed to fetch admission requests:", error);
            }
        };
        fetchRequests();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-blue-500" />
                Kubernetes Admission Controller
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Denied Pods</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {requests.filter(r => r.action === 'Denied').length}
                                </p>
                            </div>
                            <AlertOctagon className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requests.map(r => (
                    <Card key={r.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Box size={18} className="text-blue-400" />
                                {r.pod_name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${r.action === 'Allowed (Warning)' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {r.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Namespace: <span className="text-white font-mono">{r.namespace}</span></p>
                                    <p className="text-sm text-gray-400">Violation: <span className="text-red-400 font-bold">{r.violation}</span></p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                                    <User size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-300">
                                        User: <span className="font-bold text-white">{r.user}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 text-right">
                                {new Date(r.timestamp).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
