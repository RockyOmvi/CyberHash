import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { api, ScanResult, Vulnerability } from '../services/api';

interface ComplianceStandard {
    name: string;
    description: string;
    controls: {
        id: string;
        description: string;
        status: 'pass' | 'fail';
        issues: Vulnerability[];
    }[];
}

export function CompliancePage() {
    const [standards, setStandards] = useState<ComplianceStandard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplianceData();
    }, []);

    const loadComplianceData = async () => {
        try {
            const history = await api.getScanHistory() as ScanResult[];
            if (history.length === 0) {
                setLoading(false);
                return;
            }

            // Use the latest scan for compliance status
            const latestScan = history[0];
            const vulns = latestScan.vulnerabilities || [];

            // Define standards and controls
            const iso27001: ComplianceStandard = {
                name: 'ISO 27001',
                description: 'Information Security Management',
                controls: [
                    { id: 'A.12.6.1', description: 'Management of technical vulnerabilities', status: 'pass', issues: [] },
                    { id: 'A.14.1.2', description: 'Securing application services on public networks', status: 'pass', issues: [] },
                    { id: 'A.14.1.3', description: 'Protecting application services transactions', status: 'pass', issues: [] },
                    { id: 'A.14.2.6', description: 'Secure development environment', status: 'pass', issues: [] },
                    { id: 'A.9.2.1', description: 'User registration and de-registration', status: 'pass', issues: [] },
                ]
            };

            const gdpr: ComplianceStandard = {
                name: 'GDPR',
                description: 'General Data Protection Regulation',
                controls: [
                    { id: 'Art. 32', description: 'Security of processing', status: 'pass', issues: [] },
                ]
            };

            const nist: ComplianceStandard = {
                name: 'NIST CSF',
                description: 'Cybersecurity Framework',
                controls: [
                    { id: 'PR.IP-1', description: 'Data is protected at rest', status: 'pass', issues: [] },
                    { id: 'ID.SC-1', description: 'Cyber supply chain risk management processes are identified', status: 'pass', issues: [] },
                    { id: 'DE.CM-8', description: 'Vulnerability scans are performed', status: 'pass', issues: [] },
                ]
            };

            const allStandards = [iso27001, gdpr, nist];

            // Map vulnerabilities to controls
            vulns.forEach(v => {
                if (v.compliance) {
                    v.compliance.forEach(tag => {
                        const [stdName, controlId] = tag.split(': ');

                        const standard = allStandards.find(s => s.name === stdName);
                        if (standard) {
                            const control = standard.controls.find(c => c.id === controlId);
                            if (control) {
                                control.status = 'fail';
                                control.issues.push(v);
                            }
                        }
                    });
                }
            });

            setStandards(allStandards);
        } catch (error) {
            console.error("Failed to load compliance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-400">Loading compliance data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="text-emerald-400" />
                        Compliance Dashboard
                    </h2>
                    <p className="text-slate-400 mt-1">Automated mapping of security findings to compliance controls</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5">
                        <span className="text-xs text-slate-400 block">Standards Monitored</span>
                        <span className="text-xl font-bold text-white">{standards.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {standards.map((std, idx) => (
                    <div key={idx} className="glass-surface p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{std.name}</h3>
                                <p className="text-sm text-slate-400">{std.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {std.controls.every(c => c.status === 'pass') ? (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle size={12} /> Compliant
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/20 flex items-center gap-1">
                                        <XCircle size={12} /> Non-Compliant
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {std.controls.map((control, cIdx) => (
                                <div key={cIdx} className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {control.status === 'pass' ? (
                                                <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                                            ) : (
                                                <XCircle className="text-red-500 shrink-0" size={18} />
                                            )}
                                            <div>
                                                <span className="font-mono text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded mr-2">{control.id}</span>
                                                <span className={`text-sm font-medium ${control.status === 'pass' ? 'text-slate-300' : 'text-white'}`}>
                                                    {control.description}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {control.issues.length > 0 && (
                                        <div className="ml-8 mt-3 space-y-2">
                                            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                {control.issues.length} Violation{control.issues.length > 1 ? 's' : ''} Detected:
                                            </p>
                                            <div className="space-y-1">
                                                {control.issues.map((issue, iIdx) => (
                                                    <div key={iIdx} className="text-xs text-slate-400 bg-red-500/5 border border-red-500/10 rounded px-2 py-1.5 flex justify-between items-center">
                                                        <span>{issue.title}</span>
                                                        <span className="text-[10px] uppercase tracking-wider opacity-70">{issue.severity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
