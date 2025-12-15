import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Terminal, Shield, AlertTriangle, Monitor } from 'lucide-react';
import { api } from '../services/api';

interface LotLActivity {
    id: string;
    tool: string;
    command: string;
    user: string;
    host: string;
    status: string;
    detected_at: string;
}

export function LotLPage() {
    const [activities, setActivities] = useState<LotLActivity[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await api.getLotLActivity();
                setActivities(data || []);
            } catch (error) {
                console.error("Failed to fetch LotL activity:", error);
            }
        };
        fetchActivity();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Terminal className="text-orange-400" />
                Living-off-the-Land (LotL) Simulation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-900/20 border-orange-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Executions</p>
                                <p className="text-2xl font-bold text-orange-500">
                                    {activities.filter(a => a.status === 'Blocked').length}
                                </p>
                            </div>
                            <Shield className="text-orange-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {activities.map(a => (
                    <Card key={a.id} className="border-white/10 bg-black/40">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-800 rounded-lg">
                                            <Terminal size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{a.tool} Abuse</h3>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Monitor size={12} /> {a.host} | User: {a.user}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {a.status}
                                    </span>
                                </div>

                                <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <span className="text-green-500">$</span> {a.command}
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Detected: {new Date(a.detected_at).toLocaleString()}</span>
                                    {a.status !== 'Blocked' && (
                                        <div className="flex items-center gap-1 text-red-400">
                                            <AlertTriangle size={12} />
                                            <span>Action Required</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
