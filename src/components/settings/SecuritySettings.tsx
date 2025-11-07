// src/components/settings/SecuritySettings.tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, AlertTriangle, BarChart3, Mail, Lock, FileText, Shield } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { GatewayService, FirewallAnalytics } from '../../services/gateway.service';
import { MFASetup } from '../auth/MFASetup';
import { BackupCodesSection } from '../security/BackupCodesSection';
import { EmailManagement } from './EmailManagement';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeSessions: {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }[];
}

interface SecuritySettingsProps {
  onUpdate: (data: { security: SecuritySettings }) => void;
  security: SecuritySettings;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
  const [firewallAnalytics, setFirewallAnalytics] = useState<FirewallAnalytics | null>(null);
  const [loadingFirewall, setLoadingFirewall] = useState(true);
  const { showNotification } = useNotifications();

  // Load firewall analytics on component mount
  useEffect(() => {
    const loadFirewallAnalytics = async () => {
      try {
        setLoadingFirewall(true);
        const analytics = await GatewayService.getFirewallAnalytics();
        setFirewallAnalytics(analytics);
      } catch (error) {
        console.error('Failed to load firewall analytics:', error);
        showNotification('Failed to load firewall analytics', 'error');
      } finally {
        setLoadingFirewall(false);
      }
    };

    loadFirewallAnalytics();
  }, [showNotification]);

  return (
    <div className="space-y-8">

      {/* Prompt Firewall & Cost Shield */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-warning glow-warning">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text-warning">
            Prompt Firewall & Cost Shield
          </h2>
        </div>
        {loadingFirewall ? (
          <div className="p-6 rounded-lg border glass border-primary-200/30">
            <div className="animate-pulse">
              <div className="mb-2 w-1/4 h-4 rounded bg-gradient-primary/20"></div>
              <div className="w-1/2 h-4 rounded bg-gradient-primary/20"></div>
            </div>
          </div>
        ) : firewallAnalytics ? (
          <div className="space-y-6">
            {/* Firewall Overview */}
            <div className="p-6 rounded-lg border glass border-primary-200/30">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-4 text-center rounded-lg border glass border-info-200/30">
                  <div className="mb-2 text-3xl font-bold font-display gradient-text">
                    {firewallAnalytics.totalRequests}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Total Requests</div>
                </div>
                <div className="p-4 text-center rounded-lg border glass border-danger-200/30">
                  <div className="mb-2 text-3xl font-bold font-display gradient-text-danger">
                    {firewallAnalytics.blockedRequests}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Blocked Threats</div>
                </div>
                <div className="p-4 text-center rounded-lg border glass border-success-200/30">
                  <div className="mb-2 text-3xl font-bold font-display gradient-text-success">
                    ${firewallAnalytics.costSaved.toFixed(3)}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Cost Saved</div>
                </div>
              </div>

              {firewallAnalytics.blockedRequests > 0 && (
                <div className="pt-6 mt-6 border-t border-primary-200/30">
                  <h3 className="mb-4 font-semibold font-display gradient-text">Threat Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(firewallAnalytics.threatsByCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center p-4 rounded-lg border glass border-danger-200/30">
                        <span className="capitalize font-body text-light-text-primary dark:text-dark-text-primary">
                          {category.replace('_', ' ')}
                        </span>
                        <div className="flex gap-3 items-center">
                          <span className="font-semibold font-display gradient-text-danger">
                            {count}
                          </span>
                          <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            (${(firewallAnalytics.savingsByThreatType[category] || 0).toFixed(3)} saved)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Firewall Status */}
            <div className="p-6 rounded-lg border glass border-success-200/30 bg-gradient-success/10">
              <div className="flex gap-4 items-start">
                <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-success glow-success">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-3 font-semibold font-display gradient-text-success">
                    Firewall Protection Active
                  </h3>
                  <p className="mb-4 font-body text-light-text-primary dark:text-dark-text-primary">
                    Your AI requests are protected by our two-stage security firewall that automatically
                    blocks malicious prompts and harmful content, saving you from unnecessary costs.
                  </p>
                  {firewallAnalytics.blockedRequests > 0 && (
                    <div className="p-4 rounded-lg border glass border-success-200/30 bg-gradient-success/20">
                      <p className="flex gap-2 items-center font-semibold font-display gradient-text-success">
                        <Shield className="w-5 h-5" />
                        {firewallAnalytics.blockedRequests} threats blocked and
                        ${firewallAnalytics.costSaved.toFixed(3)} in costs prevented!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg border glass border-accent-200/30">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-accent/20">
                <BarChart3 className="w-6 h-6 text-accent-500" />
              </div>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                No firewall data available. The firewall will start tracking once you make requests through the gateway.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Management */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-info glow-info">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text">
            Email Management
          </h2>
        </div>
        <EmailManagement />
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-secondary glow-secondary">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text-secondary">
            Two-Factor Authentication
          </h2>
        </div>
        <MFASetup />
      </div>

      {/* Backup Codes */}
      <BackupCodesSection />

      {/* Active Sessions */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-info glow-info">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text">
            Active Sessions
          </h2>
        </div>
        <div className="p-6 rounded-lg border glass border-info-200/30">
          <div className="flex gap-4 items-center">
            <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-gradient-info/20">
              <Smartphone className="w-6 h-6 text-info-500" />
            </div>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Active sessions will be displayed here when session management is linked to the account.
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center mb-6">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-primary glow-primary">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text">
            Security Recommendations
          </h2>
        </div>
        <div className="p-6 rounded-lg border glass border-primary-200/30 bg-gradient-primary/5">
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Use a strong, unique password for your account
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Enable two-factor authentication for extra security
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Regularly review your active sessions and API keys
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Keep your API keys secure and rotate them periodically
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Use the CostKATANA Gateway with firewall protection for all AI requests
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};