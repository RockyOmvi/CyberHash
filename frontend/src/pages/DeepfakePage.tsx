import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Mic, PhoneOff, UserX, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface VoiceAlert {
    id: string;
    timestamp: string;
    caller_id: string;
    platform: string;
    confidence: number;
    status: string;
}

export function DeepfakePage() {
    const [alerts, setAlerts] = useState<VoiceAlert[]>([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await api.getVoiceAlerts();
                setAlerts(data || []);
            } catch (error) {
                console.error("Failed to fetch voice alerts:", error);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mic className="text-pink-500" />
                Voice & Deepfake Phishing Detection
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-pink-900/20 border-pink-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Deepfakes Detected</p>
                                <p className="text-2xl font-bold text-pink-500">{alerts.length}</p>
                            </div>
                            <UserX className="text-pink-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Calls Monitored</p>
                                <p className="text-2xl font-bold text-white">842</p>
                            </div>
                            <ShieldCheck className="text-green-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Real-Time Voice Analysis Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Time</th>
                                    <th className="px-4 py-3">Caller ID</th>
                                    <th className="px-4 py-3">Platform</th>
                                    <th className="px-4 py-3">AI Confidence</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {alerts.map(a => (
                                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">{new Date(a.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-white">{a.caller_id}</td>
                                        <td className="px-4 py-3">{a.platform}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${a.confidence > 0.9 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${a.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{(a.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'Blocked' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
