import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AlertType, AlertSeverity } from '../../types/integration.types';

interface SlackIntegrationSetupProps {
  onClose: () => void;
  onComplete: () => void;
}

export const SlackIntegrationSetup: React.FC<SlackIntegrationSetupProps> = ({
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [integrationType] = useState<'webhook' | 'oauth'>('webhook');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<AlertType>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<AlertSeverity>>(
    new Set(['high', 'critical'])
  );

  const { showNotification } = useNotifications();

  const createMutation = useMutation(
    () =>
      integrationService.createIntegration({
        type: integrationType === 'webhook' ? 'slack_webhook' : 'slack_oauth',
        name,
        description,
        credentials: {
          webhookUrl,
        },
        alertRouting: Object.fromEntries(
          Array.from(selectedAlertTypes).map((type) => [
            type,
            {
              enabled: true,
              severities: Array.from(selectedSeverities),
            },
          ])
        ),
      }),
    {
      onSuccess: () => {
        showNotification('Slack integration created successfully!', 'success');
        onComplete();
      },
      onError: () => {
        showNotification('Failed to create Slack integration', 'error');
      },
    }
  );

  const alertTypes: { value: AlertType; label: string }[] = [
    { value: 'cost_threshold', label: 'Cost Threshold Alerts' },
    { value: 'usage_spike', label: 'Usage Spike Alerts' },
    { value: 'optimization_available', label: 'Optimization Opportunities' },
    { value: 'anomaly', label: 'Anomaly Detection' },
    { value: 'system', label: 'System Notifications' },
  ];

  const severities: { value: AlertSeverity; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'critical', label: 'Critical', color: '#DC2626' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const toggleAlertType = (type: AlertType) => {
    const newSet = new Set(selectedAlertTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedAlertTypes(newSet);
  };

  const toggleSeverity = (severity: AlertSeverity) => {
    const newSet = new Set(selectedSeverities);
    if (newSet.has(severity)) {
      newSet.delete(severity);
    } else {
      newSet.add(severity);
    }
    setSelectedSeverities(newSet);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-5"
      onClick={onClose}
    >
      <div
        className="glass rounded-xl border border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-primary-200/20">
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary mb-1">
              Connect Slack
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Integration Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Production Alerts"
                    required
                    className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description for this integration"
                    rows={3}
                    className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Webhook URL *
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    required
                    className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Get your Slack webhook URL from{' '}
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Slack's Incoming Webhooks
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Alert Types */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Alert Types
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Choose which types of alerts should be sent to this Slack channel
                  </p>
                </div>
                <div className="space-y-3">
                  {alertTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-3 p-3.5 border border-primary-200/20 dark:border-primary-200/30 rounded-lg cursor-pointer transition-all bg-white/50 dark:bg-gray-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:border-primary-300/40 dark:hover:border-primary-400/50 hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAlertTypes.has(type.value)}
                        onChange={() => toggleAlertType(type.value)}
                        className="w-[18px] h-[18px] rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Severities & Summary */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Severities
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Choose which severity levels should trigger notifications
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {severities.map((severity) => (
                      <label
                        key={severity.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedSeverities.has(severity.value)
                            ? 'border-primary-500 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/15 dark:to-primary-800/15 shadow-md shadow-primary-500/20'
                            : 'border-primary-200/20 dark:border-primary-200/30 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50 hover:shadow-sm'
                          } hover:-translate-y-0.5`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSeverities.has(severity.value)}
                          onChange={() => toggleSeverity(severity.value)}
                          className="hidden"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: severity.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {severity.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="glass rounded-xl border border-primary-200/20 dark:border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/8 dark:to-primary-800/8 p-5">
                  <h4 className="text-base font-display font-bold gradient-text-primary mb-4">
                    Configuration Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Alert Types:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAlertTypes.size || 'None selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Severities:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Array.from(selectedSeverities).join(', ') || 'None selected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-primary-200/20">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/80 dark:bg-gray-800/80 text-primary-600 dark:text-primary-400 border border-primary-200/30 dark:border-primary-200/40 hover:bg-primary-50/90 dark:hover:bg-primary-900/30 hover:border-primary-300/50 dark:hover:border-primary-400/60 transition-all"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!name || !webhookUrl)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isLoading || selectedAlertTypes.size === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Integration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
