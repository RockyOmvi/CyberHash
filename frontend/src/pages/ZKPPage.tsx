import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Fingerprint, CheckCircle, Shield, Lock } from 'lucide-react';
import { api } from '../services/api';

interface ZKPRequest {
    proof_id: string;
    user: string;
    claim: string;
    status: string;
    verified_at: string;
}

export function ZKPPage() {
    const [proofs, setProofs] = useState<ZKPRequest[]>([]);

    useEffect(() => {
        const fetchProofs = async () => {
            try {
                const data = await api.getZKPProofs();
                setProofs(data || []);
            } catch (error) {
                console.error("Failed to fetch ZKP proofs:", error);
            }
        };
        fetchProofs();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Fingerprint className="text-cyan-400" />
                Zero-Knowledge Proof Identity Verification
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-cyan-900/20 border-cyan-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Verified Proofs (Last 24h)</p>
                                <p className="text-2xl font-bold text-cyan-400">{proofs.length}</p>
                            </div>
                            <Shield className="text-cyan-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Privacy Preserved</p>
                                <p className="text-2xl font-bold text-white">100%</p>
                            </div>
                            <Lock className="text-green-400" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Identity Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Verified At</th>
                                    <th className="px-4 py-3">Proof ID</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Claim</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {proofs.map(p => (
                                    <tr key={p.proof_id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">{new Date(p.verified_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-mono text-gray-500">{p.proof_id}</td>
                                        <td className="px-4 py-3 font-medium text-white">{p.user}</td>
                                        <td className="px-4 py-3 text-cyan-300">{p.claim}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold">{p.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
