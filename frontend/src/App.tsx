import { useState, useEffect } from 'react';
import {
    Activity,
    Server,
    ShieldAlert,
    History
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ScanForm } from './components/ScanForm';
import { VulnerabilityList } from './components/VulnerabilityList';
import { RemediationPanel } from './components/RemediationPanel';
import { api, Vulnerability } from './services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { display: false },
        y: { display: false }
    },
    animation: { duration: 2000 }
};

const chartData = {
    labels: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    datasets: [{
        label: 'Requests',
        data: [45, 52, 49, 62, 58, 65, 75, 68, 72, 85, 80, 92],
        borderColor: '#22d3ee',
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
            gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
            return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4
    }]
};

function App() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'history'>('dashboard');
    const [currentScanId, setCurrentScanId] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<string>('');
    const [scanResults, setScanResults] = useState<Vulnerability[]>([]);
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

    // Poll for scan status
    useEffect(() => {
        let interval: any;
        if (currentScanId && scanStatus !== 'completed' && scanStatus !== 'failed') {
            interval = setInterval(async () => {
                try {
                    const data = await api.getScanStatus(currentScanId);
                    setScanStatus(data.status);
                    if (data.status === 'completed' && data.results) {
                        setScanResults(data.results.vulnerabilities || []);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [currentScanId, scanStatus]);

    const handleScanStarted = (id: string) => {
        setCurrentScanId(id);
        setScanStatus('queued');
        setActiveTab('scan');
    };

    return (
        <div className="text-slate-300 antialiased selection:bg-blue-500/30 selection:text-blue-200 font-sans bg-[#020204] min-h-screen relative overflow-x-hidden">

            {/* Background Effects */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020204]/80 to-transparent blur-[80px]"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#030508]/60 backdrop-blur-xl">
                <div className="flex max-w-7xl mx-auto px-6 py-4 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <a href="#" className="flex items-center gap-2 group">
                            <div className="flex text-xs font-bold text-black bg-gradient-to-br from-cyan-400 to-blue-600 w-6 h-6 rounded items-center justify-center">S</div>
                            <span className="text-sm font-semibold text-white tracking-tight">SENTRIX</span>
                        </a>
                        <div className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'}`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('scan')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scan' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'}`}
                            >
                                Scans
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'}`}
                            >
                                History
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20">
                            <div className={`w-1.5 h-1.5 rounded-full ${scanStatus === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-cyan-400'}`}></div>
                            <span className="text-[10px] font-semibold text-cyan-300 tracking-wide">
                                {scanStatus === 'running' ? 'SCANNING...' : 'SYSTEM READY'}
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative pt-24 pb-12 px-6 max-w-7xl mx-auto">

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-surface p-6 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Active Threats</p>
                                        <h3 className="text-3xl font-bold text-white mt-1">{scanResults.length > 0 ? scanResults.length : 0}</h3>
                                    </div>
                                    <ShieldAlert className="text-red-400" />
                                </div>
                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full w-[45%]"></div>
                                </div>
                            </div>
                            <div className="glass-surface p-6 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Scans Today</p>
                                        <h3 className="text-3xl font-bold text-white mt-1">12</h3>
                                    </div>
                                    <Activity className="text-cyan-400" />
                                </div>
                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-cyan-500 h-full w-[70%]"></div>
                                </div>
                            </div>
                            <div className="glass-surface p-6 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">System Health</p>
                                        <h3 className="text-3xl font-bold text-white mt-1">98%</h3>
                                    </div>
                                    <Server className="text-emerald-400" />
                                </div>
                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[98%]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="glass-surface p-6 rounded-xl border border-white/10 h-[300px]">
                            <h3 className="text-sm font-semibold text-white mb-4">Traffic Analysis</h3>
                            <div className="h-[220px] w-full">
                                <Line options={chartOptions} data={chartData} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'scan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <ScanForm onScanStarted={handleScanStarted} />

                            {/* Scan Status Card */}
                            {currentScanId && (
                                <div className="glass-surface p-6 rounded-xl border border-white/10">
                                    <h3 className="text-sm font-semibold text-white mb-4">Current Scan Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">ID</span>
                                            <span className="font-mono text-cyan-400">{currentScanId.substring(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Status</span>
                                            <span className={`capitalize ${scanStatus === 'completed' ? 'text-emerald-400' :
                                                scanStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'
                                                }`}>{scanStatus}</span>
                                        </div>
                                        {scanStatus === 'running' && (
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden animate-pulse">
                                                <div className="bg-cyan-500 h-full w-[60%] animate-flow"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            <div className="glass-surface p-6 rounded-xl border border-white/10 min-h-[500px]">
                                <h3 className="text-lg font-semibold text-white mb-6">Scan Results</h3>
                                <VulnerabilityList
                                    vulnerabilities={scanResults}
                                    onRemediate={setSelectedVuln}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="glass-surface p-8 rounded-xl border border-white/10 text-center text-slate-500">
                        <History className="mx-auto mb-4 opacity-50" size={48} />
                        <p>Scan history feature coming soon...</p>
                    </div>
                )}

            </main>

            {/* Remediation Modal */}
            {selectedVuln && (
                <RemediationPanel
                    vulnerability={selectedVuln}
                    onClose={() => setSelectedVuln(null)}
                />
            )}

        </div>
    );
}

export default App;
