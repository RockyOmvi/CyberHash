import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Eye, Clock, Link, Server } from 'lucide-react';
import { api } from '../services/api';

interface GodEvent {
    id: string;
    source: string;
    event: string;
    details: string;
    correlation: string;
    timestamp: string;
}

export function GodModePage() {
    const [events, setEvents] = useState<GodEvent[]>([]);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const data = await api.getGodTimeline();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch God Mode timeline:", error);
            }
        };
        fetchTimeline();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="text-purple-500" />
                "God Mode" Forensic Timeline
            </h1>

            <div className="relative border-l-2 border-purple-500/30 ml-4 space-y-8 pl-8 py-4">
                {events.map((e, index) => (
                    <div key={e.id} className="relative">
                        <div className="absolute -left-[41px] top-0 bg-black border-2 border-purple-500 rounded-full p-1">
                            <Clock size={16} className="text-purple-500" />
                        </div>

                        <Card className="border-white/10 bg-black/40">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold text-white">
                                    {e.event}
                                </CardTitle>
                                <span className="text-xs text-gray-400 font-mono">
                                    {new Date(e.timestamp).toLocaleString()}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-purple-400 font-bold">
                                        <Server size={14} /> Source: {e.source}
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        {e.details}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-white/5 p-2 rounded">
                                        <Link size={12} /> Correlated with: <span className="text-white">{e.correlation}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
