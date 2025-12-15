import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Key, Lock, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface Secret {
    id: string;
    type: string;
    location: string;
    value: string;
    status: string;
    detected_at: string;
}

export function SecretsPage() {
    const [secrets, setSecrets] = useState<Secret[]>([]);

    useEffect(() => {
        const fetchSecrets = async () => {
            try {
                const data = await api.getSecretsMesh();
                setSecrets(data || []);
            } catch (error) {
                console.error("Failed to fetch secrets:", error);
            }
        };
        fetchSecrets();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Key className="text-yellow-400" />
                Secrets Sprawl Mesh
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-900/20 border-yellow-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Exposed Secrets</p>
                                <p className="text-2xl font-bold text-yellow-500">
                                    {secrets.filter(s => s.status === 'Active').length}
                                </p>
                            </div>
                            <AlertTriangle className="text-yellow-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detected Hardcoded Secrets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Detected At</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Value (Masked)</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {secrets.map(s => (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">{new Date(s.detected_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-white">{s.type}</td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            {s.location.startsWith('GitHub') ? <FileText size={14} className="text-blue-400" /> :
                                                s.location.startsWith('Slack') ? <MessageSquare size={14} className="text-purple-400" /> :
                                                    <FileText size={14} className="text-gray-400" />}
                                            {s.location}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-500">{s.value}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-red-500/20 text-red-400' :
                                                    s.status === 'Revoked' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {s.status}
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
