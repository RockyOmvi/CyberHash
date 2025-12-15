import { useEffect, useState } from 'react';
import { Cloud, Shield } from 'lucide-react';
import { api } from '../services/api';

interface CloudAsset {
    id: string;
    name: string;
    type: string;
    provider: 'AWS' | 'Azure' | 'GCP';
    region: string;
    status: string;
    risk_score: number;
}

export function CloudPage() {
    const [assets, setAssets] = useState<CloudAsset[]>([]);

    useEffect(() => {
        loadCloudData();
    }, []);

    const loadCloudData = async () => {
        try {
            const data = await api.getCloudPosture();
            setAssets(data.posture || []);
        } catch (error) {
            console.error("Failed to load cloud data", error);
        }
    };

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'AWS': return 'text-orange-400';
            case 'Azure': return 'text-blue-400';
            case 'GCP': return 'text-yellow-400';
            default: return 'text-slate-400';
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 80) return 'text-red-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-emerald-400';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cloud className="text-cyan-400" />
                        Multi-Cloud Security Posture
                    </h2>
                    <p className="text-slate-400 mt-1">Unified view across AWS, Azure, and GCP</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-surface px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-orange-400 font-bold">AWS</span>
                        <span className="text-white">{assets.filter(a => a.provider === 'AWS').length}</span>
                    </div>
                    <div className="glass-surface px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-blue-400 font-bold">Azure</span>
                        <span className="text-white">{assets.filter(a => a.provider === 'Azure').length}</span>
                    </div>
                    <div className="glass-surface px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">GCP</span>
                        <span className="text-white">{assets.filter(a => a.provider === 'GCP').length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset) => (
                    <div key={asset.id} className="glass-surface p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${getProviderColor(asset.provider)}`}>
                                    <Cloud size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{asset.name}</h3>
                                    <p className="text-xs text-slate-400">{asset.type} • {asset.region}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-mono ${getRiskColor(asset.risk_score)}`}>
                                <Shield size={14} />
                                {asset.risk_score}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status</span>
                                <span className="text-slate-300 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    {asset.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Provider</span>
                                <span className={getProviderColor(asset.provider)}>{asset.provider}</span>
                            </div>

                            <div className="pt-3 border-t border-white/5">
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${asset.risk_score >= 80 ? 'bg-red-500' : asset.risk_score >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${asset.risk_score}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 text-right">Risk Score</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
