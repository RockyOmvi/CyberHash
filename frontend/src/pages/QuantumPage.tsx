import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Atom, Lock, Network, Activity } from 'lucide-react';
import { api } from '../services/api';

interface QuantumTunnel {
    id: string;
    source: string;
    destination: string;
    algorithm: string;
    status: string;
    latency: string;
    uptime: string;
    last_rekey: string;
}

export function QuantumPage() {
    const [tunnels, setTunnels] = useState<QuantumTunnel[]>([]);

    useEffect(() => {
        const fetchTunnels = async () => {
            try {
                const data = await api.getQuantumTunnels();
                setTunnels(data || []);
            } catch (error) {
                console.error("Failed to fetch quantum tunnels:", error);
            }
        };
        fetchTunnels();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Atom className="text-cyan-400" />
                Quantum-Safe VPN
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-cyan-900/20 border-cyan-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Post-Quantum Tunnels</p>
                                <p className="text-2xl font-bold text-cyan-500">
                                    {tunnels.length}
                                </p>
                            </div>
                            <Lock className="text-cyan-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tunnels.map(t => (
                    <Card key={t.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Network size={18} className="text-cyan-400" />
                                {t.source} <span className="text-gray-500">→</span> {t.destination}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Secure' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {t.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Algorithm: <span className="text-cyan-400 font-mono font-bold">{t.algorithm}</span></p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        <Activity size={12} /> Latency: {t.latency} | Uptime: {t.uptime}
                                    </p>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Last Rekey: {new Date(t.last_rekey).toLocaleTimeString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
