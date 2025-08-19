/// <reference types="vite/client" />
import { Routes, Route, Navigate } from 'react-router-dom';
import CachePage from './pages/Cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { MemoryProvider } from './components/memory';

// Hooks
import { useGlobalTracking } from './hooks/useGlobalTracking';

// Components
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TrackingConfiguration } from './components/analytics/TrackingConfiguration';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MagicLinkConnect from './pages/MagicLinkConnect';
import { Dashboard } from './pages/Dashboard';
import Usage from './pages/Usage';
import Requests from './pages/Requests';
import { Analytics } from './pages/Analytics';
import { Optimization } from './pages/Optimization';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';
import { Alerts } from './pages/Alerts';
import CostAuditWizard from './pages/CostAuditWizard';
import Projects from './pages/Projects';
import PromptTemplates from './pages/PromptTemplates';
import TemplateUsage from './pages/TemplateUsage';
import { Integration } from './pages/Integration';
import Pricing from './pages/Pricing';
import AdvancedMonitoring from './pages/AdvancedMonitoring';
import Experimentation from './pages/Experimentation';
import Gateway from './pages/Gateway';
import Workflows from './pages/Workflows';
import KeyVault from './pages/KeyVault';
import { Training } from './pages/Training';
import PredictiveIntelligence from './pages/PredictiveIntelligence';
import Memory from './pages/Memory';
import Cache from './pages/Cache';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { TelemetryDashboard } from './pages/telemetry/TelemetryDashboard';
import CostLake from './pages/CostLake';
import Webhooks from './pages/Webhooks';
import { Moderation } from './pages/Moderation';
import { Security } from './pages/Security';
import { CPIDashboard } from './components/cpi/CPIDashboard';
import CostDebuggerPage from './pages/CostDebugger';
import UnexplainedCosts from './pages/UnexplainedCosts';

const queryClient = new QueryClient();

// Component to handle global tracking inside the context providers
function AppContent() {
  // Initialize global tracking for all interactions
  useGlobalTracking();

  return (
    <ErrorBoundary>
      {/* Global tracking configuration component */}
      <TrackingConfiguration />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/connect/chatgpt" element={<MagicLinkConnect />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cache" element={<CachePage />} />
          <Route path="usage" element={<Usage />} />
          <Route path="requests" element={<Requests />} />
          <Route
            path="analytics"
            element={<Analytics />}
          />
          <Route
            path="pricing"
            element={<Pricing />}
          />
          <Route
            path="optimizations"
            element={<Optimization />}
          />
          <Route
            path="cost-debugger"
            element={<CostDebuggerPage />}
          />
          <Route
            path="unexplained-costs"
            element={<UnexplainedCosts />}
          />
          <Route
            path="cache"
            element={<Cache />}
          />
          <Route
            path="optimizations/wizard"
            element={<CostAuditWizard />}
          />
          <Route
            path="projects"
            element={<Projects />}
          />
          <Route
            path="templates"
            element={<PromptTemplates />}
          />
          <Route
            path="templates/use"
            element={<TemplateUsage />}
          />
          <Route
            path="advanced-monitoring"
            element={<AdvancedMonitoring />}
          />
          <Route
            path="experimentation"
            element={<Experimentation />}
          />
          <Route
            path="gateway"
            element={<Gateway />}
          />
          <Route
            path="workflows"
            element={<Workflows />}
          />
          <Route
            path="key-vault"
            element={<KeyVault />}
          />
          <Route
            path="moderation"
            element={<Moderation />}
          />
          <Route
            path="security"
            element={<Security />}
          />
          <Route
            path="training"
            element={<Training />}
          />
          <Route
            path="predictive-intelligence"
            element={<PredictiveIntelligence />}
          />
          <Route
            path="memory"
            element={<Memory />}
          />
          <Route
            path="webhooks"
            element={<Webhooks />}
          />
          <Route
            path="sessions"
            element={<Sessions />}
          />
          <Route
            path="sessions/:id"
            element={<SessionDetail />}
          />
          <Route
            path="telemetry"
            element={<TelemetryDashboard />}
          />
          <Route
            path="cost-lake"
            element={<CostLake />}
          />
          <Route
            path="cpi"
            element={<CPIDashboard userId="current" />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
          <Route path="profile" element={<Profile />} />
          <Route path="alerts" element={<Alerts />} />
          <Route
            path="integration"
            element={<Integration />}
          />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <ProjectProvider>
              <MemoryProvider>
                <AppContent />
              </MemoryProvider>
            </ProjectProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;