import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Network, ShieldAlert, UserX, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface ADPath {
    id: string;
    source: string;
    target: string;
    hops: number;
    techniques: string[];
    risk_score: number;
    status: string;
    last_checked: string;
}

export function ADPage() {
    const [paths, setPaths] = useState<ADPath[]>([]);

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                const data = await api.getADPaths();
                setPaths(data || []);
            } catch (error) {
                console.error("Failed to fetch AD paths:", error);
            }
        };
        fetchPaths();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Network className="text-indigo-500" />
                Active Directory Attack Path Validation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-indigo-900/20 border-indigo-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Critical Paths</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {paths.filter(p => p.risk_score > 80).length}
                                </p>
                            </div>
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paths.map(p => (
                    <Card key={p.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <UserX size={18} className="text-red-400" />
                                {p.source} <ArrowRight size={16} className="text-gray-500" /> {p.target}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Mitigated' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {p.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Attack Techniques</p>
                                    <div className="flex flex-wrap gap-2">
                                        {p.techniques.map((t, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-indigo-300 font-mono">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase">Risk Score</p>
                                    <p className={`text-2xl font-bold ${p.risk_score > 80 ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {p.risk_score}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 text-right">
                                Validated: {new Date(p.last_checked).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
