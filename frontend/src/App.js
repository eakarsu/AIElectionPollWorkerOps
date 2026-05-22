import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import PrecinctsPage from './pages/PrecinctsPage';
import PollWorkersPage from './pages/PollWorkersPage';
import EquipmentPage from './pages/EquipmentPage';
import BallotsPage from './pages/BallotsPage';
import ChainOfCustodyPage from './pages/ChainOfCustodyPage';
import TrainingSessionsPage from './pages/TrainingSessionsPage';
import VoterLinesPage from './pages/VoterLinesPage';
import IncidentReportsPage from './pages/IncidentReportsPage';
import ElectionJudgesPage from './pages/ElectionJudgesPage';
import RecountsPage from './pages/RecountsPage';
import ObserversPage from './pages/ObserversPage';
import SuppliesPage from './pages/SuppliesPage';
import VehiclesPage from './pages/VehiclesPage';
import BallotDropBoxesPage from './pages/BallotDropBoxesPage';
import AccessibilityAuditsPage from './pages/AccessibilityAuditsPage';
import LanguageSupportPage from './pages/LanguageSupportPage';
import AuditLogPage from './pages/AuditLogPage';
import TransmissionsPage from './pages/TransmissionsPage';

// 16 AI pages
import AILineWaitForecastPage from './pages/AILineWaitForecastPage';
import AIEquipmentReallocatePage from './pages/AIEquipmentReallocatePage';
import AIIncidentTriagePage from './pages/AIIncidentTriagePage';
import AIRecountReadinessBriefPage from './pages/AIRecountReadinessBriefPage';
import AIChainOfCustodyAnomalyPage from './pages/AIChainOfCustodyAnomalyPage';
import AIExecutiveBriefPage from './pages/AIExecutiveBriefPage';
import AIPollWorkerSchedulePage from './pages/AIPollWorkerSchedulePage';
import AILanguageSupportPlanPage from './pages/AILanguageSupportPlanPage';
import AIAccessibilityGapAnalyzePage from './pages/AIAccessibilityGapAnalyzePage';
import AIObserverCoordinationPage from './pages/AIObserverCoordinationPage';
import AISupplyResupplyPlanPage from './pages/AISupplyResupplyPlanPage';
import AITransmissionAnomalyPage from './pages/AITransmissionAnomalyPage';
import AIBallotRoutingPage from './pages/AIBallotRoutingPage';
import AITrainingGapAnalysisPage from './pages/AITrainingGapAnalysisPage';
import AIVoterCommunicationDraftPage from './pages/AIVoterCommunicationDraftPage';
import AIPostElectionReportPage from './pages/AIPostElectionReportPage';

// Pass 7 — backlog AI pages + sign-off queue
import AITrainingQaCopilotPage from './pages/AITrainingQaCopilotPage';
import AIIncidentReportDraftPage from './pages/AIIncidentReportDraftPage';
import AIDisinformationQuizPage from './pages/AIDisinformationQuizPage';
import AIRulesTranslatePage from './pages/AIRulesTranslatePage';
import AIApprovalsPage from './pages/AIApprovalsPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom analytics views
import CustomViewsPage from './pages/CustomViewsPage';
import PollWorkerBreakCoveragePage from './pages/PollWorkerBreakCoveragePage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

            <Route path="/" element={<Dashboard />} />

            <Route path="/precincts"             element={<PrecinctsPage />} />
            <Route path="/poll-workers"          element={<PollWorkersPage />} />
            <Route path="/equipment"             element={<EquipmentPage />} />
            <Route path="/ballots"               element={<BallotsPage />} />
            <Route path="/chain-of-custody"      element={<ChainOfCustodyPage />} />
            <Route path="/training-sessions"     element={<TrainingSessionsPage />} />
            <Route path="/voter-lines"           element={<VoterLinesPage />} />
            <Route path="/incident-reports"      element={<IncidentReportsPage />} />
            <Route path="/election-judges"       element={<ElectionJudgesPage />} />
            <Route path="/recounts"              element={<RecountsPage />} />
            <Route path="/observers"             element={<ObserversPage />} />
            <Route path="/supplies"              element={<SuppliesPage />} />
            <Route path="/vehicles"              element={<VehiclesPage />} />
            <Route path="/ballot-drop-boxes"     element={<BallotDropBoxesPage />} />
            <Route path="/accessibility-audits"  element={<AccessibilityAuditsPage />} />
            <Route path="/language-support"      element={<LanguageSupportPage />} />
            <Route path="/audit-log"             element={<AuditLogPage />} />
            <Route path="/transmissions"         element={<TransmissionsPage />} />

            <Route path="/ai/line-wait-forecast"       element={<AILineWaitForecastPage />} />
            <Route path="/ai/equipment-reallocate"     element={<AIEquipmentReallocatePage />} />
            <Route path="/ai/incident-triage"          element={<AIIncidentTriagePage />} />
            <Route path="/ai/recount-readiness-brief"  element={<AIRecountReadinessBriefPage />} />
            <Route path="/ai/chain-of-custody-anomaly" element={<AIChainOfCustodyAnomalyPage />} />
            <Route path="/ai/executive-brief"          element={<AIExecutiveBriefPage />} />
            <Route path="/ai/poll-worker-schedule"     element={<AIPollWorkerSchedulePage />} />
            <Route path="/ai/language-support-plan"    element={<AILanguageSupportPlanPage />} />
            <Route path="/ai/accessibility-gap-analyze"element={<AIAccessibilityGapAnalyzePage />} />
            <Route path="/ai/observer-coordination"    element={<AIObserverCoordinationPage />} />
            <Route path="/ai/supply-resupply-plan"     element={<AISupplyResupplyPlanPage />} />
            <Route path="/ai/transmission-anomaly"     element={<AITransmissionAnomalyPage />} />
            <Route path="/ai/ballot-routing"           element={<AIBallotRoutingPage />} />
            <Route path="/ai/training-gap-analysis"    element={<AITrainingGapAnalysisPage />} />
            <Route path="/ai/voter-communication-draft"element={<AIVoterCommunicationDraftPage />} />
            <Route path="/ai/post-election-report"     element={<AIPostElectionReportPage />} />

            {/* Pass 7 backlog routes */}
            <Route path="/ai/training-qa-copilot"          element={<AITrainingQaCopilotPage />} />
            <Route path="/ai/incident-report-draft"        element={<AIIncidentReportDraftPage />} />
            <Route path="/ai/disinformation-quiz-generate" element={<AIDisinformationQuizPage />} />
            <Route path="/ai/rules-translate"              element={<AIRulesTranslatePage />} />
            <Route path="/ai-approvals"                    element={<AIApprovalsPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />
            <Route path="/poll-worker-break-coverage" element={<PollWorkerBreakCoveragePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
