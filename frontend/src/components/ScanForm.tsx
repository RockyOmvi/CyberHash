import { useState } from 'react';
import { Search, Shield, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface ScanFormProps {
    onScanStarted?: (scanId: string) => void;
}

export function ScanForm({ onScanStarted }: ScanFormProps) {
    const [target, setTarget] = useState('');
    const [frequency, setFrequency] = useState('once');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target) return;

        setLoading(true);
        setError('');
        try {
            if (frequency === 'once') {
                const data = await api.startScan(target);
                if (onScanStarted) onScanStarted(data.scan_id);
            } else {
                await api.createSchedule(target, frequency);
                // Maybe show a success message or switch tab?
                // For now, just clear the form
            }
            setTarget('');
            setFrequency('once');
        } catch (err: any) {
            const message = err.message || 'Failed to start scan. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="text-blue-400" size={20} />
                    New Security Scan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="Enter target URL or IP (e.g., example.com)"
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        >
                            <option value="once">Run Once</option>
                            <option value="@daily">Daily</option>
                            <option value="@weekly">Weekly</option>
                        </select>

                        <Button
                            type="submit"
                            disabled={loading || !target}
                            className="flex-1"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            {frequency === 'once' ? 'Start Scan' : 'Schedule Scan'}
                        </Button>
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                </form>
            </CardContent>
        </Card>
    );
}
