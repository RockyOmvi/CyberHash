import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldAlert, Crosshair, Activity, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface APTProfile {
    id: string;
    name: string;
    description: string;
    ttps: string[];
    status: string;
    last_seen: string;
}

export function APTPage() {
    const [profiles, setProfiles] = useState<APTProfile[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const data = await api.getAPTProfiles();
                setProfiles(data || []);
            } catch (error) {
                console.error("Failed to fetch APT profiles:", error);
            }
        };
        fetchProfiles();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-red-500" />
                Automated APT Simulation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Simulations</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {profiles.filter(p => p.status === 'Simulating').length}
                                </p>
                            </div>
                            <Activity className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {profiles.map(p => (
                    <Card key={p.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Crosshair size={18} className="text-red-400" />
                                {p.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Simulating' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                                    p.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {p.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400 mb-4">{p.description}</p>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase font-bold">Simulated TTPs (MITRE ATT&CK)</p>
                                <div className="flex flex-wrap gap-2">
                                    {p.ttps.map((ttp, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 font-mono">
                                            {ttp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                                <span>Last Activity: {new Date(p.last_seen).toLocaleString()}</span>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <AlertTriangle size={12} />
                                    <span>High Fidelity Simulation</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
