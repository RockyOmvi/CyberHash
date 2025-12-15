import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ScrollText, CheckCircle, XCircle, Shield } from 'lucide-react';
import { api } from '../services/api';

interface PolicyCheck {
    id: string;
    policy_name: string;
    status: string;
    resource: string;
    enforced_by: string;
    timestamp: string;
}

export function PolicyPage() {
    const [checks, setChecks] = useState<PolicyCheck[]>([]);

    useEffect(() => {
        const fetchChecks = async () => {
            try {
                const data = await api.getPolicyChecks();
                setChecks(data || []);
            } catch (error) {
                console.error("Failed to fetch policy checks:", error);
            }
        };
        fetchChecks();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ScrollText className="text-purple-400" />
                Policy-as-Code Engine
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Failed Checks</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {checks.filter(c => c.status === 'Failed').length}
                                </p>
                            </div>
                            <XCircle className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {checks.map(c => (
                    <Card key={c.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield size={18} className="text-purple-400" />
                                {c.policy_name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${c.status === 'Passed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {c.status === 'Passed' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {c.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Resource: <span className="text-white font-mono">{c.resource}</span></p>
                                    <p className="text-sm text-gray-400">Enforced By: <span className="text-purple-400 font-bold">{c.enforced_by}</span></p>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Checked: {new Date(c.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
