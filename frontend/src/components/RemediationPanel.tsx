import { useState, useEffect } from 'react';
import { Wand2, Copy, Check, X } from 'lucide-react';
import { api, Vulnerability } from '../services/api';

interface RemediationPanelProps {
    vulnerability: Vulnerability | null;
    onClose: () => void;
}

export function RemediationPanel({ vulnerability, onClose }: RemediationPanelProps) {
    const [fix, setFix] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (vulnerability) {
            generateFix();
        }
    }, [vulnerability]);

    const generateFix = async () => {
        if (!vulnerability) return;
        setLoading(true);
        try {
            const data = await api.remediate(vulnerability.title, vulnerability.description, 'Go/Gin');
            setFix(data.fix);
        } catch (err) {
            setFix('Failed to generate fix.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fix);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!vulnerability) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0a0f1e] border border-cyan-500/30 rounded-xl w-full max-w-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Wand2 size={18} />
                        <h3 className="font-semibold">AI Remediation Engine</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Vulnerability</h4>
                        <p className="text-white text-lg font-medium">{vulnerability.title}</p>
                    </div>

                    <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                            <span className="text-xs font-mono text-slate-400">Suggested Fix</span>
                            <button
                                onClick={copyToClipboard}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <div className="p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                            {loading ? (
                                <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                                    <Wand2 size={16} className="animate-spin" /> Generating secure code...
                                </div>
                            ) : (
                                <pre>{fix}</pre>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
