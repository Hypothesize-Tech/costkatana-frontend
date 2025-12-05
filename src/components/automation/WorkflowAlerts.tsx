import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { WorkflowAlert, WorkflowAlertConfig } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowAlertsProps {
  workflowId?: string;
  onAlertClick?: (alert: WorkflowAlert) => void;
}

export const WorkflowAlerts: React.FC<WorkflowAlertsProps> = ({
  workflowId,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<WorkflowAlertConfig>({
    workflowId,
    userId: '',
    budgetThreshold: 80,
    budgetThresholdPercentages: [50, 80, 90, 100],
    spikeThreshold: 50,
    inefficiencyThreshold: 0.5,
    failureRateThreshold: 10,
    enabled: true,
    channels: []
  });

  useEffect(() => {
    if (workflowId) {
      checkAlerts();
    }
  }, [workflowId]);

  const checkAlerts = async () => {
    if (!workflowId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.checkWorkflowAlerts(workflowId, config);
      if (response.success) {
        setAlerts(response.data.alerts);
      } else {
        setError('Failed to check alerts');
      }
    } catch (err) {
      setError('Failed to check alerts');
      console.error('Error checking workflow alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
      case 'high':
        return 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
      case 'medium':
        return 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700';
      case 'low':
        return 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      default:
        return 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-white" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-white" />;
      case 'medium':
        return <InformationCircleIcon className="w-5 h-5 text-white" />;
      case 'low':
        return <CheckCircleIcon className="w-5 h-5 text-white" />;
      default:
        return <BellIcon className="w-5 h-5 text-white" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'workflow_budget':
        return 'Budget Alert';
      case 'workflow_spike':
        return 'Cost Spike';
      case 'workflow_inefficiency':
        return 'Inefficiency';
      case 'workflow_failure':
        return 'Failure Rate';
      case 'workflow_quota':
        return 'Quota Warning';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary">
            Workflow Alerts
          </h3>
          <p className="text-xs sm:text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            Monitor and manage workflow alerts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-500/20 text-xs sm:text-sm font-medium hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors flex items-center justify-center gap-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Configure
          </button>
          {workflowId && (
            <button
              onClick={checkAlerts}
              disabled={loading}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-500/20 text-xs sm:text-sm font-medium hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Check Alerts
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {configOpen && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
            Alert Configuration
          </h4>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Budget Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.budgetThreshold}
                onChange={(e) => setConfig({ ...config, budgetThreshold: Number(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-xs sm:text-sm font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Cost Spike Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                value={config.spikeThreshold}
                onChange={(e) => setConfig({ ...config, spikeThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Inefficiency Threshold ($/execution)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.inefficiencyThreshold}
                onChange={(e) => setConfig({ ...config, inefficiencyThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Failure Rate Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.failureRateThreshold}
                onChange={(e) => setConfig({ ...config, failureRateThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="alertsEnabled"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-primary-200/30 dark:border-primary-500/20"
              />
              <label htmlFor="alertsEnabled" className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                Enable alerts
              </label>
            </div>
            <button
              onClick={() => {
                setConfigOpen(false);
                if (workflowId) checkAlerts();
              }}
              className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <span className="font-body">{error}</span>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 sm:p-12 text-center">
          <BellIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No alerts found
          </p>
          <p className="text-xs sm:text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            {workflowId
              ? 'No alerts for this workflow. All systems are operating normally.'
              : 'Select a workflow to check for alerts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass rounded-xl border shadow-lg backdrop-blur-xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow ${
                alert.severity === 'critical'
                  ? 'border-red-200/30 dark:border-red-500/20 bg-red-50/30 dark:bg-red-900/20'
                  : alert.severity === 'high'
                  ? 'border-orange-200/30 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-900/20'
                  : alert.severity === 'medium'
                  ? 'border-yellow-200/30 dark:border-yellow-500/20 bg-yellow-50/30 dark:bg-yellow-900/20'
                  : 'border-primary-200/30 dark:border-primary-500/20'
              }`}
              onClick={() => onAlertClick && onAlertClick(alert)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${getSeverityColor(alert.severity)} flex items-center justify-center flex-shrink-0`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-base sm:text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                      {alert.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : alert.severity === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    {alert.actionRequired && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                    {alert.message}
                  </p>
                  {alert.data && (
                    <div className="space-y-2 mb-3">
                      {alert.data.workflowName && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Workflow: {alert.data.workflowName}
                        </div>
                      )}
                      {alert.data.percentage !== undefined && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Usage: {alert.data.percentage.toFixed(1)}%
                        </div>
                      )}
                      {alert.data.currentCost !== undefined && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Current Cost: {formatCurrency(alert.data.currentCost)}
                        </div>
                      )}
                      {alert.data.costPerExecution !== undefined && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Cost/Execution: {formatCurrency(alert.data.costPerExecution)}
                        </div>
                      )}
                      {alert.data.failureRate !== undefined && (
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Failure Rate: {alert.data.failureRate.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}
                  {alert.data?.suggestions && alert.data.suggestions.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/20">
                      <p className="text-xs font-body font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Suggestions:
                      </p>
                      <ul className="space-y-1">
                        {alert.data.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-xs font-body text-blue-700 dark:text-blue-400">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-200/20 dark:border-primary-500/10">
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatDate(alert.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.sent && (
                        <span className="text-xs font-body text-green-600 dark:text-green-400">
                          Sent
                        </span>
                      )}
                      {alert.expiresAt && new Date(alert.expiresAt) > new Date() && (
                        <span className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          Expires: {formatDate(alert.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowAlerts;


