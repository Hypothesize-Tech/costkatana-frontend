import React from 'react';
import { 
    ExclamationTriangleIcon, 
    CloudIcon, 
    InboxIcon, 
    LinkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export interface GoogleViewerStatesProps {
    state: 'disconnected' | 'empty' | 'error';
    serviceName: string;
    error?: string;
    onConnect?: () => void;
    onRetry?: () => void;
    suggestedCommand?: string;
}

export const GoogleViewerStates: React.FC<GoogleViewerStatesProps> = ({
    state,
    serviceName,
    error,
    onConnect,
    onRetry,
    suggestedCommand
}) => {
    if (state === 'disconnected') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <LinkIcon className="w-16 h-16 text-secondary-400 dark:text-secondary-600 mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    Google Account Not Connected
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md">
                    Connect your Google account to access {serviceName} and other Google Workspace services.
                </p>
                {onConnect && (
                    <button
                        onClick={onConnect}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <CloudIcon className="w-5 h-5" />
                        Connect Google Account
                    </button>
                )}
                <p className="text-sm text-secondary-500 dark:text-secondary-600 mt-4">
                    Go to Settings → Integrations to connect
                </p>
            </div>
        );
    }

    if (state === 'empty') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <InboxIcon className="w-16 h-16 text-secondary-400 dark:text-secondary-600 mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    No {serviceName} Found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md">
                    You don't have any {serviceName.toLowerCase()} yet.
                </p>
                {suggestedCommand && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200/30 dark:border-primary-500/20">
                        <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-2">
                            Try using chat commands:
                        </p>
                        <code className="text-sm font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded border border-primary-200/30 dark:border-primary-500/20">
                            {suggestedCommand}
                        </code>
                    </div>
                )}
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    Failed to Load {serviceName}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-2 max-w-md">
                    {error || 'An error occurred while loading your data.'}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Try Again
                    </button>
                )}
                <div className="mt-6 bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200/30 dark:border-red-500/20 max-w-md">
                    <p className="text-sm text-red-700 dark:text-red-400">
                        <strong>Possible solutions:</strong>
                    </p>
                    <ul className="text-sm text-red-600 dark:text-red-500 mt-2 text-left list-disc list-inside">
                        <li>Check your internet connection</li>
                        <li>Reconnect your Google account</li>
                        <li>Verify required permissions are granted</li>
                        <li>Contact support if the problem persists</li>
                    </ul>
                </div>
            </div>
        );
    }

    return null;
};

