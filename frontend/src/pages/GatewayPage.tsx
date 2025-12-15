import { useEffect, useState } from 'react';
import { Shield, Lock, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../services/api';

interface GatewayRule {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    threshold: number;
}

export function GatewayPage() {
    const [rules, setRules] = useState<GatewayRule[]>([]);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const data = await api.getGatewayRules();
            setRules(data.rules);
        } catch (error) {
            console.error("Failed to load gateway rules", error);
        }
    };

    const toggleRule = async (id: string) => {
        try {
            await api.toggleGatewayRule(id);
            loadRules();
        } catch (error) {
            console.error("Failed to toggle rule", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="text-cyan-400" />
                        API Security Gateway
                    </h2>
                    <p className="text-slate-400 mt-1">Manage API access, rate limiting, and security policies</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {rules.map((rule) => (
                    <div key={rule.id} className="glass-surface p-6 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-white/5">
                                {rule.type === 'RateLimit' ? <Shield className="text-yellow-400" /> :
                                    rule.type === 'AuthCheck' ? <Lock className="text-emerald-400" /> :
                                        <Shield className="text-red-400" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">{rule.name}</h4>
                                <p className="text-sm text-slate-400">{rule.type} {rule.threshold > 0 ? `• Limit: ${rule.threshold}/min` : ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleRule(rule.id)}
                            className={`transition-colors ${rule.enabled ? 'text-emerald-400' : 'text-slate-600'}`}
                        >
                            {rule.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
