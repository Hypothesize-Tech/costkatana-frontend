import React, { useState, useEffect } from 'react';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowUpIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { WorkflowQuotaStatus } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowQuotaStatusProps {
    onQuotaExceeded?: () => void;
    showUpgradeButton?: boolean;
}

export const WorkflowQuotaStatusComponent: React.FC<WorkflowQuotaStatusProps> = ({
    onQuotaExceeded,
    showUpgradeButton = true
}) => {
    const [quotaStatus, setQuotaStatus] = useState<WorkflowQuotaStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuotaStatus();
    }, []);

    const fetchQuotaStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await automationService.getWorkflowQuota();
            if (response.success) {
                setQuotaStatus(response.data);
                if (!response.data.canCreate && onQuotaExceeded) {
                    onQuotaExceeded();
                }
            }
        } catch (err) {
            setError('Failed to load quota status');
            console.error('Error fetching workflow quota:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !quotaStatus) {
        return (
            <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="font-body">{error || 'Failed to load quota status'}</span>
                </div>
            </div>
        );
    }

    const percentage = quotaStatus.percentage;
    const getStatusColor = () => {
        if (percentage >= 100) return 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
        if (percentage >= 90) return 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
        if (percentage >= 75) return 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700';
        return 'from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700';
    };

    const getStatusIcon = () => {
        if (percentage >= 100) return <XCircleIcon className="w-6 h-6 text-white" />;
        if (percentage >= 90) return <ExclamationTriangleIcon className="w-6 h-6 text-white" />;
        return <CheckCircleIcon className="w-6 h-6 text-white" />;
    };

    const getStatusText = () => {
        if (percentage >= 100) return 'Limit Reached';
        if (percentage >= 90) return 'Critical';
        if (percentage >= 75) return 'Warning';
        return 'Healthy';
    };

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor()} flex items-center justify-center shadow-lg`}>
                        {getStatusIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold gradient-text-primary">
                            Workflow Quota
                        </h3>
                        <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                            {quotaStatus.plan.charAt(0).toUpperCase() + quotaStatus.plan.slice(1)} Plan
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-display font-bold gradient-text-primary">
                        {quotaStatus.current} / {quotaStatus.limit === -1 ? '∞' : quotaStatus.limit}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                        {percentage.toFixed(1)}% used
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        {getStatusText()}
                    </span>
                    {quotaStatus.limit !== -1 && (
                        <span className="text-sm font-body font-semibold gradient-text-primary">
                            {quotaStatus.limit - quotaStatus.current} remaining
                        </span>
                    )}
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500`}
                        style={{
                            width: `${Math.min(percentage, 100)}%`
                        }}
                    />
                </div>
            </div>

            {/* Violation Warning */}
            {quotaStatus.violation && (
                <div className={`mb-4 p-4 rounded-lg border ${quotaStatus.violation.type === 'hard'
                    ? 'border-red-200/30 dark:border-red-500/20 bg-red-50/50 dark:bg-red-900/20'
                    : 'border-yellow-200/30 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/20'
                    }`}>
                    <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${quotaStatus.violation.type === 'hard'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                            }`} />
                        <div className="flex-1">
                            <p className={`text-sm font-body font-semibold ${quotaStatus.violation.type === 'hard'
                                ? 'text-red-800 dark:text-red-300'
                                : 'text-yellow-800 dark:text-yellow-300'
                                }`}>
                                {quotaStatus.violation.message}
                            </p>
                            {quotaStatus.violation.suggestions && quotaStatus.violation.suggestions.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {quotaStatus.violation.suggestions.map((suggestion, index) => {
                                        const violation = quotaStatus.violation!;
                                        return (
                                            <li key={index} className={`text-xs font-body ${violation.type === 'hard'
                                                ? 'text-red-700 dark:text-red-400'
                                                : 'text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                • {suggestion}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Button */}
            {showUpgradeButton && (percentage >= 75 || !quotaStatus.canCreate) && (
                <a
                    href="https://www.costkatana.com/#pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <ArrowUpIcon className="w-4 h-4" />
                    Upgrade Plan
                </a>
            )}

            {/* Info Message */}
            {quotaStatus.limit === -1 && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/20">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-xs font-body text-blue-800 dark:text-blue-300">
                        You have unlimited workflows on your {quotaStatus.plan} plan.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WorkflowQuotaStatusComponent;

