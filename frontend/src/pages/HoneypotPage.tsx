import { useEffect, useState } from 'react';
import { Target, Shield, Activity, Server } from 'lucide-react';
import { api } from '../services/api';

interface Honeypot {
    id: string;
    name: string;
    type: string;
    port: number;
    status: string;
    attacks: number;
    last_attack: string;
}

export function HoneypotPage() {
    const [honeypots, setHoneypots] = useState<Honeypot[]>([]);

    useEffect(() => {
        loadHoneypots();
    }, []);

    const loadHoneypots = async () => {
        try {
            const data = await api.getHoneypots();
            setHoneypots(data.honeypots);
        } catch (error) {
            console.error("Failed to load honeypots", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="text-red-400" />
                        Deception Technology
                    </h2>
                    <p className="text-slate-400 mt-1">Deploy honeypots to lure and detect attackers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Active Honeypots</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{honeypots.filter(h => h.status === 'Running').length}</h3>
                        </div>
                        <Shield className="text-emerald-400" />
                    </div>
                </div>
                <div className="glass-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Attacks Intercepted</p>
                            <h3 className="text-3xl font-bold text-red-400 mt-1">{honeypots.reduce((acc, h) => acc + h.attacks, 0)}</h3>
                        </div>
                        <Activity className="text-red-400" />
                    </div>
                </div>
            </div>

            <div className="glass-surface p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Deployed Decoys</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {honeypots.map((hp) => (
                        <div key={hp.id} className="bg-white/5 rounded-lg border border-white/5 p-6 hover:border-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <Server size={24} className="text-cyan-400" />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${hp.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                    {hp.status}
                                </span>
                            </div>
                            <h4 className="font-semibold text-white">{hp.name}</h4>
                            <p className="text-sm text-slate-400 mb-4">{hp.type} • Port {hp.port}</p>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                                <span>Attacks: {hp.attacks}</span>
                                <span>Last: {new Date(hp.last_attack).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
