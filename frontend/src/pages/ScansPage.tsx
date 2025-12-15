import { useNavigate } from 'react-router-dom';
import { ScanForm } from '../components/ScanForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Scan } from 'lucide-react';

export function ScansPage() {
    const navigate = useNavigate();

    const handleScanStarted = () => {
        // Navigate to history or show success
        // For now, let's go to history to see the new scan
        navigate('/history');
    };

    return (
        <div className="space-y-6">
            <ScanForm onScanStarted={handleScanStarted} />

            <Card className="bg-blue-500/5 border-blue-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                        <Scan size={20} />
                        Scan Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-400 space-y-2">
                    <p>
                        Starting a scan will queue a job in the Orchestrator. The system will use available scanners (ZAP, Trivy, etc.) to analyze the target.
                    </p>
                    <p>
                        You can view the progress and results in the <strong>Scan History</strong> page.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
