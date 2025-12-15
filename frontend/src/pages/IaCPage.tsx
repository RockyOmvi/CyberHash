import { useEffect, useState } from 'react';
import { Code, AlertTriangle, CheckCircle, FileCode } from 'lucide-react';
import { api } from '../services/api';

interface IaCIssue {
    id: string;
    title: string;
    severity: string;
    file: string;
    line: number;
    description: string;
}

interface IaCScanResult {
    id: string;
    timestamp: string;
    issues: IaCIssue[];
    status: string;
}

export function IaCPage() {
    const [scans, setScans] = useState<IaCScanResult[]>([]);

    useEffect(() => {
        loadScans();
    }, []);

    const loadScans = async () => {
        try {
            const data = await api.getIaCScans();
            setScans(data.results);
        } catch (error) {
            console.error("Failed to load IaC scans", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Code className="text-purple-400" />
                        Infrastructure as Code Security
                    </h2>
                    <p className="text-slate-400 mt-1">Scan Terraform, CloudFormation, and Kubernetes manifests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {scans.map((scan) => (
                    <div key={scan.id} className="glass-surface p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <FileCode className="text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Scan Result</h4>
                                    <p className="text-sm text-slate-400 font-mono">{scan.timestamp}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${scan.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {scan.status === 'Passed' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                {scan.status}
                            </span>
                        </div>

                        {scan.issues.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h5 className="text-sm font-semibold text-slate-300">Issues Found</h5>
                                {scan.issues.map((issue) => (
                                    <div key={issue.id} className="bg-white/5 rounded p-3 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-mono text-red-300">{issue.id}</span>
                                            <span className="text-xs text-slate-500">{issue.severity}</span>
                                        </div>
                                        <p className="font-semibold text-white">{issue.title}</p>
                                        <p className="text-slate-400 mt-1">{issue.description}</p>
                                        <p className="text-slate-500 text-xs mt-2 font-mono">{issue.file}:{issue.line}</p>
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
