import { useEffect, useState } from 'react';
import { Box, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { api } from '../services/api';

interface Vulnerability {
    id: string;
    pkg_name: string;
    installed_version: string;
    fixed_in: string;
    severity: string;
    description: string;
}

interface ContainerScanResult {
    image_id: string;
    image_name: string;
    scan_time: string;
    vulnerabilities: Vulnerability[];
    status: string;
}

export function ContainerPage() {
    const [scans, setScans] = useState<ContainerScanResult[]>([]);

    useEffect(() => {
        loadScans();
    }, []);

    const loadScans = async () => {
        try {
            const data = await api.getContainerScans();
            setScans(data.results);
        } catch (error) {
            console.error("Failed to load container scans", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Box className="text-blue-400" />
                        Container Security
                    </h2>
                    <p className="text-slate-400 mt-1">Scan container images for vulnerabilities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {scans.map((scan) => (
                    <div key={scan.image_id} className="glass-surface p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <Package className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{scan.image_name}</h4>
                                    <p className="text-sm text-slate-400 font-mono">{scan.image_id.substring(0, 12)}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${scan.status === 'Clean' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {scan.status === 'Clean' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                {scan.status}
                            </span>
                        </div>

                        {scan.vulnerabilities.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h5 className="text-sm font-semibold text-slate-300">Vulnerabilities</h5>
                                {scan.vulnerabilities.map((vuln) => (
                                    <div key={vuln.id} className="bg-white/5 rounded p-3 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-mono text-red-300">{vuln.id}</span>
                                            <span className="text-xs text-slate-500">{vuln.severity}</span>
                                        </div>
                                        <p className="text-slate-400">{vuln.pkg_name} ({vuln.installed_version}) → Fixed in {vuln.fixed_in}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
