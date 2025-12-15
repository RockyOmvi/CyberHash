import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { UserMinus, TrendingUp, AlertOctagon, Eye } from 'lucide-react';
import { api } from '../services/api';

interface InsiderRisk {
    user: string;
    department: string;
    risk_score: number;
    indicators: string[];
    prediction: string;
    last_updated: string;
}

export function InsiderPage() {
    const [risks, setRisks] = useState<InsiderRisk[]>([]);

    useEffect(() => {
        const fetchRisks = async () => {
            try {
                const data = await api.getInsiderPredictions();
                setRisks(data || []);
            } catch (error) {
                console.error("Failed to fetch insider risks:", error);
            }
        };
        fetchRisks();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserMinus className="text-orange-500" />
                Insider Threat "Pre-Crime" Prediction
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-900/20 border-orange-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">High Risk Users</p>
                                <p className="text-2xl font-bold text-orange-500">
                                    {risks.filter(r => r.risk_score > 80).length}
                                </p>
                            </div>
                            <AlertOctagon className="text-orange-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {risks.map((risk, idx) => (
                    <Card key={idx} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white">
                                {risk.user}
                            </CardTitle>
                            <span className="text-sm text-gray-400">{risk.department}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Risk Score</span>
                                    <span className={`font-bold ${risk.risk_score > 80 ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {risk.risk_score}/100
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${risk.risk_score > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${risk.risk_score}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                                    <p className="text-xs text-red-400 uppercase font-bold mb-1">AI Prediction</p>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <TrendingUp size={16} />
                                        {risk.prediction}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Behavioral Indicators:</p>
                                    <ul className="space-y-1">
                                        {risk.indicators.map((ind, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <Eye size={14} className="mt-1 text-blue-400" />
                                                {ind}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
