import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Copy, Play, Activity, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface TwinSimulation {
    id: string;
    scenario: string;
    status: string;
    impact: string;
    resilience: number;
    predicted_at: string;
}

export function DigitalTwinPage() {
    const [simulations, setSimulations] = useState<TwinSimulation[]>([]);

    useEffect(() => {
        const fetchSimulations = async () => {
            try {
                const data = await api.getTwinSimulations();
                setSimulations(data || []);
            } catch (error) {
                console.error("Failed to fetch digital twin simulations:", error);
            }
        };
        fetchSimulations();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Copy className="text-indigo-400" />
                Digital Twin for Security
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-indigo-900/20 border-indigo-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Simulations</p>
                                <p className="text-2xl font-bold text-indigo-500">
                                    {simulations.filter(s => s.status === 'Running').length}
                                </p>
                            </div>
                            <Activity className="text-indigo-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {simulations.map(s => (
                    <Card key={s.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Play size={18} className="text-indigo-400" />
                                {s.scenario}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {s.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Predicted Impact: <span className="text-red-400 font-bold">{s.impact}</span></p>
                                    {s.status === 'Completed' && (
                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                            <TrendingUp size={12} /> Resilience Score:
                                            <span className={`font-bold ${s.resilience > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {s.resilience}/100
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Predicted: {new Date(s.predicted_at).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
