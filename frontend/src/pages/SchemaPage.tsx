import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileCode, ShieldX, AlertCircle, Globe } from 'lucide-react';
import { api } from '../services/api';

interface SchemaViolation {
    id: string;
    endpoint: string;
    violation: string;
    payload: string;
    action: string;
    source_ip: string;
    timestamp: string;
}

export function SchemaPage() {
    const [violations, setViolations] = useState<SchemaViolation[]>([]);

    useEffect(() => {
        const fetchViolations = async () => {
            try {
                const data = await api.getSchemaViolations();
                setViolations(data || []);
            } catch (error) {
                console.error("Failed to fetch schema violations:", error);
            }
        };
        fetchViolations();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileCode className="text-purple-400" />
                API Schema Enforcement
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Rejected Requests</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {violations.filter(v => v.action === 'Rejected').length}
                                </p>
                            </div>
                            <ShieldX className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {violations.map(v => (
                    <Card key={v.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe size={18} className="text-purple-400" />
                                {v.endpoint}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${v.action === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {v.action}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-red-400 flex items-center gap-2">
                                        <AlertCircle size={14} /> {v.violation}
                                    </span>
                                    <span className="text-xs text-gray-500">Source: {v.source_ip}</span>
                                </div>

                                <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <span className="text-purple-400">payload:</span> {v.payload}
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    {new Date(v.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
