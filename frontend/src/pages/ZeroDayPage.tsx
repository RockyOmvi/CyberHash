import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Bug, Shield, AlertTriangle, Target } from 'lucide-react';
import { api } from '../services/api';

interface ZeroDaySim {
    id: string;
    name: string;
    technique: string;
    target: string;
    success_rate: number;
    blocked_by: string;
    status: string;
    tested_at: string;
}

export function ZeroDayPage() {
    const [sims, setSims] = useState<ZeroDaySim[]>([]);

    useEffect(() => {
        const fetchSims = async () => {
            try {
                const data = await api.getZeroDaySims();
                setSims(data || []);
            } catch (error) {
                console.error("Failed to fetch zero-day sims:", error);
            }
        };
        fetchSims();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bug className="text-yellow-400" />
                Zero-Day Emulation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-900/20 border-yellow-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Successful Exploits</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {sims.filter(s => s.status === 'Exploited').length}
                                </p>
                            </div>
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sims.map(s => (
                    <Card key={s.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Target size={18} className="text-yellow-400" />
                                {s.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {s.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Target: <span className="text-white font-mono">{s.target}</span></p>
                                    <p className="text-sm text-gray-400">Technique: <span className="text-white">{s.technique}</span></p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                                    <Shield size={16} className={s.blocked_by === 'None' ? 'text-gray-500' : 'text-green-400'} />
                                    <span className="text-sm text-gray-300">
                                        Blocked By: <span className="font-bold text-white">{s.blocked_by}</span>
                                    </span>
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase">Success Rate</p>
                                    <p className={`text-xl font-bold ${s.success_rate > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {Math.round(s.success_rate * 100)}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 text-right">
                                Tested: {new Date(s.tested_at).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
