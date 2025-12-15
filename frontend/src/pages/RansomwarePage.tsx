import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Lock, ShieldCheck, FileX, Clock } from 'lucide-react';
import { api } from '../services/api';

interface RansomwareSim {
    id: string;
    variant: string;
    files_encrypted: number;
    duration: string;
    blocked_by: string;
    status: string;
    simulated_at: string;
}

export function RansomwarePage() {
    const [sims, setSims] = useState<RansomwareSim[]>([]);

    useEffect(() => {
        const fetchSims = async () => {
            try {
                const data = await api.getRansomwareSims();
                setSims(data || []);
            } catch (error) {
                console.error("Failed to fetch ransomware sims:", error);
            }
        };
        fetchSims();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-red-500" />
                Ransomware Emulation
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Simulations</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {sims.filter(s => s.status === 'Blocked').length}
                                </p>
                            </div>
                            <ShieldCheck className="text-green-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sims.map(s => (
                    <Card key={s.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <FileX size={18} className="text-red-400" />
                                {s.variant}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {s.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase">Files Encrypted</p>
                                    <p className="text-xl font-bold text-white">{s.files_encrypted}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase">Duration</p>
                                    <p className="text-xl font-bold text-white flex justify-center items-center gap-1">
                                        <Clock size={14} /> {s.duration}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase">Blocked By</p>
                                    <p className="text-xl font-bold text-blue-400">{s.blocked_by}</p>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-right">
                                Simulated: {new Date(s.simulated_at).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
