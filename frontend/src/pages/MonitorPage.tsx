import React, { useEffect, useState } from 'react';
import {
    getMonitorLogs,
    getBlockedIPs,
    blockIP,
    unblockIP,
    SecurityLog,
    BlockedIP,
} from '../services/monitorService';

const MonitorPage: React.FC = () => {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
    const [loading, setLoading] = useState(true);
    const [manualIP, setManualIP] = useState('');

    const fetchData = async () => {
        try {
            const [logsData, blockedData] = await Promise.all([
                getMonitorLogs(),
                getBlockedIPs(),
            ]);
            setLogs(logsData);
            setBlockedIPs(blockedData);
        } catch (error) {
            console.error('Failed to fetch monitor data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleBlock = async (ip: string) => {
        try {
            await blockIP(ip, 'Manual Block');
            fetchData();
        } catch (error) {
            alert('Failed to block IP');
        }
    };

    const handleUnblock = async (ip: string) => {
        try {
            await unblockIP(ip);
            fetchData();
        } catch (error) {
            alert('Failed to unblock IP');
        }
    };

    const handleManualBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualIP) return;
        await handleBlock(manualIP);
        setManualIP('');
    };

    if (loading) {
        return <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6 text-cyan-400">Security Monitor</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-gray-400 text-sm">Total Events</h3>
                    <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-gray-400 text-sm">High Risk Attacks</h3>
                    <p className="text-2xl font-bold text-red-500">
                        {logs.filter((l) => l.risk_score >= 50).length}
                    </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-gray-400 text-sm">Blocked IPs</h3>
                    <p className="text-2xl font-bold text-orange-500">{blockedIPs.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Logs */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-300">Live Security Logs</h2>
                    <div className="overflow-y-auto h-96">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-700 text-gray-300 sticky top-0">
                                <tr>
                                    <th className="p-2">Time</th>
                                    <th className="p-2">IP</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Risk</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750">
                                        <td className="p-2 text-gray-400">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-2 font-mono">{log.ip_address}</td>
                                        <td className="p-2">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${log.attack_type === 'None'
                                                    ? 'bg-green-900 text-green-300'
                                                    : 'bg-red-900 text-red-300'
                                                    }`}
                                            >
                                                {log.attack_type}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <span
                                                className={`font-bold ${log.risk_score >= 50 ? 'text-red-500' : 'text-green-500'
                                                    }`}
                                            >
                                                {log.risk_score}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => handleBlock(log.ip_address)}
                                                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                            >
                                                Block
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Blocked IPs & Manual Block */}
                <div className="space-y-8">
                    {/* Manual Block */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-cyan-300">Manual IP Block</h2>
                        <form onSubmit={handleManualBlock} className="flex gap-4">
                            <input
                                type="text"
                                value={manualIP}
                                onChange={(e) => setManualIP(e.target.value)}
                                placeholder="Enter IP Address"
                                className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
                            >
                                Block
                            </button>
                        </form>
                    </div>

                    {/* Blocked List */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-cyan-300">Blocked IPs</h2>
                        <div className="overflow-y-auto h-64">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-700 text-gray-300 sticky top-0">
                                    <tr>
                                        <th className="p-2">IP</th>
                                        <th className="p-2">Reason</th>
                                        <th className="p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blockedIPs.map((blocked) => (
                                        <tr key={blocked.id} className="border-b border-gray-700 hover:bg-gray-750">
                                            <td className="p-2 font-mono">{blocked.ip_address}</td>
                                            <td className="p-2 text-gray-400">{blocked.reason}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleUnblock(blocked.ip_address)}
                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                                >
                                                    Unblock
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorPage;
