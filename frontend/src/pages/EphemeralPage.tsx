import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { RefreshCw, Server, Box, Clock } from 'lucide-react';
import { api } from '../services/api';

interface Resource {
    id: string;
    type: string;
    ip_address: string;
    status: string;
    ttl: number;
    created_at: string;
}

export function EphemeralPage() {
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await api.getEphemeralRotation();
                setResources(data || []);
            } catch (error) {
                console.error("Failed to fetch ephemeral resources:", error);
            }
        };
        fetchResources();
        const interval = setInterval(fetchResources, 1000); // Live TTL updates
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <RefreshCw className="text-green-400" />
                Ephemeral Infrastructure (Moving Target Defense)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-900/20 border-green-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Rotations</p>
                                <p className="text-2xl font-bold text-green-400">{resources.length}</p>
                            </div>
                            <RefreshCw className="text-green-500 animate-spin-slow" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(r => (
                    <Card key={r.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                {r.type}
                            </CardTitle>
                            {r.type === 'Container' ? <Box size={16} className="text-blue-400" /> : <Server size={16} className="text-purple-400" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-1">{r.ip_address}</div>
                            <p className="text-xs text-gray-500 font-mono mb-4">ID: {r.id}</p>

                            <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                        r.status === 'Terminating' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {r.status}
                                </span>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <Clock size={14} />
                                    <span className="font-mono">{r.ttl}s</span>
                                </div>
                            </div>

                            <div className="mt-3 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all duration-1000"
                                    style={{ width: `${(r.ttl / 300) * 100}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
