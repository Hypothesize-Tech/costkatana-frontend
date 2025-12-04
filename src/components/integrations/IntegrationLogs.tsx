import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';


interface IntegrationLogsProps {
  onClose: () => void;
}

export const IntegrationLogs: React.FC<IntegrationLogsProps> = ({ onClose: _onClose }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');

  const { data, isLoading } = useQuery(
    ['integration-logs', statusFilter, alertTypeFilter],
    () =>
      integrationService.getAllDeliveryLogs({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        alertType: alertTypeFilter !== 'all' ? alertTypeFilter : undefined,
        limit: 100,
      }),
    {
    }
  );

  const logs = data?.data || [];

  const getStatusBadge = (status: string) => {
    const config = {
      sent: {
        icon: CheckCircleIcon,
        className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-primary-500/20 dark:to-primary-600/30 text-emerald-800 dark:text-primary-400 shadow-sm',
        label: 'Sent'
      },
      failed: {
        icon: XCircleIcon,
        className: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-600/30 text-red-800 dark:text-red-400 shadow-sm',
        label: 'Failed'
      },
      pending: {
        icon: ClockIcon,
        className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/30 text-yellow-800 dark:text-yellow-400 shadow-sm',
        label: 'Pending'
      },
      retrying: {
        icon: ArrowPathIcon,
        className: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/30 text-blue-800 dark:text-blue-400 shadow-sm',
        label: 'Retrying'
      },
    };

    const { icon: Icon, className, label } = config[status as keyof typeof config] || config.pending;

    return (
      <span className={`inline-flex gap-1 items-center px-2 py-1 text-xs font-medium rounded-md ${className}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };
    return colors[severity as keyof typeof colors] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-40 h-8 rounded skeleton" />
          <div className="flex gap-3">
            <div className="w-32 h-10 rounded-lg skeleton" />
            <div className="w-40 h-10 rounded-lg skeleton" />
          </div>
        </div>

        {/* Table Shimmer */}
        <div className="overflow-x-auto rounded-xl border border-primary-200/10 dark:border-primary-200/20">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/15 dark:to-primary-800/15">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="px-3 py-4">
                    <div className="w-20 h-4 rounded skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <tr
                  key={row}
                  className="border-t border-primary-200/10 dark:border-primary-200/15"
                >
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="w-48 h-4 rounded skeleton" />
                      <div className="w-64 h-3 rounded skeleton" />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-24 h-6 rounded-md skeleton" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 rounded-full skeleton" />
                      <div className="w-16 h-4 rounded skeleton" />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-20 h-6 rounded-md skeleton" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-8 h-4 rounded skeleton" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-16 h-4 rounded skeleton" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-32 h-4 rounded skeleton" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-display gradient-text-primary">
          Delivery Logs
        </h2>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-white/90 dark:bg-gray-800/90 cursor-pointer transition-all hover:border-primary-300/50 dark:hover:border-primary-400/40 hover:shadow-sm focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/10 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="retrying">Retrying</option>
          </select>
          <select
            value={alertTypeFilter}
            onChange={(e) => setAlertTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-white/90 dark:bg-gray-800/90 cursor-pointer transition-all hover:border-primary-300/50 dark:hover:border-primary-400/40 hover:shadow-sm focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/10 shadow-sm"
          >
            <option value="all">All Alert Types</option>
            <option value="cost_threshold">Cost Threshold</option>
            <option value="usage_spike">Usage Spike</option>
            <option value="optimization_available">Optimization</option>
            <option value="anomaly">Anomaly</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-primary-200/10 dark:border-primary-200/20">
        {logs.length === 0 ? (
          <div className="py-16 text-base text-center text-gray-600 dark:text-gray-300">
            <p>No delivery logs found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/15 dark:to-primary-800/15">
              <tr>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Alert
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Type
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Severity
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Status
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Attempts
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Response Time
                </th>
                <th className="px-3 py-4 text-xs font-bold tracking-wider text-left uppercase text-primary-600 dark:text-primary-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={`${log.alertId}-${log.integrationId}-${index}`}
                  className="transition-colors hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                >
                  <td className="px-3 py-4 text-sm text-gray-900 border-t border-primary-200/10 dark:border-primary-200/15 dark:text-white">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{log.alertTitle}</div>
                      {log.lastError && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {log.lastError}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm border-t border-primary-200/10 dark:border-primary-200/15">
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/15 dark:to-primary-800/15 border border-primary-200/20 dark:border-primary-200/30 rounded-md text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {log.alertType}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 border-t border-primary-200/10 dark:border-primary-200/15 dark:text-white">
                    <div className="flex gap-2 items-center">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSeverityColor(log.alertSeverity) }}
                      />
                      <span className="capitalize">{log.alertSeverity}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm border-t border-primary-200/10 dark:border-primary-200/15">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 border-t border-primary-200/10 dark:border-primary-200/15 dark:text-white">
                    {log.attempts}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 border-t border-primary-200/10 dark:border-primary-200/15 dark:text-white">
                    {log.responseTime ? `${log.responseTime}ms` : '-'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 whitespace-nowrap border-t border-primary-200/10 dark:border-primary-200/15 dark:text-gray-400">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
