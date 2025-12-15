import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, Shield, Terminal, Box } from 'lucide-react';
import { api } from '../services/api';

interface EBPFEvent {
    id: string;
    process: string;
    syscall: string;
    args: string;
    user: string;
    container_id: string;
    action: string;
    timestamp: string;
}

export function EBPFPage() {
    const [events, setEvents] = useState<EBPFEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getEBPFEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch eBPF events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="text-blue-400" />
                eBPF Runtime Observability
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Blocked Syscalls</p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {events.filter(e => e.action.includes('Blocked')).length}
                                </p>
                            </div>
                            <Shield className="text-blue-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Terminal size={18} className="text-gray-400" />
                                {e.process} (Syscall: {e.syscall})
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.action === 'Allowed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {e.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <span className="text-blue-400">args:</span> {e.args}
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Box size={12} /> Container: {e.container_id.substring(0, 12)}...
                                    </span>
                                    <span>User: {e.user}</span>
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 text-right">
                                {new Date(e.timestamp).toLocaleTimeString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
