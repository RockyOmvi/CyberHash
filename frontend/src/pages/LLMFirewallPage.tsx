import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, ShieldBan, MessageSquare, User } from 'lucide-react';
import { api } from '../services/api';

interface LLMEvent {
    id: string;
    prompt: string;
    model: string;
    action: string;
    risk_type: string;
    user: string;
    timestamp: string;
}

export function LLMFirewallPage() {
    const [events, setEvents] = useState<LLMEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getLLMEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch LLM events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="text-pink-400" />
                LLM Firewall
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-pink-900/20 border-pink-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Prompts</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {events.filter(e => e.action === 'Blocked').length}
                                </p>
                            </div>
                            <ShieldBan className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageSquare size={18} className="text-pink-400" />
                                {e.risk_type}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.action === 'Blocked' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {e.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-sm text-gray-300">
                                    "{e.prompt}"
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Brain size={14} /> {e.model}</span>
                                        <span className="flex items-center gap-1"><User size={14} /> {e.user}</span>
                                    </div>
                                    <div>
                                        {new Date(e.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
