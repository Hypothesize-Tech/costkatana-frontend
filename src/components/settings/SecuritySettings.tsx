// src/components/settings/SecuritySettings.tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, DevicePhoneMobileIcon, ExclamationTriangleIcon, ChartBarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
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
      <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center glow-warning">
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold gradient-text-warning">
            Prompt Firewall & Cost Shield
          </h2>
        </div>
        {loadingFirewall ? (
          <div className="glass rounded-lg border border-primary-200/30 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gradient-primary/20 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gradient-primary/20 rounded w-1/2"></div>
            </div>
          </div>
        ) : firewallAnalytics ? (
          <div className="space-y-6">
            {/* Firewall Overview */}
            <div className="glass rounded-lg border border-primary-200/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center glass rounded-lg p-4 border border-info-200/30">
                  <div className="text-3xl font-display font-bold gradient-text mb-2">
                    {firewallAnalytics.totalRequests}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Total Requests</div>
                </div>
                <div className="text-center glass rounded-lg p-4 border border-danger-200/30">
                  <div className="text-3xl font-display font-bold gradient-text-danger mb-2">
                    {firewallAnalytics.blockedRequests}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Blocked Threats</div>
                </div>
                <div className="text-center glass rounded-lg p-4 border border-success-200/30">
                  <div className="text-3xl font-display font-bold gradient-text-success mb-2">
                    ${firewallAnalytics.costSaved.toFixed(3)}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Cost Saved</div>
                </div>
              </div>

              {firewallAnalytics.blockedRequests > 0 && (
                <div className="mt-6 pt-6 border-t border-primary-200/30">
                  <h3 className="font-display font-semibold gradient-text mb-4">Threat Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(firewallAnalytics.threatsByCategory).map(([category, count]) => (
                      <div key={category} className="glass rounded-lg p-4 border border-danger-200/30 flex justify-between items-center">
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary capitalize">
                          {category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-semibold gradient-text-danger">
                            {count}
                          </span>
                          <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
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
            <div className="glass rounded-lg p-6 border border-success-200/30 bg-gradient-success/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold gradient-text-success mb-3">
                    Firewall Protection Active
                  </h3>
                  <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-4">
                    Your AI requests are protected by our two-stage security firewall that automatically
                    blocks malicious prompts and harmful content, saving you from unnecessary costs.
                  </p>
                  {firewallAnalytics.blockedRequests > 0 && (
                    <div className="glass rounded-lg p-4 border border-success-200/30 bg-gradient-success/20">
                      <p className="font-display font-semibold gradient-text-success flex items-center gap-2">
                        <span>🛡️</span>
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
          <div className="glass rounded-lg p-6 border border-accent-200/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-accent/20 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-accent-500" />
              </div>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                No firewall data available. The firewall will start tracking once you make requests through the gateway.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Management */}
      <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-info flex items-center justify-center glow-info">
            <EnvelopeIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold gradient-text">
            Email Management
          </h2>
        </div>
        <EmailManagement />
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
            <span className="text-white text-lg">🔐</span>
          </div>
          <h2 className="text-xl font-display font-bold gradient-text-secondary">
            Two-Factor Authentication
          </h2>
        </div>
        <MFASetup />
      </div>

      {/* Backup Codes */}
      <BackupCodesSection />

      {/* Active Sessions */}
      <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-info flex items-center justify-center glow-info">
            <DevicePhoneMobileIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold gradient-text">
            Active Sessions
          </h2>
        </div>
        <div className="glass rounded-lg p-6 border border-info-200/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-info/20 flex items-center justify-center">
              <DevicePhoneMobileIcon className="h-6 w-6 text-info-500" />
            </div>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Active sessions will be displayed here when session management is linked to the account.
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
            <span className="text-white text-lg">📝</span>
          </div>
          <h2 className="text-xl font-display font-bold gradient-text">
            Security Recommendations
          </h2>
        </div>
        <div className="glass rounded-lg p-6 border border-primary-200/30 bg-gradient-primary/5">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Use a strong, unique password for your account
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Enable two-factor authentication for extra security
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Regularly review your active sessions and API keys
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                Keep your API keys secure and rotate them periodically
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 glow-success">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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