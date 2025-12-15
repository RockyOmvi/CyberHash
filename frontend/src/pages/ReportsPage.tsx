import { useState } from 'react';
import { FileText, Download, CheckSquare, Square } from 'lucide-react';
import { api } from '../services/api';

export function ReportsPage() {
    const [title, setTitle] = useState("Security Audit Report");
    const [includeVulns, setIncludeVulns] = useState(true);
    const [includeCloud, setIncludeCloud] = useState(true);
    const [includeLogs, setIncludeLogs] = useState(false);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const blob = await api.generateReport({
                title,
                include_vulns: includeVulns,
                include_cloud: includeCloud,
                include_logs: includeLogs,
                format: 'pdf'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to generate report", error);
            alert("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-cyan-400" />
                        Custom Reporting
                    </h2>
                    <p className="text-slate-400 mt-1">Generate tailored security reports</p>
                </div>
            </div>

            <div className="glass-surface p-8 rounded-xl border border-white/10 max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Report Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">Sections to Include</label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setIncludeVulns(!includeVulns)}
                        >
                            {includeVulns ? <CheckSquare className="text-cyan-400" /> : <Square className="text-slate-500" />}
                            <span className="text-slate-200">Vulnerability Scan Results</span>
                        </div>

                        <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setIncludeCloud(!includeCloud)}
                        >
                            {includeCloud ? <CheckSquare className="text-cyan-400" /> : <Square className="text-slate-500" />}
                            <span className="text-slate-200">Cloud Security Posture</span>
                        </div>

                        <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setIncludeLogs(!includeLogs)}
                        >
                            {includeLogs ? <CheckSquare className="text-cyan-400" /> : <Square className="text-slate-500" />}
                            <span className="text-slate-200">System Logs & Events</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {generating ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Download size={20} />
                                Generate PDF Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
