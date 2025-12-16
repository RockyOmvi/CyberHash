import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MonitorPage from './pages/MonitorPage';
import { ThreatHuntingPage } from './pages/ThreatHuntingPage';
import { CompliancePage } from './pages/CompliancePage';
import { CloudPage } from './pages/CloudPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { PlaybooksPage } from './pages/PlaybooksPage';
import { ReportsPage } from './pages/ReportsPage';
import { UEBAPage } from './pages/UEBAPage';
import { HoneypotPage } from './pages/HoneypotPage';
import { GatewayPage } from './pages/GatewayPage';
import { ContainerPage } from './pages/ContainerPage';
import { IaCPage } from './pages/IaCPage';
import { PhishingPage } from './pages/PhishingPage';
import { HardwarePage } from './pages/HardwarePage';
import { IdentityPage } from './pages/IdentityPage';
import { APMPage } from './pages/APMPage';
import { EphemeralPage } from './pages/EphemeralPage';
import { DeepfakePage } from './pages/DeepfakePage';
import { CodeContextPage } from './pages/CodeContextPage';
import { SecretsPage } from './pages/SecretsPage';
import { ZKPPage } from './pages/ZKPPage';
import { InsiderPage } from './pages/InsiderPage';
import { CARTPage } from './pages/CARTPage';
import { RBIPage } from './pages/RBIPage';
import { SovereignPage } from './pages/SovereignPage';
import { QuantumPage } from './pages/QuantumPage';
import { APTPage } from './pages/APTPage';
import { SocialEngPage } from './pages/SocialEngPage';
import { LotLPage } from './pages/LotLPage';
import { RansomwarePage } from './pages/RansomwarePage';
import { ExfilPage } from './pages/ExfilPage';
import { ADPage } from './pages/ADPage';
import { ZeroDayPage } from './pages/ZeroDayPage';
import { EBPFPage } from './pages/EBPFPage';
import { ServerlessPage } from './pages/ServerlessPage';
import { CIEMPage } from './pages/CIEMPage';
import { DriftPage } from './pages/DriftPage';
import { AdmissionPage } from './pages/AdmissionPage';
import { RASPPage } from './pages/RASPPage';
import { SchemaPage } from './pages/SchemaPage';
import { BotPage } from './pages/BotPage';
import { SBOMPage } from './pages/SBOMPage';
import { DSPMPage } from './pages/DSPMPage';
import { EASMPage } from './pages/EASMPage';
import { IntelPage } from './pages/IntelPage';
import { DataLakePage } from './pages/DataLakePage';
import { JITPage } from './pages/JITPage';
import { SAAnomalyPage } from './pages/SAAnomalyPage';
import { EvidencePage } from './pages/EvidencePage';
import { TPRMPage } from './pages/TPRMPage';
import { PolicyPage } from './pages/PolicyPage';
import { LLMFirewallPage } from './pages/LLMFirewallPage';
import { IoTSlicingPage } from './pages/IoTSlicingPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { GodModePage } from './pages/GodModePage';
import { ScansPage } from './pages/ScansPage';
import { VulnerabilitiesPage } from './pages/VulnerabilitiesPage';
import { ScanHistory } from './components/ScanHistory';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return <Layout>{children}</Layout>;
}

function AppContent() {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/threat-hunting" element={<ProtectedRoute><ThreatHuntingPage /></ProtectedRoute>} />
            <Route path="/scans" element={<ProtectedRoute><ScansPage /></ProtectedRoute>} />
            <Route path="/vulnerabilities" element={<ProtectedRoute><VulnerabilitiesPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
            <Route path="/monitor" element={<ProtectedRoute><MonitorPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
            <Route path="/cloud" element={<ProtectedRoute><CloudPage /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
            <Route path="/playbooks" element={<ProtectedRoute><PlaybooksPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/ueba" element={<ProtectedRoute><UEBAPage /></ProtectedRoute>} />
            <Route path="/honeypot" element={<ProtectedRoute><HoneypotPage /></ProtectedRoute>} />
            <Route path="/gateway" element={<ProtectedRoute><GatewayPage /></ProtectedRoute>} />
            <Route path="/containers" element={<ProtectedRoute><ContainerPage /></ProtectedRoute>} />
            <Route path="/iac" element={<ProtectedRoute><IaCPage /></ProtectedRoute>} />
            <Route path="/phishing" element={<ProtectedRoute><PhishingPage /></ProtectedRoute>} />
            <Route path="/hardware" element={<ProtectedRoute><HardwarePage /></ProtectedRoute>} />
            <Route path="/identity" element={<ProtectedRoute><IdentityPage /></ProtectedRoute>} />
            <Route path="/apm" element={<ProtectedRoute><APMPage /></ProtectedRoute>} />
            <Route path="/ephemeral" element={<ProtectedRoute><EphemeralPage /></ProtectedRoute>} />
            <Route path="/deepfake" element={<ProtectedRoute><DeepfakePage /></ProtectedRoute>} />
            <Route path="/code-context" element={<ProtectedRoute><CodeContextPage /></ProtectedRoute>} />
            <Route path="/secrets" element={<ProtectedRoute><SecretsPage /></ProtectedRoute>} />
            <Route path="/zkp" element={<ProtectedRoute><ZKPPage /></ProtectedRoute>} />
            <Route path="/insider" element={<ProtectedRoute><InsiderPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CARTPage /></ProtectedRoute>} />
            <Route path="/rbi" element={<ProtectedRoute><RBIPage /></ProtectedRoute>} />
            <Route path="/sovereign" element={<ProtectedRoute><SovereignPage /></ProtectedRoute>} />
            <Route path="/quantum" element={<ProtectedRoute><QuantumPage /></ProtectedRoute>} />
            <Route path="/redhat/apt" element={<ProtectedRoute><APTPage /></ProtectedRoute>} />
            <Route path="/redhat/social" element={<ProtectedRoute><SocialEngPage /></ProtectedRoute>} />
            <Route path="/redhat/lotl" element={<ProtectedRoute><LotLPage /></ProtectedRoute>} />
            <Route path="/redhat/ransomware" element={<ProtectedRoute><RansomwarePage /></ProtectedRoute>} />
            <Route path="/redhat/exfil" element={<ProtectedRoute><ExfilPage /></ProtectedRoute>} />
            <Route path="/redhat/ad" element={<ProtectedRoute><ADPage /></ProtectedRoute>} />
            <Route path="/redhat/zeroday" element={<ProtectedRoute><ZeroDayPage /></ProtectedRoute>} />
            <Route path="/redhat/ebpf" element={<ProtectedRoute><EBPFPage /></ProtectedRoute>} />
            <Route path="/redhat/serverless" element={<ProtectedRoute><ServerlessPage /></ProtectedRoute>} />
            <Route path="/redhat/ciem" element={<ProtectedRoute><CIEMPage /></ProtectedRoute>} />
            <Route path="/redhat/drift" element={<ProtectedRoute><DriftPage /></ProtectedRoute>} />
            <Route path="/redhat/admission" element={<ProtectedRoute><AdmissionPage /></ProtectedRoute>} />
            <Route path="/redhat/rasp" element={<ProtectedRoute><RASPPage /></ProtectedRoute>} />
            <Route path="/redhat/schema" element={<ProtectedRoute><SchemaPage /></ProtectedRoute>} />
            <Route path="/redhat/bot" element={<ProtectedRoute><BotPage /></ProtectedRoute>} />
            <Route path="/redhat/sbom" element={<ProtectedRoute><SBOMPage /></ProtectedRoute>} />
            <Route path="/redhat/dspm" element={<ProtectedRoute><DSPMPage /></ProtectedRoute>} />
            <Route path="/redhat/easm" element={<ProtectedRoute><EASMPage /></ProtectedRoute>} />
            <Route path="/redhat/intel" element={<ProtectedRoute><IntelPage /></ProtectedRoute>} />
            <Route path="/redhat/datalake" element={<ProtectedRoute><DataLakePage /></ProtectedRoute>} />
            <Route path="/redhat/jit" element={<ProtectedRoute><JITPage /></ProtectedRoute>} />
            <Route path="/redhat/sa-anomaly" element={<ProtectedRoute><SAAnomalyPage /></ProtectedRoute>} />
            <Route path="/redhat/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
            <Route path="/redhat/tprm" element={<ProtectedRoute><TPRMPage /></ProtectedRoute>} />
            <Route path="/redhat/policy" element={<ProtectedRoute><PolicyPage /></ProtectedRoute>} />
            <Route path="/redhat/llm-firewall" element={<ProtectedRoute><LLMFirewallPage /></ProtectedRoute>} />
            <Route path="/redhat/quantum" element={<ProtectedRoute><QuantumPage /></ProtectedRoute>} />
            <Route path="/redhat/iot-slicing" element={<ProtectedRoute><IoTSlicingPage /></ProtectedRoute>} />
            <Route path="/redhat/digital-twin" element={<ProtectedRoute><DigitalTwinPage /></ProtectedRoute>} />
            <Route path="/redhat/god-mode" element={<ProtectedRoute><GodModePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}
