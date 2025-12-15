import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Mail, MessageSquare, Phone, Users, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface SocialCampaign {
    id: string;
    name: string;
    type: string;
    targets: number;
    clicked: number;
    compromised: number;
    status: string;
    launched_at: string;
}

export function SocialEngPage() {
    const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await api.getSocialCampaigns();
                setCampaigns(data || []);
            } catch (error) {
                console.error("Failed to fetch social campaigns:", error);
            }
        };
        fetchCampaigns();
    }, []);

    const getTypeIcon = (type: string) => {
        if (type.includes('Phishing')) return <Mail className="text-yellow-400" />;
        if (type.includes('Smishing')) return <MessageSquare className="text-blue-400" />;
        if (type.includes('Vishing')) return <Phone className="text-purple-400" />;
        return <AlertCircle className="text-gray-400" />;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="text-pink-500" />
                Social Engineering Campaign Manager
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-pink-900/20 border-pink-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Compromised Users</p>
                                <p className="text-2xl font-bold text-pink-500">
                                    {campaigns.reduce((acc, c) => acc + c.compromised, 0)}
                                </p>
                            </div>
                            <AlertCircle className="text-pink-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {campaigns.map(c => (
                    <Card key={c.id} className="border-white/10 bg-black/40">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(c.type)}
                                        <h3 className="text-lg font-bold text-white">{c.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">{c.type}</p>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {c.status}
                                    </span>
                                </div>

                                <div className="flex-1 w-full grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Targets</p>
                                        <p className="text-xl font-bold text-white">{c.targets}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Clicked</p>
                                        <p className="text-xl font-bold text-yellow-400">{c.clicked}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Compromised</p>
                                        <p className="text-xl font-bold text-red-500">{c.compromised}</p>
                                    </div>
                                </div>

                                <div className="md:w-48">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Click Rate</span>
                                        <span className="text-white font-bold">
                                            {c.targets > 0 ? Math.round((c.clicked / c.targets) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{ width: `${c.targets > 0 ? (c.clicked / c.targets) * 100 : 0}%` }}
                                        />
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
