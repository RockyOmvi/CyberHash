import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Activity, Shield, AlertTriangle, Server, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api, Vulnerability } from '../services/api';
import { wsService } from '../services/websocket';

const useWebSocket = () => {
    const [messages, setMessages] = useState<string[]>([]);
    useEffect(() => {
        wsService.connect();
        const unsubscribe = wsService.subscribe((msg) => {
            setMessages(prev => [msg.message, ...prev].slice(0, 50));
        });
        return () => unsubscribe();
    }, []);
    return { messages };
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vulns: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        score: 85
    });
    const { messages } = useWebSocket();
    const [logs, setLogs] = useState<string[]>([]);

    const [topVulns, setTopVulns] = useState<Vulnerability[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await api.getDashboardStats();
                setStats(statsData);

                const historyData = await api.getScanHistory();
                if (historyData.scans && historyData.scans.length > 0) {
                    // Flatten all vulnerabilities from all scans
                    const allVulns: Vulnerability[] = historyData.scans.flatMap((scan: any) => scan.vulnerabilities || []);
                    // Sort by severity (Critical > High > Medium > Low)
                    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                    allVulns.sort((a, b) => (severityOrder[a.severity as keyof typeof severityOrder] ?? 4) - (severityOrder[b.severity as keyof typeof severityOrder] ?? 4));
                    setTopVulns(allVulns.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setLogs(prev => [messages[messages.length - 1], ...prev].slice(0, 10));
        }
    }, [messages]);

    const trendData = [
        { name: 'Mon', vulns: 40 },
        { name: 'Tue', vulns: 30 },
        { name: 'Wed', vulns: 45 },
        { name: 'Thu', vulns: 25 },
        { name: 'Fri', vulns: 55 },
        { name: 'Sat', vulns: 20 },
        { name: 'Sun', vulns: 15 },
    ];

    const complianceData = [
        { name: 'ISO 27001', score: 85 },
        { name: 'GDPR', score: 92 },
        { name: 'NIST', score: 78 },
        { name: 'PCI DSS', score: 88 },
    ];

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-900/20 to-black border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-400">Security Score</CardTitle>
                        <Shield className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.score}/100</div>
                        <p className="text-xs text-blue-300/70 mt-1">+2.5% from last week</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.score}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-900/20 to-black border-red-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-400">Critical Threats</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.critical}</div>
                        <p className="text-xs text-red-300/70 mt-1">Requires immediate attention</p>
                        <div className="flex gap-2 mt-3">
                            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">SQLi</Badge>
                            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">RCE</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-400">Active Services</CardTitle>
                        <Server className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">24/24</div>
                        <p className="text-xs text-green-300/70 mt-1">All systems operational</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
                            <Activity className="h-3 w-3 animate-pulse" />
                            <span>Live Monitoring Active</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-400">AI Remediation</CardTitle>
                        <Lock className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                        <p className="text-xs text-purple-300/70 mt-1">Fixes ready to deploy</p>
                        <Button size="sm" className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white border-none" onClick={() => navigate('/vulnerabilities')}>
                            Review Fixes
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Vulnerability Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorVulns" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="vulns" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVulns)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={complianceData} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#ffffff05' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {complianceData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">{item.name}</span>
                                    <span className={item.score >= 90 ? "text-green-400" : item.score >= 80 ? "text-yellow-400" : "text-red-400"}>
                                        {item.score}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Logs */}
                <Card className="h-[400px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Live Security Feed</CardTitle>
                        <Badge variant="outline" className="animate-pulse text-green-400 border-green-500/30">Live</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto space-y-2 pr-2 font-mono text-xs">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 italic">Waiting for events...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="p-2 rounded bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition-colors">
                                        <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Vulnerabilities */}
                <Card className="h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Top Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Severity</th>
                                    <th className="px-4 py-3">Vulnerability</th>
                                    <th className="px-4 py-3 rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {topVulns.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-center text-gray-500">No vulnerabilities found.</td>
                                    </tr>
                                ) : (
                                    topVulns.map((vuln, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <Badge variant={vuln.severity === 'Critical' ? 'destructive' : vuln.severity === 'High' ? 'warning' : 'secondary'}>
                                                    {vuln.severity}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-white">{vuln.title}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('/vulnerabilities')}>Fix</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
