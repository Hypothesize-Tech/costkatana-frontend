import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const JiraCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [integrationId, setIntegrationId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const path = location.pathname;

        if (path.includes('/integrations/jira/success')) {
            const id = params.get('integrationId');

            // Send message to parent window (OAuth popup)
            if (window.opener) {
                window.opener.postMessage({
                    type: 'jira-oauth-success',
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
        } else if (path.includes('/integrations/jira/error')) {
            const message = params.get('message') || 'An error occurred during JIRA connection';

            // Send error message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'jira-oauth-error',
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
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                        <LoadingSpinner />
                        <h2 className="text-xl font-display font-bold gradient-text-primary mt-6 mb-2">
                            Connecting to JIRA...
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                            Please wait while we complete the connection.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full">
                {status === 'success' ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center mb-6 shadow-lg shadow-success-500/30">
                            <CheckCircleIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                            Successfully Connected!
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                            Your JIRA integration has been set up successfully.
                        </p>
                        <button
                            onClick={() => navigate('/integrations', { replace: true })}
                            className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary"
                        >
                            Go to Integrations
                        </button>
                        {autoRedirectCountdown > 0 && (
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-4">
                                Redirecting in {autoRedirectCountdown} seconds...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-danger flex items-center justify-center mb-6 shadow-lg shadow-danger-500/30">
                            <XCircleIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400 mb-2">
                            Connection Failed
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/integrations', { replace: true })}
                            className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary"
                        >
                            Back to Integrations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JiraCallback;

