import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { UploadCloud, Shield, AlertOctagon, Database } from 'lucide-react';
import { api } from '../services/api';

interface ExfilTest {
    id: string;
    method: string;
    data_size: string;
    destination: string;
    status: string;
    detected_by: string;
    tested_at: string;
}

export function ExfilPage() {
    const [tests, setTests] = useState<ExfilTest[]>([]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await api.getExfilTests();
                setTests(data || []);
            } catch (error) {
                console.error("Failed to fetch exfil tests:", error);
            }
        };
        fetchTests();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <UploadCloud className="text-purple-500" />
                Data Exfiltration Stress Test
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Leaked Simulations</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {tests.filter(t => t.status === 'Leaked').length}
                                </p>
                            </div>
                            <AlertOctagon className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tests.map(t => (
                    <Card key={t.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Database size={18} className="text-purple-400" />
                                {t.method}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {t.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Destination: <span className="text-white font-mono">{t.destination}</span></p>
                                    <p className="text-sm text-gray-400">Data Size: <span className="text-white">{t.data_size}</span></p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                                    <Shield size={16} className={t.detected_by === 'None' ? 'text-gray-500' : 'text-green-400'} />
                                    <span className="text-sm text-gray-300">
                                        Caught By: <span className="font-bold text-white">{t.detected_by}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 text-right">
                                Tested: {new Date(t.tested_at).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
