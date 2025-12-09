import { useState } from 'react';
import { Search, Shield, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ScanFormProps {
    onScanStarted: (scanId: string) => void;
}

export function ScanForm({ onScanStarted }: ScanFormProps) {
    const [target, setTarget] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target) return;

        setLoading(true);
        setError('');
        try {
            const data = await api.startScan(target);
            onScanStarted(data.scan_id);
            setTarget('');
        } catch (err) {
            setError('Failed to start scan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-surface p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="text-cyan-400" size={20} />
                New Security Scan
            </h3>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="Enter target URL or IP (e.g., example.com)"
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                <button
                    type="submit"
                    disabled={loading || !target}
                    className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Start Scan'}
                </button>
            </form>
        </div>
    );
}
