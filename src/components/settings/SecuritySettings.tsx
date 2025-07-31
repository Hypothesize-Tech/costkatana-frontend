// src/components/settings/SecuritySettings.tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, DevicePhoneMobileIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import { GatewayService, FirewallAnalytics } from '../../services/gateway.service';

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
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-500" />
          Prompt Firewall & Cost Shield
        </h2>
        {loadingFirewall ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : firewallAnalytics ? (
          <div className="space-y-4">
            {/* Firewall Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {firewallAnalytics.totalRequests}
                  </div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {firewallAnalytics.blockedRequests}
                  </div>
                  <div className="text-sm text-gray-600">Blocked Threats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${firewallAnalytics.costSaved.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">Cost Saved</div>
                </div>
              </div>

              {firewallAnalytics.blockedRequests > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Threat Categories</h3>
                  <div className="space-y-2">
                    {Object.entries(firewallAnalytics.threatsByCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {count}
                          </span>
                          <span className="text-xs text-gray-500">
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
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-900">
                    Firewall Protection Active
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your AI requests are protected by our two-stage security firewall that automatically
                    blocks malicious prompts and harmful content, saving you from unnecessary costs.
                  </p>
                  {firewallAnalytics.blockedRequests > 0 && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      🛡️ {firewallAnalytics.blockedRequests} threats blocked and
                      ${firewallAnalytics.costSaved.toFixed(3)} in costs prevented!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <p className="text-sm text-gray-600">
                No firewall data available. The firewall will start tracking once you make requests through the gateway.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
            <p className="text-sm text-gray-600">
              Active sessions will be displayed here when session management is linked to the account.
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h2>
        <div className="bg-blue-50 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Use a strong, unique password for your account
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enable two-factor authentication for extra security
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Regularly review your active sessions and API keys
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keep your API keys secure and rotate them periodically
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Use the CostKATANA Gateway with firewall protection for all AI requests
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};