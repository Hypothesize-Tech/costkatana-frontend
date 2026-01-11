/// <reference types="vite/client" />
import { Routes, Route, Navigate } from 'react-router-dom';
import CachePage from './pages/Cache';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { MemoryProvider } from './components/memory';

// Hooks
import { useGlobalTracking } from './hooks/useGlobalTracking';
import { useEffect } from 'react';
import { setupCopyCodeFunction } from './utils/copyToClipboard';
// import { useLaunchDate } from './hooks/useLaunchDate';

// Components
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TrackingConfiguration } from './components/analytics/TrackingConfiguration';
import { OnboardingCheck } from './components/common/OnboardingCheck';
// import { LaunchScreen } from './components/common/LaunchScreen';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ContactUs from './pages/ContactUs';
import ShippingPolicy from './pages/ShippingPolicy';
import CancellationsAndRefunds from './pages/CancellationsAndRefunds';
import MagicLinkConnect from './pages/MagicLinkConnect';
import VerifyEmail from './pages/VerifyEmail';
import ConfirmAccountClosure from './pages/ConfirmAccountClosure';
import AcceptInvite from './pages/AcceptInvite';
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
import JiraCallback from './pages/JiraCallback';
import DiscordCallback from './pages/DiscordCallback';
import SlackCallback from './pages/SlackCallback';
import PromptTemplates from './pages/PromptTemplates';
import TemplateUsage from './pages/TemplateUsage';
import TemplateAnalytics from './pages/TemplateAnalytics';
import { Integration } from './pages/Integration';
import { IntegrationsPage } from './pages/IntegrationsPage';
import Pricing from './pages/Pricing';
import { Subscription } from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import ModelComparison from './pages/ModelComparison';
import AdvancedMonitoring from './pages/AdvancedMonitoring';
import Experimentation from './pages/Experimentation';
import Gateway from './pages/Gateway';
import Workflows from './pages/Workflows';
import KeyVault from './pages/KeyVault';
import PredictiveIntelligence from './pages/PredictiveIntelligence';
import Memory from './pages/Memory';
import Cache from './pages/Cache';
import { SessionsUnified } from './pages/SessionsUnified';
import { SessionDetail } from './pages/SessionDetail';
import { TelemetryDashboard } from './pages/telemetry/TelemetryDashboard';
import CostLake from './pages/CostLake';
import Webhooks from './pages/Webhooks';
import { Moderation } from './pages/Moderation';
import { Security } from './pages/Security';
import UnexplainedCosts from './pages/UnexplainedCosts';
import GitHubCallback from './pages/GitHubCallback';
import GitHubIntegrations from './pages/GitHubIntegrations';
import { GoogleIntegrations } from './pages/GoogleIntegrations';
import { AdminUserSpending } from './pages/AdminUserSpending';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDiscountManagement } from './pages/AdminDiscountManagement';
import { AdminBrainDashboard } from './pages/AdminBrainDashboard';
import Brain from './pages/Brain';
import Logs from './pages/Logs';
import Automation from './pages/Automation';
import CostIntelligence from './pages/CostIntelligence';
import CostIntelligenceConfig from './pages/CostIntelligenceConfig';
import { AgentGovernance } from './pages/AgentGovernance';
import { AgentDetail } from './pages/AgentDetail';
import { CreateAgent } from './pages/CreateAgent';
import {
  Dashboard as DataNetworkEffectsDashboard,
  ModelPerformance,
  LearningLoop,
  AgentAnalytics,
  SemanticPatterns,
  GlobalBenchmarks
} from './pages/DataNetworkEffects';

// Component to handle global tracking inside the context providers
function AppContent() {
  // const { isLaunched } = useLaunchDate();

  // Initialize copy code functionality
  useEffect(() => {
    setupCopyCodeFunction();
  }, []);

  // Initialize global tracking for all interactions - temporarily disabled to debug login refresh
  useGlobalTracking();

  // Don't render app content until launched
  // if (!isLaunched) {
  //   return null;
  // }

  return (
    <ErrorBoundary>
      {/* Global tracking configuration component */}
      <TrackingConfiguration />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/cancellations-refunds" element={<CancellationsAndRefunds />} />
        <Route path="/connect/chatgpt" element={<MagicLinkConnect />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/confirm-account-closure/:token" element={<ConfirmAccountClosure />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="/github/success" element={<GitHubCallback />} />
        <Route path="/github/error" element={<GitHubCallback />} />
        <Route path="/integrations/jira/success" element={<JiraCallback />} />
        <Route path="/integrations/jira/error" element={<JiraCallback />} />
        <Route path="/integrations/discord/success" element={<DiscordCallback />} />
        <Route path="/integrations/discord/error" element={<DiscordCallback />} />
        <Route path="/integrations/slack/success" element={<SlackCallback />} />
        <Route path="/integrations/slack/error" element={<SlackCallback />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Layout />
              </OnboardingCheck>
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
          <Route path="/dashboard/:conversationId" element={<Dashboard />} />
          <Route path="/chat/:conversationId" element={<Dashboard />} />
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
            path="subscription"
            element={<Subscription />}
          />
          <Route
            path="model-comparison"
            element={<ModelComparison />}
          />
          <Route
            path="optimizations"
            element={<Optimization />}
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
            path="templates/analytics"
            element={<TemplateAnalytics />}
          />
          <Route
            path="templates/:templateId"
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
            path="integrations"
            element={<IntegrationsPage />}
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
            path="automation"
            element={<Automation />}
          />
          <Route
            path="sessions"
            element={<SessionsUnified />}
          />
          <Route
            path="sessions/replay/:sessionId"
            element={<SessionsUnified />}
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
            path="cost-intelligence"
            element={<CostIntelligence />}
          />
          <Route
            path="cost-intelligence/config"
            element={<CostIntelligenceConfig />}
          />
          <Route
            path="agent-governance"
            element={<AgentGovernance />}
          />
          <Route
            path="agent-governance/create"
            element={<CreateAgent />}
          />
          <Route
            path="agent-governance/:agentId"
            element={<AgentDetail />}
          />
          <Route
            path="agent-governance/:agentId/:tab"
            element={<AgentDetail />}
          />

          <Route
            path="settings"
            element={<Navigate to="/settings/profile" replace />}
          />
          <Route
            path="settings/:tab"
            element={<Settings />}
          />
          <Route path="profile" element={<Profile />} />
          <Route path="alerts" element={<Alerts />} />
          <Route
            path="integration"
            element={<Integration />}
          />
          <Route
            path="github"
            element={<GitHubIntegrations />}
          />
          <Route
            path="google"
            element={<GoogleIntegrations />}
          />
          <Route
            path="admin/user-spending"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUserSpending />
              </ProtectedRoute>
            }
          />
          <Route
            path="logs"
            element={<Logs />}
          />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/discounts"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDiscountManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/brain"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminBrainDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/brain/:tab"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminBrainDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="brain"
            element={<Brain />}
          />

          {/* Data Network Effects Routes */}
          <Route
            path="data-network-effects"
            element={<DataNetworkEffectsDashboard />}
          />
          <Route
            path="data-network-effects/models"
            element={<ModelPerformance />}
          />
          <Route
            path="data-network-effects/learning-loop"
            element={<LearningLoop />}
          />
          <Route
            path="data-network-effects/agents"
            element={<AgentAnalytics />}
          />
          <Route
            path="data-network-effects/patterns"
            element={<SemanticPatterns />}
          />
          <Route
            path="data-network-effects/benchmarks"
            element={<GlobalBenchmarks />}
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
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <ProjectProvider>
            <MemoryProvider>
              {/* <LaunchScreen /> */}
              <AppContent />
            </MemoryProvider>
          </ProjectProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;