import React from 'react';
import { AgentMode, TaskType } from '../../types/governedAgent';
import {
    MagnifyingGlassIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    CheckCircleIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface ModeHeaderProps {
    current: AgentMode;
    taskType?: TaskType;
    status?: string;
    onModeClick?: (mode: AgentMode) => void;
}

export const ModeHeader: React.FC<ModeHeaderProps> = ({
    current,
    taskType,
    status,
    onModeClick
}) => {
    const getModeIcon = (mode: AgentMode) => {
        switch (mode) {
            case AgentMode.SCOPE:
                return <MagnifyingGlassIcon className="w-5 h-5" />;
            case AgentMode.PLAN:
                return <DocumentTextIcon className="w-5 h-5" />;
            case AgentMode.BUILD:
                return <Cog6ToothIcon className="w-5 h-5" />;
            case AgentMode.VERIFY:
                return <CheckCircleIcon className="w-5 h-5" />;
            case AgentMode.DONE:
                return <CheckBadgeIcon className="w-5 h-5" />;
            default:
                return <span className="w-2 h-2 rounded-full bg-secondary-400"></span>;
        }
    };

    const getModeLabel = (mode: AgentMode) => {
        return mode;
    };

    const modes = Object.values(AgentMode);
    const currentIndex = modes.indexOf(current);

    return (
        <div className="border-b border-secondary-200/30 dark:border-secondary-700/30 bg-white dark:bg-dark-card px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {modes.map((mode, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;
                        const isClickable = isCompleted || isActive;

                        return (
                            <React.Fragment key={mode}>
                                <button
                                    onClick={() => isClickable && onModeClick?.(mode)}
                                    disabled={!isClickable}
                                    className={`flex flex-col items-center gap-2 transition-all duration-300 ${isActive ? 'scale-110' : isCompleted ? 'opacity-100' : 'opacity-40'
                                        } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
                                        }`}
                                    title={isClickable ? `Go to ${getModeLabel(mode)}` : `${getModeLabel(mode)} (locked)`}
                                >
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg animate-pulse'
                                        : isCompleted
                                            ? 'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-md hover:shadow-lg'
                                            : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400'
                                        }`}>
                                        {getModeIcon(mode)}
                                    </div>
                                    <div className={`text-xs font-display font-semibold uppercase tracking-wide transition-all duration-300 ${isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : isCompleted
                                            ? 'text-success-600 dark:text-success-400'
                                            : 'text-secondary-400 dark:text-secondary-600'
                                        }`}>
                                        {getModeLabel(mode)}
                                    </div>
                                </button>

                                {/* Connector Line */}
                                {index < modes.length - 1 && (
                                    <div className={`h-0.5 w-12 rounded-full transition-all duration-300 ${index < currentIndex
                                        ? 'bg-gradient-to-r from-success-500 to-success-600'
                                        : 'bg-secondary-200 dark:bg-secondary-700'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3">
                    {taskType && (
                        <div className="px-3 py-1.5 rounded-lg border border-primary-200/30 dark:border-primary-700/30 bg-primary-50/50 dark:bg-primary-900/20 backdrop-blur-sm">
                            <span className="text-xs font-display font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                                {taskType.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}

                    {status && (
                        <div className={`px-3 py-1.5 rounded-lg border backdrop-blur-sm ${status === 'pending' ? 'border-accent-200/30 dark:border-accent-700/30 bg-accent-50/50 dark:bg-accent-900/20' :
                            status === 'in_progress' ? 'border-highlight-200/30 dark:border-highlight-700/30 bg-highlight-50/50 dark:bg-highlight-900/20' :
                                status === 'completed' ? 'border-success-200/30 dark:border-success-700/30 bg-success-50/50 dark:bg-success-900/20' :
                                    status === 'failed' ? 'border-danger-200/30 dark:border-danger-700/30 bg-danger-50/50 dark:bg-danger-900/20' :
                                        'border-secondary-200/30 dark:border-secondary-700/30 bg-secondary-50/50 dark:bg-secondary-900/20'
                            }`}>
                            <span className={`text-xs font-display font-semibold uppercase tracking-wide ${status === 'pending' ? 'text-accent-600 dark:text-accent-400' :
                                status === 'in_progress' ? 'text-highlight-600 dark:text-highlight-400' :
                                    status === 'completed' ? 'text-success-600 dark:text-success-400' :
                                        status === 'failed' ? 'text-danger-600 dark:text-danger-400' :
                                            'text-secondary-600 dark:text-secondary-400'
                                }`}>
                                {status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
