import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CloudLightning, ShieldAlert, Code, Lock } from 'lucide-react';
import { api } from '../services/api';

interface ServerlessFunc {
    id: string;
    name: string;
    provider: string;
    runtime: string;
    vulns: number;
    permissions: string;
    status: string;
    last_scanned: string;
}

export function ServerlessPage() {
    const [funcs, setFuncs] = useState<ServerlessFunc[]>([]);

    useEffect(() => {
        const fetchFuncs = async () => {
            try {
                const data = await api.getServerlessFunctions();
                setFuncs(data || []);
            } catch (error) {
                console.error("Failed to fetch serverless functions:", error);
            }
        };
        fetchFuncs();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CloudLightning className="text-yellow-500" />
                Serverless Function Security
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-900/20 border-yellow-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Critical Functions</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {funcs.filter(f => f.status === 'Critical').length}
                                </p>
                            </div>
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {funcs.map(f => (
                    <Card key={f.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Code size={18} className="text-yellow-400" />
                                {f.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${f.status === 'Secure' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {f.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Provider</p>
                                    <p className="text-sm font-bold text-white">{f.provider}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Runtime</p>
                                    <p className="text-sm font-bold text-white">{f.runtime}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Vulnerabilities</p>
                                    <p className={`text-sm font-bold ${f.vulns > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {f.vulns} CVEs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Permissions</p>
                                    <p className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                                        <Lock size={12} /> {f.permissions}
                                    </p>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-right">
                                Scanned: {new Date(f.last_scanned).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
