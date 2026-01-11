import React from 'react';
import { ExecutionProgress, ProgressUpdate, TaskType } from '../../types/governedAgent';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlayIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    LinkIcon,
    CodeBracketIcon,
    BookOpenIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface BuildProgressViewProps {
    progress?: ExecutionProgress;
    progressUpdates?: ProgressUpdate[];
    taskType?: TaskType;
    onCancel?: () => void;
}

export const BuildProgressView: React.FC<BuildProgressViewProps> = ({
    progress,
    progressUpdates = [],
    taskType,
    onCancel
}) => {
    // TaskType-specific configuration
    const getTaskTypeConfig = () => {
        switch (taskType) {
            case 'simple_query':
                return {
                    Icon: MagnifyingGlassIcon,
                    title: 'Executing Query',
                    description: 'Running your query...',
                    gradient: 'from-highlight-500 to-highlight-600',
                    bgColor: 'bg-highlight-50/50 dark:bg-highlight-900/20',
                    borderColor: 'border-highlight-200/30 dark:border-highlight-700/30',
                    textColor: 'text-highlight-600 dark:text-highlight-400',
                    progressColor: 'from-highlight-500 to-highlight-600'
                };
            case 'complex_query':
                return {
                    Icon: ChartBarIcon,
                    title: 'Executing Complex Query',
                    description: 'Processing multi-step query...',
                    gradient: 'from-highlight-500 to-highlight-600',
                    bgColor: 'bg-highlight-50/50 dark:bg-highlight-900/20',
                    borderColor: 'border-highlight-200/30 dark:border-highlight-700/30',
                    textColor: 'text-highlight-600 dark:text-highlight-400',
                    progressColor: 'from-highlight-500 to-highlight-600'
                };
            case 'cross_integration':
                return {
                    Icon: LinkIcon,
                    title: 'Integrating Systems',
                    description: 'Connecting and transferring data...',
                    gradient: 'from-primary-500 to-primary-600',
                    bgColor: 'bg-primary-50/50 dark:bg-primary-900/20',
                    borderColor: 'border-primary-200/30 dark:border-primary-700/30',
                    textColor: 'text-primary-600 dark:text-primary-400',
                    progressColor: 'from-primary-500 to-primary-600'
                };
            case 'data_transformation':
                return {
                    Icon: ChartBarIcon,
                    title: 'Transforming Data',
                    description: 'Processing and transforming data...',
                    gradient: 'from-accent-500 to-accent-600',
                    bgColor: 'bg-accent-50/50 dark:bg-accent-900/20',
                    borderColor: 'border-accent-200/30 dark:border-accent-700/30',
                    textColor: 'text-accent-600 dark:text-accent-400',
                    progressColor: 'from-accent-500 to-accent-600'
                };
            case 'coding':
                return {
                    Icon: CodeBracketIcon,
                    title: 'Building & Deploying',
                    description: 'Generating code and deploying...',
                    gradient: 'from-primary-500 to-primary-600',
                    bgColor: 'bg-primary-50/50 dark:bg-primary-900/20',
                    borderColor: 'border-primary-200/30 dark:border-primary-700/30',
                    textColor: 'text-primary-600 dark:text-primary-400',
                    progressColor: 'from-primary-500 to-primary-600'
                };
            case 'research':
                return {
                    Icon: BookOpenIcon,
                    title: 'Conducting Research',
                    description: 'Searching and synthesizing information...',
                    gradient: 'from-secondary-500 to-secondary-600',
                    bgColor: 'bg-secondary-50/50 dark:bg-secondary-900/20',
                    borderColor: 'border-secondary-200/30 dark:border-secondary-700/30',
                    textColor: 'text-secondary-600 dark:text-secondary-400',
                    progressColor: 'from-secondary-500 to-secondary-600'
                };
            default:
                return {
                    Icon: Cog6ToothIcon,
                    title: 'Executing Task',
                    description: 'Building your solution...',
                    gradient: 'from-primary-500 to-primary-600',
                    bgColor: 'bg-primary-50/50 dark:bg-primary-900/20',
                    borderColor: 'border-primary-200/30 dark:border-primary-700/30',
                    textColor: 'text-primary-600 dark:text-primary-400',
                    progressColor: 'from-primary-500 to-primary-600'
                };
        }
    };

    const taskConfig = getTaskTypeConfig();

    const getProgressPercentage = () => {
        if (!progress) return 0;
        const completed = progress.completedSteps.length;
        const total = progress.totalSteps;
        return total > 0 ? (completed / total) * 100 : 0;
    };

    const formatDuration = (startTime: Date) => {
        const elapsed = Date.now() - new Date(startTime).getTime();
        const seconds = Math.floor(elapsed / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
                return <PlayIcon className="w-4 h-4 text-highlight-600 dark:text-highlight-400 animate-pulse" />;
            case 'completed':
                return <CheckCircleIcon className="w-4 h-4 text-success-600 dark:text-success-400" />;
            case 'failed':
                return <XCircleIcon className="w-4 h-4 text-danger-600 dark:text-danger-400" />;
            default:
                return <ExclamationCircleIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'border-highlight-200 dark:border-highlight-700 bg-highlight-50 dark:bg-highlight-900/20';
            case 'completed':
                return 'border-success-200 dark:border-success-700 bg-success-50 dark:bg-success-900/20';
            case 'failed':
                return 'border-danger-200 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/20';
            default:
                return 'border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/20';
        }
    };

    return (
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Header with Task Type */}
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${taskConfig.gradient} flex items-center justify-center shadow-lg animate-pulse`}>
                    <taskConfig.Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-secondary-100">
                        {taskConfig.title}
                    </h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {taskConfig.description}
                    </p>
                </div>
            </div>

            {progress && (
                <>
                    {/* Progress Bar with TaskType color */}
                    <div className={`rounded-xl border ${taskConfig.borderColor} p-6 ${taskConfig.bgColor} backdrop-blur-sm`}>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`font-semibold ${taskConfig.textColor}`}>
                                    Progress
                                </span>
                                <span className={`${taskConfig.textColor} font-mono`}>
                                    {progress.completedSteps.length} / {progress.totalSteps} steps
                                </span>
                            </div>

                            <div className="relative h-3 bg-white dark:bg-dark-card rounded-full overflow-hidden border border-secondary-200/30 dark:border-secondary-700/30">
                                <div
                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${taskConfig.progressColor} rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${getProgressPercentage()}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>

                            <div className="text-center">
                                <span className={`text-2xl font-bold ${taskConfig.textColor}`}>
                                    {Math.round(getProgressPercentage())}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className={`rounded-xl border ${taskConfig.borderColor} p-4 ${taskConfig.bgColor} backdrop-blur-sm`}>
                            <p className={`text-xs ${taskConfig.textColor} font-semibold mb-1`}>Current Phase</p>
                            <p className={`text-lg font-bold ${taskConfig.textColor}`}>
                                {progress.currentPhase} / {progress.totalPhases}
                            </p>
                        </div>

                        <div className="rounded-xl border border-success-200/30 dark:border-success-700/30 p-4 bg-success-50/50 dark:bg-success-900/20 backdrop-blur-sm">
                            <p className="text-xs text-success-600 dark:text-success-400 font-semibold mb-1 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                Elapsed Time
                            </p>
                            <p className="text-lg font-bold text-success-700 dark:text-success-300">
                                {formatDuration(progress.startTime)}
                            </p>
                        </div>

                        {progress.estimatedCompletionTime && (
                            <div className="rounded-xl border border-accent-200/30 dark:border-accent-700/30 p-4 bg-accent-50/50 dark:bg-accent-900/20 backdrop-blur-sm">
                                <p className="text-xs text-accent-600 dark:text-accent-400 font-semibold mb-1">Est. Completion</p>
                                <p className="text-lg font-bold text-accent-700 dark:text-accent-300">
                                    {new Date(progress.estimatedCompletionTime).toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Live Progress Updates */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${taskConfig.textColor.replace('text-', 'bg-')} animate-pulse`}></div>
                    <h3 className="font-display font-bold text-secondary-900 dark:text-secondary-100">
                        Live Progress Log
                    </h3>
                </div>

                <div className="rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 max-h-96 overflow-y-auto backdrop-blur-sm">
                    {progressUpdates.length === 0 ? (
                        <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
                            <div className={`w-12 h-12 mx-auto mb-3 opacity-50 rounded-lg bg-gradient-to-br ${taskConfig.gradient} flex items-center justify-center animate-pulse`}>
                                <taskConfig.Icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm">Waiting for {taskConfig.title.toLowerCase()}...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-secondary-200/30 dark:divide-secondary-700/30">
                            {progressUpdates.map((update, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 border-l-4 ${getStatusColor(update.status)} transition-all duration-300 animate-fade-in`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStatusIcon(update.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-mono font-semibold text-secondary-700 dark:text-secondary-300">
                                                    Step {update.step}/{update.total}
                                                </span>
                                                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                                    {new Date(update.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-secondary-900 dark:text-secondary-100 font-medium">
                                                {update.action}
                                            </p>
                                            {update.error && (
                                                <div className="mt-2 p-2 rounded bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700">
                                                    <p className="text-xs text-danger-700 dark:text-danger-300 font-mono">
                                                        {update.error}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Failed Steps */}
            {progress && progress.failedSteps.length > 0 && (
                <div className="rounded-xl border border-danger-200/30 dark:border-danger-700/30 p-6 bg-danger-50/50 dark:bg-danger-900/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <XCircleIcon className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                        <h3 className="text-lg font-display font-bold text-danger-900 dark:text-danger-100">
                            Failed Steps ({progress.failedSteps.length})
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {progress.failedSteps.map((failedStep, idx) => (
                            <li key={idx} className="p-3 rounded-lg bg-white dark:bg-dark-card border border-danger-200/30 dark:border-danger-700/30">
                                <p className="text-sm font-semibold text-danger-900 dark:text-danger-100 mb-1">
                                    {failedStep.stepId}
                                </p>
                                <p className="text-xs text-danger-700 dark:text-danger-300 font-mono">
                                    {failedStep.error}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Cancel Button with TaskType color */}
            {onCancel && (
                <div className="sticky bottom-0 bg-white dark:bg-dark-card border-t border-secondary-200/30 dark:border-secondary-700/30 p-4 -m-6 mt-6">
                    <button
                        onClick={onCancel}
                        className="w-full px-6 py-3 rounded-xl border border-danger-200 dark:border-danger-700 bg-white dark:bg-dark-card text-danger-600 dark:text-danger-400 font-semibold hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <XCircleIcon className="w-5 h-5" />
                        Cancel {taskConfig.title}
                    </button>
                </div>
            )}
        </div>
    );
};
