import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Wifi, Layers, ShieldCheck, Smartphone } from 'lucide-react';
import { api } from '../services/api';

interface NetworkSlice {
    id: string;
    name: string;
    devices: number;
    bandwidth: string;
    isolation: string;
    security: string;
    last_audit: string;
}

export function IoTSlicingPage() {
    const [slices, setSlices] = useState<NetworkSlice[]>([]);

    useEffect(() => {
        const fetchSlices = async () => {
            try {
                const data = await api.getIoTSlices();
                setSlices(data || []);
            } catch (error) {
                console.error("Failed to fetch IoT slices:", error);
            }
        };
        fetchSlices();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wifi className="text-green-400" />
                5G/IoT Security Slicing
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-900/20 border-green-500/30">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Active Slices</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {slices.length}
                                </p>
                            </div>
                            <Layers className="text-green-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {slices.map(s => (
                    <Card key={s.id} className="border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Smartphone size={18} className="text-green-400" />
                                {s.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.security.includes('Critical') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {s.security}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Devices: <span className="text-white font-bold">{s.devices}</span></p>
                                    <p className="text-sm text-gray-400">Bandwidth: <span className="text-green-400">{s.bandwidth}</span></p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        <ShieldCheck size={12} /> Isolation: {s.isolation}
                                    </p>
                                </div>

                                <div className="text-xs text-gray-500 text-right">
                                    Last Audit: {new Date(s.last_audit).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
