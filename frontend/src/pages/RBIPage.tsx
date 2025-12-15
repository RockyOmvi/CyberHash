import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Globe, Shield, ExternalLink, XCircle } from 'lucide-react';
import { api } from '../services/api';

interface Session {
    id: string;
    user: string;
    url: string;
    risk_level: string;
    status: string;
    started_at: string;
}

export function RBIPage() {
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.getRBISessions();
                setSessions(data || []);
            } catch (error) {
                console.error("Failed to fetch RBI sessions:", error);
            }
        };
        fetchSessions();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="text-blue-400" />
                Browser Isolation (RBI) Integration
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Isolated Sessions</p>
                                <p className="text-2xl font-bold text-blue-400">{sessions.length}</p>
                            </div>
                            <Shield className="text-blue-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sessions.map(s => (
                    <Card key={s.id} className="border-white/10 bg-black/40">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                                                s.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                            }`}>
                                            {s.risk_level} Risk
                                        </span>
                                        <span className="text-gray-500 text-sm font-mono">{s.id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <ExternalLink size={16} className="text-blue-400" />
                                        {s.url}
                                    </h3>
                                    <p className="text-sm text-gray-400">User: {s.user}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-gray-500">Started</p>
                                        <p className="text-sm text-gray-300">{new Date(s.started_at).toLocaleTimeString()}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex items-center gap-2 transition-colors">
                                        <XCircle size={16} />
                                        Terminate
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
