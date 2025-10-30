import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    ExternalLink,
    GitPullRequest,
    Loader,
    ChevronRight,
    Code,
    Sparkles
} from 'lucide-react';
import githubService, { IntegrationProgress } from '../../services/github.service';

interface PRStatusPanelProps {
    integrationId: string;
    onClose?: () => void;
    compact?: boolean;
}

const PRStatusPanel: React.FC<PRStatusPanelProps> = ({
    integrationId,
    onClose: _onClose,
    compact = false
}) => {
    const [progress, setProgress] = useState<IntegrationProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProgress = useCallback(async () => {
        try {
            setLoading(true);
            const data = await githubService.getIntegrationStatus(integrationId);
            setProgress(data);
            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load integration status');
        } finally {
            setLoading(false);
        }
    }, [integrationId]);

    useEffect(() => {
        loadProgress();

        // Poll for updates every 3 seconds if not complete
        const interval = setInterval(() => {
            if (progress?.status !== 'open' && progress?.status !== 'merged' && progress?.status !== 'closed' && progress?.status !== 'failed') {
                loadProgress();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [integrationId, progress?.status, loadProgress]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'initializing':
            case 'analyzing':
            case 'generating':
            case 'draft':
            case 'updating':
                return <Loader className="w-5 h-5 animate-spin text-primary-500" />;
            case 'open':
                return <GitPullRequest className="w-5 h-5 text-primary-500" />;
            case 'merged':
                return <CheckCircle className="w-5 h-5 text-success-500" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-danger-500" />;
            case 'closed':
                return <Clock className="w-5 h-5 text-secondary-500" />;
            default:
                return <Clock className="w-5 h-5 text-secondary-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'initializing':
            case 'analyzing':
            case 'generating':
            case 'draft':
            case 'updating':
                return 'bg-primary-500';
            case 'open':
                return 'bg-primary-500';
            case 'merged':
                return 'bg-success-500';
            case 'failed':
                return 'bg-danger-500';
            case 'closed':
                return 'bg-secondary-500';
            default:
                return 'bg-secondary-400';
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'initializing': 'Initializing',
            'analyzing': 'Analyzing Repository',
            'generating': 'Generating Code',
            'draft': 'Creating PR',
            'open': 'PR Open',
            'updating': 'Updating',
            'merged': 'Merged',
            'closed': 'Closed',
            'failed': 'Failed'
        };
        return statusMap[status] || status;
    };

    if (loading && !progress) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                    <p className="text-sm text-danger-800 dark:text-danger-200">{error}</p>
                </div>
            </div>
        );
    }

    if (!progress) {
        return null;
    }

    if (compact) {
        return (
            <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    {getStatusIcon(progress.status)}
                    <div className="flex-1">
                        <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {getStatusText(progress.status)}
                        </p>
                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                            {progress.currentStep}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {progress.progress}%
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getStatusColor(progress.status)} transition-all duration-500`}
                        style={{ width: `${progress.progress}%` }}
                    />
                </div>

                {progress.prUrl && (
                    <a
                        href={progress.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-lg transition-all shadow-lg focus-ring"
                    >
                        <GitPullRequest className="w-4 h-4" />
                        <span>View Pull Request</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-50 to-highlight-50 dark:from-primary-900/20 dark:to-highlight-900/20 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(progress.status)}
                        <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            {getStatusText(progress.status)}
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {progress.progress}%
                    </div>
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {progress.currentStep}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-secondary-50 dark:bg-secondary-900/30">
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getStatusColor(progress.status)} transition-all duration-500 relative overflow-hidden`}
                        style={{ width: `${progress.progress}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>
            </div>

            {/* Analysis Results */}
            {progress.analysis && (
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Repository Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Language</p>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                {progress.analysis.language || 'Detecting...'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Framework</p>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                {progress.analysis.framework || 'None detected'}
                            </p>
                        </div>
                        {progress.analysis.entryPoints && progress.analysis.entryPoints.length > 0 && (
                            <div className="col-span-2">
                                <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-1">Entry Points</p>
                                <div className="flex flex-wrap gap-2">
                                    {progress.analysis.entryPoints.slice(0, 3).map((entry: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
                                        >
                                            {entry}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Steps */}
            <div className="p-6">
                <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Integration Steps
                </h4>
                <div className="space-y-3">
                    {[
                        { key: 'initializing', label: 'Initialize integration', progress: 10 },
                        { key: 'analyzing', label: 'Analyze repository structure', progress: 30 },
                        { key: 'generating', label: 'Generate integration code', progress: 60 },
                        { key: 'draft', label: 'Create feature branch & PR', progress: 80 },
                        { key: 'open', label: 'Pull request ready', progress: 100 }
                    ].map((step, idx) => {
                        const isComplete = progress.progress >= step.progress;
                        const isCurrent = progress.progress >= (idx > 0 ? [10, 30, 60, 80, 100][idx - 1] : 0) && progress.progress < step.progress;

                        return (
                            <div key={step.key} className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isComplete
                                    ? 'bg-success-500 text-white'
                                    : isCurrent
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'
                                    }`}>
                                    {isComplete ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : isCurrent ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${isComplete || isCurrent
                                        ? 'text-light-text-primary dark:text-dark-text-primary font-medium'
                                        : 'text-light-text-muted dark:text-dark-text-muted'
                                        }`}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            {progress.prUrl && (
                <div className="p-6 bg-secondary-50 dark:bg-secondary-900/30 border-t border-secondary-200 dark:border-secondary-700">
                    <a
                        href={progress.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        <GitPullRequest className="w-5 h-5" />
                        <span className="font-semibold">View Pull Request on GitHub</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            )}

            {/* Error Message */}
            {progress.errorMessage && (
                <div className="p-6 bg-danger-50 dark:bg-danger-900/20 border-t border-danger-200 dark:border-danger-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-danger-800 dark:text-danger-200">Error Occurred</p>
                            <p className="text-sm text-danger-600 dark:text-danger-300 mt-1">{progress.errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PRStatusPanel;

