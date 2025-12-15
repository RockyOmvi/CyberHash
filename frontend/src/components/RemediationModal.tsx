import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { api, Vulnerability } from '../services/api';

interface RemediationModalProps {
    vulnerability: Vulnerability | null;
    onClose: () => void;
}

export function RemediationModal({ vulnerability, onClose }: RemediationModalProps) {
    const [loading, setLoading] = useState(false);
    const [fix, setFix] = useState<string | null>(null);
    const [error, setError] = useState('');

    if (!vulnerability) return null;

    const handleGenerateFix = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await api.remediate(
                vulnerability.title,
                vulnerability.description,
                "Go, Gin, GORM, React, TypeScript" // Default tech stack for now
            );
            setFix(result.fix);
        } catch (err) {
            setError('Failed to generate fix. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="text-yellow-400" size={24} />
                        AI Remediation
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Vulnerability</h4>
                        <p className="text-white text-lg">{vulnerability.title}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{vulnerability.description}</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {fix ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={20} />
                                <span className="font-medium">Fix Generated Successfully</span>
                            </div>
                            <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                                <pre>{fix}</pre>
                            </div>
                            <p className="text-xs text-gray-500">
                                Review the code above before applying it to your codebase.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-6 text-center">
                            <p className="text-blue-300 mb-4">
                                Use Gemini AI to analyze this vulnerability and generate a code fix.
                            </p>
                            <Button onClick={handleGenerateFix} disabled={loading} className="w-full sm:w-auto">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Generating Fix...
                                    </>
                                ) : (
                                    'Generate Fix with AI'
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    {fix && <Button onClick={() => { /* Apply fix logic */ onClose(); }}>Apply Fix</Button>}
                </div>
            </div>
        </div>
    );
}
