import { useEffect, useState } from 'react';
import { MessageSquare, Ticket, Settings } from 'lucide-react';
import { api } from '../services/api';

interface IntegrationConfig {
    type: 'Slack' | 'Teams' | 'Jira';
    enabled: boolean;
    webhook: string;
    api_key: string;
}

export function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            const data = await api.getIntegrations();
            setIntegrations(data.integrations);
        } catch (error) {
            console.error("Failed to load integrations", error);
        }
    };

    const handleToggle = async (config: IntegrationConfig) => {
        const updated = { ...config, enabled: !config.enabled };
        try {
            await api.updateIntegration(updated);
            setIntegrations(prev => prev.map(i => i.type === config.type ? updated : i));
        } catch (error) {
            console.error("Failed to update integration", error);
        }
    };

    const handleTest = async (type: string) => {
        try {
            await api.testIntegration(type, "This is a test message from CyberHash.");
            alert("Test message sent!");
        } catch (error) {
            alert("Failed to send test message");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-purple-400" />
                        Integrations
                    </h2>
                    <p className="text-slate-400 mt-1">Configure ChatOps and Ticketing systems</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((config) => (
                    <div key={config.type} className="glass-surface p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${config.type === 'Slack' ? 'text-emerald-400' : config.type === 'Teams' ? 'text-blue-400' : 'text-blue-500'}`}>
                                    {config.type === 'Jira' ? <Ticket size={24} /> : <MessageSquare size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{config.type}</h3>
                                    <p className="text-xs text-slate-400">{config.type === 'Jira' ? 'Ticketing System' : 'ChatOps'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(config)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${config.enabled ? 'bg-purple-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Webhook URL / API Endpoint</label>
                                <input
                                    type="text"
                                    value={config.webhook}
                                    readOnly
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none"
                                    placeholder="https://hooks.slack.com/..."
                                />
                            </div>
                            <button
                                onClick={() => handleTest(config.type)}
                                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                            >
                                Send Test Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
