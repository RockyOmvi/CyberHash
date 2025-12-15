import { useEffect, useState } from 'react';
import { User, AlertTriangle, Shield, Activity } from 'lucide-react';
import { api } from '../services/api';

interface Anomaly {
    id: string;
    user_id: string;
    type: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    timestamp: string;
}

export function UEBAPage() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

    useEffect(() => {
        loadAnomalies();
    }, []);

    const loadAnomalies = async () => {
        try {
            const data = await api.getAnomalies();
            setAnomalies(data.anomalies);
        } catch (error) {
            console.error("Failed to load anomalies", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <User className="text-purple-400" />
                        User Entity & Behavior Analytics
                    </h2>
                    <p className="text-slate-400 mt-1">Detect anomalous user behavior and insider threats</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Active Users</p>
                            <h3 className="text-3xl font-bold text-white mt-1">24</h3>
                        </div>
                        <User className="text-cyan-400" />
                    </div>
                </div>
                <div className="glass-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Risk Score</p>
                            <h3 className="text-3xl font-bold text-yellow-400 mt-1">45</h3>
                        </div>
                        <Shield className="text-yellow-400" />
                    </div>
                </div>
                <div className="glass-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Anomalies Detected</p>
                            <h3 className="text-3xl font-bold text-red-400 mt-1">{anomalies.length}</h3>
                        </div>
                        <AlertTriangle className="text-red-400" />
                    </div>
                </div>
            </div>

            <div className="glass-surface p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Anomalies</h3>
                <div className="space-y-4">
                    {anomalies.map((anomaly) => (
                        <div key={anomaly.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${anomaly.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : anomaly.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{anomaly.type}</h4>
                                    <p className="text-sm text-slate-400">{anomaly.description}</p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                        <span>User: {anomaly.user_id}</span>
                                        <span>Time: {new Date(anomaly.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${anomaly.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : anomaly.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                {anomaly.severity}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
