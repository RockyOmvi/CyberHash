import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { GitBranch, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface DriftEvent {
    id: string;
    resource: string;
    expected: string;
    actual: string;
    drifted_by: string;
    status: string;
    detected_at: string;
}

export function DriftPage() {
    const [events, setEvents] = useState<DriftEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getDriftEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch drift events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <GitBranch className="text-orange-400" />
                Terraform/IaC Drift Detection
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-900/20 border-orange-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Open Drifts</p>
                                <p className="text-2xl font-bold text-orange-500">
                                    {events.filter(e => e.status === 'Open').length}
                                </p>
                            </div>
                            <AlertTriangle className="text-orange-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <RefreshCw size={18} className="text-orange-400" />
                                {e.resource}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.status === 'Remediated' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {e.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-green-900/10 border border-green-500/20 rounded">
                                    <p className="text-xs text-green-400 uppercase font-bold mb-1">Expected State (IaC)</p>
                                    <code className="text-sm text-green-300 font-mono">{e.expected}</code>
                                </div>
                                <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                                    <p className="text-xs text-red-400 uppercase font-bold mb-1">Actual State (Live)</p>
                                    <code className="text-sm text-red-300 font-mono">{e.actual}</code>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Caused By: <span className="text-white">{e.drifted_by}</span></span>
                                <span>Detected: {new Date(e.detected_at).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
