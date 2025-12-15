import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { GitCommit, Code, Cloud, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface Trace {
    vuln_id: string;
    runtime_resource: string;
    repo: string;
    commit_hash: string;
    file_path: string;
    line_number: number;
    developer: string;
}

export function CodeContextPage() {
    const [traces, setTraces] = useState<Trace[]>([]);

    useEffect(() => {
        const fetchTraces = async () => {
            try {
                const data = await api.getContextTrace();
                setTraces(data || []);
            } catch (error) {
                console.error("Failed to fetch context traces:", error);
            }
        };
        fetchTraces();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Code className="text-orange-400" />
                Code-to-Cloud Contextualization
            </h1>

            <div className="grid grid-cols-1 gap-4">
                {traces.map((trace, index) => (
                    <Card key={index} className="bg-black/40 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-mono text-gray-400">
                                <span className="text-red-400">{trace.vuln_id}</span>
                                <ArrowRight size={14} />
                                <span className="text-blue-400">{trace.runtime_resource}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Runtime Context */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Cloud size={16} className="text-blue-400" />
                                        <span className="font-semibold">Runtime Asset</span>
                                    </div>
                                    <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded text-sm text-blue-200 font-mono">
                                        {trace.runtime_resource}
                                    </div>
                                </div>

                                <ArrowRight className="hidden md:block text-gray-600 mt-8" />

                                {/* Code Context */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <GitCommit size={16} className="text-orange-400" />
                                        <span className="font-semibold">Root Cause (Git)</span>
                                    </div>
                                    <div className="p-3 bg-orange-900/20 border border-orange-500/20 rounded text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Repo:</span>
                                            <span className="text-white font-mono">{trace.repo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Commit:</span>
                                            <span className="text-orange-400 font-mono">{trace.commit_hash}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">File:</span>
                                            <span className="text-white font-mono">{trace.file_path}:{trace.line_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Author:</span>
                                            <span className="text-white">{trace.developer}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
