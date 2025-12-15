import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Archive, FileText, HardDrive, Download } from 'lucide-react';
import { api } from '../services/api';

interface EvidenceItem {
    id: string;
    incident_id: string;
    type: string;
    size: string;
    hash: string;
    collected_by: string;
    stored_at: string;
    timestamp: string;
}

export function EvidencePage() {
    const [items, setItems] = useState<EvidenceItem[]>([]);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const data = await api.getEvidence();
                setItems(data || []);
            } catch (error) {
                console.error("Failed to fetch evidence:", error);
            }
        };
        fetchEvidence();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Archive className="text-blue-400" />
                Real-Time Evidence Collection
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Evidence Collected</p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {items.length}
                                </p>
                            </div>
                            <HardDrive className="text-blue-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map(item => (
                    <Card key={item.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-blue-400" />
                                {item.type}
                            </CardTitle>
                            <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">
                                {item.incident_id}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Size: <span className="text-white">{item.size}</span></span>
                                    <span>Collector: <span className="text-white">{item.collected_by}</span></span>
                                </div>

                                <div className="bg-black/50 p-2 rounded border border-white/5 font-mono text-[10px] text-gray-500 truncate">
                                    Hash: {item.hash}
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{item.stored_at}</span>
                                    <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
