import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { UserCheck, Shield, AlertOctagon, Lock } from 'lucide-react';
import { api } from '../services/api';

interface IdentityAlert {
    id: string;
    timestamp: string;
    user: string;
    attack: string;
    status: string;
    risk_score: number;
}

export function IdentityPage() {
    const [alerts, setAlerts] = useState<IdentityAlert[]>([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await api.getIdentityAlerts();
                setAlerts(data || []);
            } catch (error) {
                console.error("Failed to fetch identity alerts:", error);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserCheck className="text-purple-400" />
                Identity Threat Detection & Response (ITDR)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Threats</p>
                                <p className="text-2xl font-bold text-purple-400">{alerts.length}</p>
                            </div>
                            <AlertOctagon className="text-purple-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Monitored Users</p>
                                <p className="text-2xl font-bold text-white">{alerts.length > 0 ? new Set(alerts.map(a => a.user)).size : 0}</p>
                            </div>
                            <UserCheck className="text-blue-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Privileged Accounts</p>
                                <p className="text-2xl font-bold text-white">0</p>
                            </div>
                            <Shield className="text-yellow-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">MFA Bypass Attempts</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {alerts.filter(a => a.attack.includes('MFA')).length}
                                </p>
                            </div>
                            <Lock className="text-red-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Identity Security Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Time</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Attack Vector</th>
                                    <th className="px-4 py-3">Risk Score</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {alerts.map(a => (
                                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">{new Date(a.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-white">{a.user}</td>
                                        <td className="px-4 py-3 text-red-300">{a.attack}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${a.risk_score > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${a.risk_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{a.risk_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">
                                                {a.status}
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
