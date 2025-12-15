import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, AlertTriangle, Activity, Server } from 'lucide-react';
import { api } from '../services/api';

interface RASPEvent {
    id: string;
    app: string;
    attack_type: string;
    payload: string;
    action: string;
    source_ip: string;
    timestamp: string;
}

export function RASPPage() {
    const [events, setEvents] = useState<RASPEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getRASPEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch RASP events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-green-500" />
                Runtime Application Self-Protection (RASP)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-900/20 border-green-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Attacks</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {events.filter(e => e.action === 'Blocked').length}
                                </p>
                            </div>
                            <Activity className="text-green-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Server size={18} className="text-green-400" />
                                {e.app}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.action === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {e.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-red-400 flex items-center gap-2">
                                        <AlertTriangle size={14} /> {e.attack_type}
                                    </span>
                                    <span className="text-xs text-gray-500">Source: {e.source_ip}</span>
                                </div>

                                <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <span className="text-red-500">payload:</span> {e.payload}
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    {new Date(e.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
