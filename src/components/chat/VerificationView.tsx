import React from 'react';
import { VerificationResult, TaskType } from '../../types/governedAgent';
import {
  XCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  LinkIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface VerificationViewProps {
  verification: VerificationResult;
  taskType?: TaskType;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  verification,
  taskType
}) => {
  // TaskType-specific configuration
  const getTaskTypeConfig = () => {
    switch (taskType) {
      case 'simple_query':
        return {
          Icon: MagnifyingGlassIcon,
          successTitle: 'Query Executed Successfully',
          failTitle: 'Query Execution Failed',
          successSubtitle: 'Your query completed without errors',
          failSubtitle: 'The query encountered issues during execution',
          gradient: 'from-highlight-500 to-highlight-600',
          showDeploymentUrls: false,
          showDataIntegrity: true
        };
      case 'complex_query':
        return {
          Icon: ChartBarIcon,
          successTitle: 'Complex Query Completed',
          failTitle: 'Complex Query Failed',
          successSubtitle: 'All query steps executed successfully',
          failSubtitle: 'Some query steps failed - review details below',
          gradient: 'from-highlight-500 to-highlight-600',
          showDeploymentUrls: false,
          showDataIntegrity: true
        };
      case 'cross_integration':
        return {
          Icon: LinkIcon,
          successTitle: 'Integration Complete',
          failTitle: 'Integration Failed',
          successSubtitle: 'Data successfully transferred between systems',
          failSubtitle: 'Integration encountered errors - check connections',
          gradient: 'from-primary-500 to-primary-600',
          showDeploymentUrls: false,
          showDataIntegrity: true
        };
      case 'data_transformation':
        return {
          Icon: ChartBarIcon,
          successTitle: 'Transformation Complete',
          failTitle: 'Transformation Failed',
          successSubtitle: 'All data transformed and processed successfully',
          failSubtitle: 'Data transformation encountered errors',
          gradient: 'from-accent-500 to-accent-600',
          showDeploymentUrls: false,
          showDataIntegrity: true
        };
      case 'coding':
        return {
          Icon: CodeBracketIcon,
          successTitle: 'Deployment Successful',
          failTitle: 'Deployment Failed',
          successSubtitle: 'Code generated and deployed successfully',
          failSubtitle: 'Deployment encountered issues - review logs below',
          gradient: 'from-primary-500 to-primary-600',
          showDeploymentUrls: true,
          showDataIntegrity: false
        };
      case 'research':
        return {
          Icon: BookOpenIcon,
          successTitle: 'Research Complete',
          failTitle: 'Research Failed',
          successSubtitle: 'Information gathered and synthesized successfully',
          failSubtitle: 'Research encountered issues',
          gradient: 'from-secondary-500 to-secondary-600',
          showDeploymentUrls: false,
          showDataIntegrity: false
        };
      default:
        return {
          Icon: CheckCircleIcon,
          successTitle: 'Task Completed Successfully',
          failTitle: 'Task Completed with Issues',
          successSubtitle: 'All verifications passed',
          failSubtitle: 'Some verifications failed - review recommendations below',
          gradient: 'from-success-500 to-success-600',
          showDeploymentUrls: true,
          showDataIntegrity: true
        };
    }
  };

  const taskConfig = getTaskTypeConfig();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700';
      case 'degraded':
      case 'warning':
        return 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-700';
      case 'unhealthy':
      case 'failed':
        return 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-700';
      default:
        return 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header with TaskType-specific messaging */}
      <div className={`rounded-xl border p-6 backdrop-blur-sm ${verification.success
        ? 'border-success-200/30 dark:border-success-700/30 bg-success-50/50 dark:bg-success-900/20'
        : 'border-danger-200/30 dark:border-danger-700/30 bg-danger-50/50 dark:bg-danger-900/20'
        }`}>
        <div className="flex items-center gap-4">
          {verification.success ? (
            <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${taskConfig.gradient} flex items-center justify-center shadow-lg`}>
              <taskConfig.Icon className="w-8 h-8 text-white" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center shadow-lg">
              <XCircleIcon className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h2 className={`text-2xl font-display font-bold ${verification.success
              ? 'text-success-900 dark:text-success-100'
              : 'text-danger-900 dark:text-danger-100'
              }`}>
              {verification.success ? taskConfig.successTitle : taskConfig.failTitle}
            </h2>
            <p className={`text-sm mt-1 ${verification.success
              ? 'text-success-700 dark:text-success-300'
              : 'text-danger-700 dark:text-danger-300'
              }`}>
              {verification.success ? taskConfig.successSubtitle : taskConfig.failSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Deployment URLs - Only show for coding tasks */}
      {taskConfig.showDeploymentUrls && verification.deploymentUrls && verification.deploymentUrls.length > 0 && (
        <div className="rounded-xl border border-highlight-200/30 dark:border-highlight-700/30 p-6 bg-highlight-50/50 dark:bg-highlight-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-highlight-500 to-highlight-600 flex items-center justify-center shadow-lg">
              <GlobeAltIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-highlight-900 dark:text-highlight-100">
              Deployment URLs
            </h3>
          </div>
          <div className="space-y-2">
            {verification.deploymentUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-4 rounded-lg bg-white dark:bg-dark-card border border-highlight-200/30 dark:border-highlight-700/30 hover:border-highlight-400 dark:hover:border-highlight-500 hover:shadow-md transition-all duration-300 group"
              >
                <span className="text-sm font-mono text-highlight-700 dark:text-highlight-300 truncate">
                  {url}
                </span>
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-highlight-600 dark:text-highlight-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Health Checks */}
      {verification.healthChecks && verification.healthChecks.length > 0 && (
        <div className="rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-secondary-100">
              {taskType === 'coding' ? 'Deployment Health' : 'Health Checks'}
            </h3>
          </div>
          <div className="space-y-3">
            {verification.healthChecks.map((check, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getHealthColor(check.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {check.name}
                  </span>
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded">
                    {check.status}
                  </span>
                </div>
                {(check as any).responseTime && (
                  <div className="flex items-center gap-2 text-xs">
                    <ClockIcon className="w-3 h-3" />
                    <span>Response time: {(check as any).responseTime}ms</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Integrity - Show for data-related tasks */}
      {taskConfig.showDataIntegrity && verification.dataIntegrity && (
        <div className="rounded-xl border border-primary-200/30 dark:border-primary-700/30 p-6 bg-primary-50/50 dark:bg-primary-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-primary-900 dark:text-primary-100">
              {taskType === 'data_transformation' ? 'Transformation Results' : 'Data Integrity'}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-700/30">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {verification.dataIntegrity.recordsProcessed}
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                Processed
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-success-200/30 dark:border-success-700/30">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {verification.dataIntegrity.recordsSuccessful}
              </p>
              <p className="text-xs text-success-700 dark:text-success-300 mt-1">
                Successful
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-danger-200/30 dark:border-danger-700/30">
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                {verification.dataIntegrity.recordsFailed}
              </p>
              <p className="text-xs text-danger-700 dark:text-danger-300 mt-1">
                Failed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TaskType-specific Recommendations */}
      {verification.recommendations && verification.recommendations.length > 0 && (
        <div className="rounded-xl border border-accent-200/30 dark:border-accent-700/30 p-6 bg-accent-50/50 dark:bg-accent-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
              <LightBulbIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-accent-900 dark:text-accent-100">
              {taskType === 'coding' ? 'Deployment Recommendations' :
                taskType === 'research' ? 'Research Insights' :
                  'Recommendations'}
            </h3>
          </div>
          <ul className="space-y-2">
            {verification.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-dark-card border border-accent-200/30 dark:border-accent-700/30"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm text-secondary-900 dark:text-secondary-100">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rollback Instructions */}
      {verification.rollbackInstructions && (
        <div className="rounded-xl border border-danger-200/30 dark:border-danger-700/30 p-6 bg-danger-50/50 dark:bg-danger-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center shadow-lg">
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-danger-900 dark:text-danger-100">
              {taskType === 'coding' ? 'Deployment Rollback' :
                taskType === 'data_transformation' ? 'Data Rollback' :
                  'Rollback Instructions'}
            </h3>
          </div>
          <pre className="text-xs text-secondary-700 dark:text-secondary-300 bg-white dark:bg-dark-card p-4 rounded-lg border border-danger-200/30 dark:border-danger-700/30 overflow-x-auto font-mono whitespace-pre-wrap">
            {verification.rollbackInstructions}
          </pre>
        </div>
      )}
    </div>
  );
};
