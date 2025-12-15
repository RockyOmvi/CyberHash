import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Mail, Plus, Users, MousePointer, Send } from 'lucide-react';
import { api } from '../services/api';

interface Campaign {
    id: string;
    name: string;
    template_id: string;
    target_count: number;
    sent_count: number;
    click_count: number;
    status: string;
    created_at: string;
}

interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export function PhishingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newTemplate, setNewTemplate] = useState('');
    const [newTargets, setNewTargets] = useState(10);

    const fetchData = async () => {
        try {
            const [campaignsData, templatesData] = await Promise.all([
                api.getPhishingCampaigns(),
                api.getPhishingTemplates()
            ]);
            setCampaigns(campaignsData || []);
            setTemplates(templatesData || []);
        } catch (error) {
            console.error("Failed to fetch phishing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async () => {
        try {
            await api.createPhishingCampaign(newName, newTemplate, newTargets);
            setShowNewForm(false);
            setNewName('');
            setNewTemplate('');
            fetchData();
        } catch (error) {
            console.error("Failed to create campaign:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Mail className="text-blue-400" />
                    Phishing Simulation
                </h1>
                <Button onClick={() => setShowNewForm(!showNewForm)}>
                    <Plus size={16} className="mr-2" />
                    New Campaign
                </Button>
            </div>

            {showNewForm && (
                <Card className="bg-blue-900/10 border-blue-500/20">
                    <CardHeader>
                        <CardTitle>Launch New Campaign</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Campaign Name</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g., Q4 Security Test"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email Template</label>
                            <select
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                                value={newTemplate}
                                onChange={(e) => setNewTemplate(e.target.value)}
                            >
                                <option value="">Select a template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Target Users (Simulated)</label>
                            <input
                                type="number"
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                                value={newTargets}
                                onChange={(e) => setNewTargets(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={!newName || !newTemplate}>Launch Campaign</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Campaigns</p>
                                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                            </div>
                            <Mail className="text-blue-400 opacity-50" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Emails Sent</p>
                                <p className="text-2xl font-bold text-white">
                                    {campaigns.reduce((acc, c) => acc + c.sent_count, 0)}
                                </p>
                            </div>
                            <Send className="text-green-400 opacity-50" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Click Rate</p>
                                <p className="text-2xl font-bold text-white">
                                    {campaigns.length > 0
                                        ? Math.round((campaigns.reduce((acc, c) => acc + c.click_count, 0) / Math.max(1, campaigns.reduce((acc, c) => acc + c.sent_count, 0))) * 100)
                                        : 0}%
                                </p>
                            </div>
                            <MousePointer className="text-red-400 opacity-50" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Targets</th>
                                    <th className="px-4 py-3">Sent</th>
                                    <th className="px-4 py-3">Clicked</th>
                                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No campaigns found. Start one to test your users.
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map(c => (
                                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={c.status === 'Completed' ? 'default' : 'secondary'}>
                                                    {c.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{c.target_count}</td>
                                            <td className="px-4 py-3 text-green-400">{c.sent_count}</td>
                                            <td className="px-4 py-3 text-red-400 font-bold">{c.click_count}</td>
                                            <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
