import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Bot, Shield, AlertTriangle, Globe } from 'lucide-react';
import { api } from '../services/api';

interface BotEvent {
    id: string;
    bot_type: string;
    confidence: number;
    target: string;
    action: string;
    source_ip: string;
    user_agent: string;
    timestamp: string;
}

export function BotPage() {
    const [events, setEvents] = useState<BotEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getBotEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch bot events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bot className="text-cyan-400" />
                Bot Management & Behavioral Analysis
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-cyan-900/20 border-cyan-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Bots</p>
                                <p className="text-2xl font-bold text-cyan-500">
                                    {events.filter(e => e.action === 'Blocked').length}
                                </p>
                            </div>
                            <Shield className="text-cyan-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle size={18} className="text-cyan-400" />
                                {e.bot_type}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.action === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {e.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Target: <span className="text-white font-mono">{e.target}</span></p>
                                    <p className="text-sm text-gray-400">Confidence: <span className="text-cyan-400 font-bold">{e.confidence}%</span></p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                                    <Globe size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-300">
                                        Source: <span className="font-bold text-white">{e.source_ip}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="bg-black/50 p-2 rounded border border-white/5 text-[10px] text-gray-400 font-mono truncate">
                                UA: {e.user_agent}
                            </div>

                            <div className="mt-2 text-xs text-gray-500 text-right">
                                {new Date(e.timestamp).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
