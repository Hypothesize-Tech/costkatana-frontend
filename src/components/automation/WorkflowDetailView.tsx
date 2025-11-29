import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  BellIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import WorkflowPerformanceMetricsComponent from './WorkflowPerformanceMetrics';
import { WorkflowOptimizationRecommendations } from './WorkflowOptimizationRecommendations';
import { WorkflowROI } from './WorkflowROI';
import { WorkflowAlerts } from './WorkflowAlerts';
import { WorkflowVersionHistory } from './WorkflowVersionHistory';
import { automationService } from '../../services/automation.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowDetailViewProps {
  workflowId: string;
  onBack?: () => void;
  startDate?: string;
  endDate?: string;
}

export const WorkflowDetailView: React.FC<WorkflowDetailViewProps> = ({
  workflowId,
  onBack,
  startDate,
  endDate
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'recommendations' | 'roi' | 'alerts' | 'versions'>('metrics');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: endDate || new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchWorkflowInfo();
  }, [workflowId]);

  const fetchWorkflowInfo = async () => {
    try {
      setLoading(true);
      // Try to get workflow name from metrics
      const metricsResponse = await automationService.getWorkflowMetrics(workflowId, {
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      if (metricsResponse.success) {
        setWorkflowName(metricsResponse.data.workflowName);
      }
    } catch (err) {
      console.error('Error fetching workflow info:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'metrics' as const, label: 'Performance', icon: ChartBarIcon },
    { id: 'recommendations' as const, label: 'Optimization', icon: LightBulbIcon },
    { id: 'roi' as const, label: 'ROI Analysis', icon: CurrencyDollarIcon },
    { id: 'alerts' as const, label: 'Alerts', icon: BellIcon },
    { id: 'versions' as const, label: 'Versions', icon: ClockIcon },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">
              {workflowName || 'Workflow Details'}
            </h2>
            <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              {workflowId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
          />
          <span className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            to
          </span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                    : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'metrics' && (
          <WorkflowPerformanceMetricsComponent
            workflowId={workflowId}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        )}
        {activeTab === 'recommendations' && (
          <WorkflowOptimizationRecommendations
            workflowId={workflowId}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        )}
        {activeTab === 'roi' && (
          <WorkflowROI
            workflowId={workflowId}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        )}
        {activeTab === 'alerts' && (
          <WorkflowAlerts
            workflowId={workflowId}
          />
        )}
        {activeTab === 'versions' && (
          <WorkflowVersionHistory
            workflowId={workflowId}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailView;

