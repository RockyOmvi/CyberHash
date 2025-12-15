import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Cpu, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface TelemetryEvent {
    id: string;
    timestamp: string;
    source: string;
    event_type: string;
    severity: string;
    details: string;
}

export function HardwarePage() {
    const [events, setEvents] = useState<TelemetryEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getHardwareTelemetry();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch telemetry:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="text-blue-400" />
                Hardware-Level Telemetry (Intel TDT / AMD PRO)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Critical Alerts</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {events.filter(e => e.severity === 'Critical').length}
                                </p>
                            </div>
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Sensors</p>
                                <p className="text-2xl font-bold text-white">24</p>
                            </div>
                            <Activity className="text-green-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>CPU Threat Detection Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Time</th>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Event Type</th>
                                    <th className="px-4 py-3">Severity</th>
                                    <th className="px-4 py-3 rounded-r-lg">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {events.map(e => (
                                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">{new Date(e.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-mono text-blue-300">{e.source}</td>
                                        <td className="px-4 py-3 text-white font-medium">{e.event_type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${e.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {e.severity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{e.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
