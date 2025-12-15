import { useEffect, useState } from 'react';
import { api, Vulnerability } from '../services/api';
import { VulnerabilityList } from '../components/VulnerabilityList';
import { RemediationModal } from '../components/RemediationModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function VulnerabilitiesPage() {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

    useEffect(() => {
        const fetchVulns = async () => {
            try {
                const history = await api.getScanHistory();
                if (history.scans) {
                    const allVulns: Vulnerability[] = history.scans.flatMap((scan: any) => scan.vulnerabilities || []);
                    setVulnerabilities(allVulns);
                }
            } catch (error) {
                console.error("Failed to fetch vulnerabilities:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVulns();
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-400" size={24} />
                        Vulnerability Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-400" size={32} />
                        </div>
                    ) : (
                        <VulnerabilityList
                            vulnerabilities={vulnerabilities}
                            onRemediate={(vuln) => setSelectedVuln(vuln)}
                        />
                    )}
                </CardContent>
            </Card>

            {selectedVuln && (
                <RemediationModal
                    vulnerability={selectedVuln}
                    onClose={() => setSelectedVuln(null)}
                />
            )}
        </div>
    );
}
