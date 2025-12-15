import { useEffect, useState } from 'react';
import { Play, Zap, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface Playbook {
    id: string;
    name: string;
    description: string;
    trigger: string;
    enabled: boolean;
    last_run: string | null;
}

export function PlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

    useEffect(() => {
        loadPlaybooks();
    }, []);

    const loadPlaybooks = async () => {
        try {
            const data = await api.getPlaybooks();
            setPlaybooks(data.playbooks);
        } catch (error) {
            console.error("Failed to load playbooks", error);
        }
    };

    const handleRun = async (id: string) => {
        try {
            await api.runPlaybook(id);
            alert("Playbook executed successfully!");
            loadPlaybooks(); // Refresh to update last run time
        } catch (error) {
            alert("Failed to run playbook");
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.togglePlaybook(id);
            setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
        } catch (error) {
            console.error("Failed to toggle playbook", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-400" />
                        Automation Playbooks
                    </h2>
                    <p className="text-slate-400 mt-1">Manage automated responses to security events</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {playbooks.map((playbook) => (
                    <div key={playbook.id} className="glass-surface p-6 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${playbook.enabled ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700/50 text-slate-500'}`}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg">{playbook.name}</h3>
                                <p className="text-sm text-slate-400">{playbook.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        Trigger: {playbook.trigger}
                                    </span>
                                    {playbook.last_run && (
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle size={12} />
                                            Last Run: {new Date(playbook.last_run).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleToggle(playbook.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${playbook.enabled ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10' : 'border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {playbook.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                                onClick={() => handleRun(playbook.id)}
                                disabled={!playbook.enabled}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Run Now"
                            >
                                <Play size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
