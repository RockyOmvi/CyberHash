import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Crosshair, ShieldAlert, Target, Play } from 'lucide-react';
import { api } from '../services/api';

interface Campaign {
    id: string;
    name: string;
    tactic: string;
    status: string;
    success_rate: number;
    last_run: string;
}

export function CARTPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await api.getCARTCampaigns();
                setCampaigns(data || []);
            } catch (error) {
                console.error("Failed to fetch CART campaigns:", error);
            }
        };
        fetchCampaigns();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crosshair className="text-red-500" />
                Automated Red Teaming (CART)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Campaigns</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {campaigns.filter(c => c.status === 'Running').length}
                                </p>
                            </div>
                            <Target className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attack Simulation Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Campaign Name</th>
                                    <th className="px-4 py-3">MITRE Tactic</th>
                                    <th className="px-4 py-3">Last Run</th>
                                    <th className="px-4 py-3">Success Rate</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {campaigns.map(c => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                                        <td className="px-4 py-3 text-red-300">{c.tactic}</td>
                                        <td className="px-4 py-3">{new Date(c.last_run).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${c.success_rate > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${c.success_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{c.success_rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'Running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                                    c.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
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
