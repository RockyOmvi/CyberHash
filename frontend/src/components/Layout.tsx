import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    MessageSquare,
    Scan,
    AlertTriangle,
    FileCheck,
    Puzzle,
    Settings,
    Search,
    Bell,
    Menu,
    X,
    Cloud,
    Box,
    Code,
    Mail,
    Cpu,
    UserCheck,
    GitGraph,
    RefreshCw,
    Mic,
    GitCommit,
    Key,
    Fingerprint,
    UserMinus,
    Crosshair,
    Globe,
    Globe2,
    Binary,
    ShieldAlert,
    Users,
    Terminal,
    Lock,
    UploadCloud,
    Network,
    Bug,
    Activity,
    CloudLightning,
    GitBranch,
    FileCode,
    Bot,
    Package,
    Database,
    Radar,
    Archive,
    Building,
    ScrollText,
    Brain,
    Atom,
    Wifi,
    Copy,
    Eye
} from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Threat Hunter', path: '/threat-hunting', icon: MessageSquare },
        { name: 'Scans', path: '/scans', icon: Scan },
        { name: 'Vulnerabilities', path: '/vulnerabilities', icon: AlertTriangle },
        { name: 'Compliance', path: '/compliance', icon: FileCheck },
        { name: 'Cloud Security', path: '/cloud', icon: Cloud },
        { name: 'IaC Scan', path: '/iac', icon: Code },
        { name: 'Containers', path: '/containers', icon: Box },
        { name: 'Phishing Sim', path: '/phishing', icon: Mail },
        { name: 'Hardware TDT', path: '/hardware', icon: Cpu },
        { name: 'Identity (ITDR)', path: '/identity', icon: UserCheck },
        { name: 'Attack Paths', path: '/apm', icon: GitGraph },
        { name: 'Ephemeral Infra', path: '/ephemeral', icon: RefreshCw },
        { name: 'Deepfake Detect', path: '/deepfake', icon: Mic },
        { name: 'Code Context', path: '/code-context', icon: GitCommit },
        { name: 'Secrets Mesh', path: '/secrets', icon: Key },
        { name: 'ZKP Identity', path: '/zkp', icon: Fingerprint },
        { name: 'Insider Threat', path: '/insider', icon: UserMinus },
        { name: 'Red Teaming', path: '/cart', icon: Crosshair },
        { name: 'Browser Isolation', path: '/rbi', icon: Globe },
        { name: 'Sovereign Cloud', path: '/sovereign', icon: Globe2 },
        { name: 'Quantum Crypto', path: '/quantum', icon: Binary },
        { name: 'APT Simulation', path: '/redhat/apt', icon: ShieldAlert },
        { name: 'Social Engineering', path: '/redhat/social', icon: Users },
        { name: 'LotL Attacks', path: '/redhat/lotl', icon: Terminal },
        { name: 'Ransomware Sim', path: '/redhat/ransomware', icon: Lock },
        { name: 'Data Exfiltration', path: '/redhat/exfil', icon: UploadCloud },
        { name: 'AD Attack Paths', path: '/redhat/ad', icon: Network },
        { name: 'Zero-Day Sim', path: '/redhat/zeroday', icon: Bug },
        { name: 'eBPF Observability', path: '/redhat/ebpf', icon: Activity },
        { name: 'Serverless Security', path: '/redhat/serverless', icon: CloudLightning },
        { name: 'Cloud Entitlements', path: '/redhat/ciem', icon: Key },
        { name: 'IaC Drift', path: '/redhat/drift', icon: GitBranch },
        { name: 'K8s Admission', path: '/redhat/admission', icon: Shield },
        { name: 'RASP Protection', path: '/redhat/rasp', icon: Shield },
        { name: 'API Schema', path: '/redhat/schema', icon: FileCode },
        { name: 'Bot Management', path: '/redhat/bot', icon: Bot },
        { name: 'SBOM Manager', path: '/redhat/sbom', icon: Package },
        { name: 'DSPM', path: '/redhat/dspm', icon: Database },
        { name: 'EASM', path: '/redhat/easm', icon: Globe },
        { name: 'Threat Intel', path: '/redhat/intel', icon: Radar },
        { name: 'Security Data Lake', path: '/redhat/datalake', icon: Database },
        { name: 'JIT Access', path: '/redhat/jit', icon: Key },
        { name: 'SA Anomalies', path: '/redhat/sa-anomaly', icon: UserCheck },
        { name: 'Evidence Collection', path: '/redhat/evidence', icon: Archive },
        { name: 'TPRM', path: '/redhat/tprm', icon: Building },
        { name: 'Policy-as-Code', path: '/redhat/policy', icon: ScrollText },
        { name: 'LLM Firewall', path: '/redhat/llm-firewall', icon: Brain },
        { name: 'Quantum VPN', path: '/redhat/quantum', icon: Atom },
        { name: '5G/IoT Slicing', path: '/redhat/iot-slicing', icon: Wifi },
        { name: 'Digital Twin', path: '/redhat/digital-twin', icon: Copy },
        { name: 'God Mode', path: '/redhat/god-mode', icon: Eye },
        { name: 'Integrations', path: '/integrations', icon: Puzzle },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full lg:hidden"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wider text-blue-500">
                        <Shield className="h-8 w-8" />
                        <span>CYBERSHIELD</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={clsx("h-5 w-5", isActive ? "text-blue-400" : "text-gray-500")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-400 hover:text-white">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden md:flex items-center text-sm text-gray-500">
                            <span className="hover:text-white cursor-pointer">Home</span>
                            <span className="mx-2">/</span>
                            <span className="text-white font-medium capitalize">{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-9 w-64 rounded-full bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-[url('/grid-pattern.svg')] bg-fixed">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
