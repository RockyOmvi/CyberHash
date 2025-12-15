import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { api } from '../services/api';

interface SBOMComponent {
    id: string;
    name: string;
    version: string;
    license: string;
    vulnerabilities: number;
    project: string;
    last_scanned: string;
}

export function SBOMPage() {
    const [components, setComponents] = useState<SBOMComponent[]>([]);

    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const data = await api.getSBOMComponents();
                setComponents(data || []);
            } catch (error) {
                console.error("Failed to fetch SBOM components:", error);
            }
        };
        fetchComponents();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="text-blue-400" />
                Software Bill of Materials (SBOM) Manager
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Vulnerable Components</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {components.filter(c => c.vulnerabilities > 0).length}
                                </p>
                            </div>
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {components.map(c => (
                    <Card key={c.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Package size={18} className="text-blue-400" />
                                {c.name} <span className="text-gray-500 text-sm">v{c.version}</span>
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${c.vulnerabilities > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                {c.vulnerabilities} Vulns
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Project: <span className="text-white font-mono">{c.project}</span></p>
                                    <p className="text-sm text-gray-400">License: <span className="text-blue-400 font-bold">{c.license}</span></p>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Scanned: {new Date(c.last_scanned).toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
