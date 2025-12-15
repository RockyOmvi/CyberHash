import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Globe2, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface DataRegion {
    region: string;
    status: string;
    data_types: string[];
    violation_count: number;
    last_audit: string;
}

export function SovereignPage() {
    const [regions, setRegions] = useState<DataRegion[]>([]);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const data = await api.getSovereignStatus();
                setRegions(data || []);
            } catch (error) {
                console.error("Failed to fetch sovereign status:", error);
            }
        };
        fetchRegions();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe2 className="text-indigo-400" />
                Sovereign Cloud "Data Residency" Enforcer
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-indigo-900/20 border-indigo-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Residency Violations</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {regions.reduce((acc, r) => acc + r.violation_count, 0)}
                                </p>
                            </div>
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regions.map((r, idx) => (
                    <Card key={idx} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-400" />
                                {r.region}
                            </CardTitle>
                            {r.status === 'Compliant' ?
                                <CheckCircle className="text-green-500" size={20} /> :
                                <AlertTriangle className="text-red-500" size={20} />
                            }
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400 text-sm">Compliance Status</span>
                                    <span className={`font-bold ${r.status === 'Compliant' ? 'text-green-400' : 'text-red-400'}`}>
                                        {r.status}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Hosted Data Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {r.data_types.map((dt, i) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
                                                {dt}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Last Audit: {new Date(r.last_audit).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
