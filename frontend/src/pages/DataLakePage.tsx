import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Database, Play, Clock, User } from 'lucide-react';
import { api } from '../services/api';

interface DataLakeQuery {
    id: string;
    query: string;
    status: string;
    result_count: number;
    duration: string;
    executed_by: string;
    timestamp: string;
}

export function DataLakePage() {
    const [queries, setQueries] = useState<DataLakeQuery[]>([]);

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                const data = await api.getDataLakeQueries();
                setQueries(data || []);
            } catch (error) {
                console.error("Failed to fetch data lake queries:", error);
            }
        };
        fetchQueries();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="text-teal-400" />
                Security Data Lake
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-teal-900/20 border-teal-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Queries</p>
                                <p className="text-2xl font-bold text-teal-500">
                                    {queries.filter(q => q.status === 'Running').length}
                                </p>
                            </div>
                            <Play className="text-teal-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {queries.map(q => (
                    <Card key={q.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Database size={18} className="text-teal-400" />
                                Query ID: {q.id}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${q.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {q.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto mb-4">
                                <span className="text-teal-400">SQL&gt;</span> {q.query}
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {q.duration}</span>
                                    <span className="flex items-center gap-1"><User size={14} /> {q.executed_by}</span>
                                </div>
                                <div>
                                    {q.result_count} rows returned
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 text-right">
                                {new Date(q.timestamp).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
