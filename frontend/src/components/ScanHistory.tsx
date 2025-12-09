import { useEffect, useState } from 'react';
import { api, ScanResult } from '../services/api';
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function ScanHistory() {
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await api.getScanHistory();
                // Ensure data.scans is an array before setting state
                setHistory(Array.isArray(data.scans) ? data.scans : []);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Clock className="mx-auto mb-4 opacity-50" size={48} />
                <p>No scan history available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((scan) => (
                <div key={scan.scan_id} className="glass-surface p-4 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${scan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                scan.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {scan.status === 'completed' ? <CheckCircle size={20} /> :
                                scan.status === 'failed' ? <XCircle size={20} /> :
                                    <Loader2 className="animate-spin" size={20} />}
                        </div>
                        <div>
                            <h4 className="text-white font-medium">{scan.target}</h4>
                            <p className="text-xs text-slate-400 font-mono">{scan.scan_id.substring(0, 8)}...</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-red-400 text-sm">
                                <AlertTriangle size={14} />
                                <span>{scan.vulnerabilities ? scan.vulnerabilities.length : 0} Issues</span>
                            </div>
                            <p className="text-xs text-slate-500 capitalize">{scan.status}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
