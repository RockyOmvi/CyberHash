import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Bot, AlertTriangle, Activity, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface SAAnomaly {
    id: string;
    service_account: string;
    anomaly_type: string;
    description: string;
    severity: string;
    status: string;
    detected_at: string;
}

export function SAAnomalyPage() {
    const [anomalies, setAnomalies] = useState<SAAnomaly[]>([]);

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                const data = await api.getSAAnomalies();
                setAnomalies(data || []);
            } catch (error) {
                console.error("Failed to fetch SA anomalies:", error);
            }
        };
        fetchAnomalies();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bot className="text-red-500" />
                Service Account Anomaly Detection
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Critical Anomalies</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {anomalies.filter(a => a.severity === 'Critical').length}
                                </p>
                            </div>
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {anomalies.map(a => (
                    <Card key={a.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Bot size={18} className="text-red-400" />
                                {a.service_account}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${a.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                {a.severity}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                        <Activity size={14} className="text-yellow-400" /> {a.anomaly_type}
                                    </span>
                                    <span className="text-xs text-gray-500">Status: {a.status}</span>
                                </div>

                                <p className="text-sm text-gray-300 bg-white/5 p-2 rounded border border-white/5">
                                    {a.description}
                                </p>

                                <div className="text-xs text-gray-500 text-right">
                                    Detected: {new Date(a.detected_at).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
