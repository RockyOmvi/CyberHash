import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Key, ShieldCheck, AlertTriangle, Cloud } from 'lucide-react';
import { api } from '../services/api';

interface Entitlement {
    id: string;
    identity: string;
    type: string;
    cloud: string;
    permissions: number;
    used: number;
    excessive: number;
    recommendation: string;
    last_analyzed: string;
}

export function CIEMPage() {
    const [ents, setEnts] = useState<Entitlement[]>([]);

    useEffect(() => {
        const fetchEnts = async () => {
            try {
                const data = await api.getEntitlements();
                setEnts(data || []);
            } catch (error) {
                console.error("Failed to fetch entitlements:", error);
            }
        };
        fetchEnts();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Key className="text-purple-400" />
                Cloud Entitlement Management (CIEM)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Excessive Permissions</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {ents.reduce((acc, e) => acc + e.excessive, 0)}
                                </p>
                            </div>
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {ents.map(e => (
                    <Card key={e.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Cloud size={18} className="text-purple-400" />
                                {e.identity}
                            </CardTitle>
                            <span className="px-2 py-1 bg-white/5 rounded text-xs font-bold text-gray-300">
                                {e.cloud} / {e.type}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Permission Usage</span>
                                        <span className="text-white font-bold">
                                            {Math.round((e.used / e.permissions) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${(e.used / e.permissions) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${(e.excessive / e.permissions) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                        <span>Used: {e.used}</span>
                                        <span className="text-red-400">Excessive: {e.excessive}</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Recommendation</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-green-400" />
                                            {e.recommendation}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-right">
                                Analyzed: {new Date(e.last_analyzed).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
