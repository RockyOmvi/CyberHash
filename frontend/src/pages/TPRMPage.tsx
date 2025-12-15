import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Building, AlertOctagon, CheckCircle, FileWarning } from 'lucide-react';
import { api } from '../services/api';

interface VendorRisk {
    id: string;
    vendor: string;
    risk_score: number;
    tier: string;
    issues: string[];
    last_audit: string;
}

export function TPRMPage() {
    const [vendors, setVendors] = useState<VendorRisk[]>([]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const data = await api.getVendorRisks();
                setVendors(data || []);
            } catch (error) {
                console.error("Failed to fetch vendor risks:", error);
            }
        };
        fetchVendors();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building className="text-orange-400" />
                Third-Party Risk Management (TPRM)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-900/20 border-orange-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Critical Vendors</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {vendors.filter(v => v.tier === 'Critical').length}
                                </p>
                            </div>
                            <AlertOctagon className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {vendors.map(v => (
                    <Card key={v.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Building size={18} className="text-orange-400" />
                                {v.vendor}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${v.risk_score > 50 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                Risk Score: {v.risk_score}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>Tier: <span className={`font-bold ${v.tier === 'Critical' ? 'text-red-400' : 'text-gray-300'}`}>{v.tier}</span></span>
                                    <span>Last Audit: {new Date(v.last_audit).toLocaleDateString()}</span>
                                </div>

                                {v.issues.length > 0 ? (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Issues:</p>
                                        {v.issues.map((issue, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-red-300">
                                                <FileWarning size={12} /> {issue}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-green-400">
                                        <CheckCircle size={14} /> No active issues
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
