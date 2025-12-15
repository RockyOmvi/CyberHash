import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Database, Lock, Unlock, Eye } from 'lucide-react';
import { api } from '../services/api';

interface DataAsset {
    id: string;
    name: string;
    location: string;
    classification: string;
    encryption: boolean;
    exposure: string;
    last_scanned: string;
}

export function DSPMPage() {
    const [assets, setAssets] = useState<DataAsset[]>([]);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await api.getDataAssets();
                setAssets(data || []);
            } catch (error) {
                console.error("Failed to fetch data assets:", error);
            }
        };
        fetchAssets();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="text-purple-400" />
                Data Security Posture Management (DSPM)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Exposed Assets</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {assets.filter(a => a.exposure === 'Public Internet').length}
                                </p>
                            </div>
                            <Eye className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {assets.map(a => (
                    <Card key={a.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Database size={18} className="text-purple-400" />
                                {a.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${a.classification === 'Public' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {a.classification}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Location: <span className="text-white font-mono">{a.location}</span></p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold flex items-center gap-1 ${a.encryption ? 'text-green-400' : 'text-red-400'}`}>
                                            {a.encryption ? <Lock size={12} /> : <Unlock size={12} />}
                                            {a.encryption ? 'Encrypted' : 'Unencrypted'}
                                        </span>
                                        <span className="text-gray-600">|</span>
                                        <span className={`text-xs font-bold ${a.exposure === 'Private' ? 'text-green-400' : 'text-red-400'}`}>
                                            {a.exposure}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Scanned: {new Date(a.last_scanned).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
