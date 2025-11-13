import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const DiscordCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [integrationId, setIntegrationId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const path = location.pathname;

        if (path.includes('/integrations/discord/success')) {
            const id = params.get('integrationId');

            // Send message to parent window (OAuth popup)
            if (window.opener) {
                window.opener.postMessage({
                    type: 'discord-oauth-success',
                    integrationId: id
                }, window.location.origin);
                window.close();
                return;
            }

            // If not in popup, show success screen
            if (id) {
                setIntegrationId(id);
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage('Integration ID not found');
            }
        } else if (path.includes('/integrations/discord/error')) {
            const message = params.get('message') || 'An error occurred during Discord connection';

            // Send error message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'discord-oauth-error',
                    message
                }, window.location.origin);
                window.close();
                return;
            }

            // If not in popup, show error screen
            setStatus('error');
            setErrorMessage(message);
        }
    }, [location]);

    // Auto-redirect on success
    useEffect(() => {
        if (status === 'success' && autoRedirectCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoRedirectCountdown(autoRedirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && autoRedirectCountdown === 0) {
            navigate('/integrations', { replace: true });
        }
    }, [status, autoRedirectCountdown, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Completing Discord OAuth...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <div className="max-w-md w-full glass rounded-xl border border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl font-display font-bold gradient-text-primary mb-3">
                        Discord Connected!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your Discord integration has been successfully set up. You can now use chat commands like <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">@discord:list-channels</code> and receive alerts!
                    </p>
                    {integrationId && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Integration ID: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{integrationId}</code>
                        </p>
                    )}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/integrations', { replace: true })}
                            className="w-full px-6 py-3 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all"
                        >
                            Go to Integrations
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Redirecting automatically in {autoRedirectCountdown} seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-md w-full glass rounded-xl border border-red-200/30 dark:border-red-500/40 bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 text-center shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-display font-bold text-red-600 dark:text-red-400 mb-3">
                    Connection Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {errorMessage}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/integrations', { replace: true })}
                        className="w-full px-6 py-3 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all"
                    >
                        Back to Integrations
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-3 rounded-lg text-sm font-semibold bg-white/80 dark:bg-gray-800/80 text-primary-600 dark:text-primary-400 border border-primary-200/30 dark:border-primary-200/40 hover:bg-primary-50/90 dark:hover:bg-primary-900/30 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscordCallback;

