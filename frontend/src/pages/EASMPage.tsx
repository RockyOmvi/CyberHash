import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Globe, AlertOctagon, CheckCircle, Search } from 'lucide-react';
import { api } from '../services/api';

interface ExternalAsset {
    id: string;
    domain: string;
    ip: string;
    type: string;
    status: string;
    issue: string;
    last_seen: string;
}

export function EASMPage() {
    const [assets, setAssets] = useState<ExternalAsset[]>([]);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await api.getExternalAssets();
                setAssets(data || []);
            } catch (error) {
                console.error("Failed to fetch external assets:", error);
            }
        };
        fetchAssets();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="text-orange-400" />
                External Attack Surface Management (EASM)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-900/20 border-orange-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Vulnerable Assets</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {assets.filter(a => a.status === 'Vulnerable').length}
                                </p>
                            </div>
                            <AlertOctagon className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {assets.map(a => (
                    <Card key={a.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe size={18} className="text-orange-400" />
                                {a.domain}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'Secure' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {a.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">IP Address: <span className="text-white font-mono">{a.ip}</span></p>
                                    <p className="text-sm text-gray-400">Type: <span className="text-orange-400 font-bold">{a.type}</span></p>
                                    {a.issue !== 'None' && (
                                        <p className="text-sm text-red-400 font-bold flex items-center gap-1">
                                            <AlertOctagon size={12} /> {a.issue}
                                        </p>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Last Seen: {new Date(a.last_seen).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
