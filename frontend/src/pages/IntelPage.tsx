import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Radar, ShieldAlert, Tag, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface ThreatIntel {
    id: string;
    indicator: string;
    type: string;
    source: string;
    confidence: number;
    tags: string[];
    first_seen: string;
}

export function IntelPage() {
    const [feeds, setFeeds] = useState<ThreatIntel[]>([]);

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const data = await api.getThreatFeeds();
                setFeeds(data || []);
            } catch (error) {
                console.error("Failed to fetch threat feeds:", error);
            }
        };
        fetchFeeds();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Radar className="text-red-500" />
                Threat Intelligence Feeds
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">High Confidence Indicators</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {feeds.filter(f => f.confidence > 90).length}
                                </p>
                            </div>
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {feeds.map(f => (
                    <Card key={f.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Radar size={18} className="text-red-400" />
                                <span className="font-mono">{f.indicator}</span>
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${f.confidence > 80 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {f.confidence}% Confidence
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Type: <span className="text-white font-bold">{f.type}</span></p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        Source: <span className="text-blue-400">{f.source}</span> <ExternalLink size={10} />
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {f.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-right">
                                First Seen: {new Date(f.first_seen).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
