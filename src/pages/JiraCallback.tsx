import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const JiraCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [_integrationId, setIntegrationId] = useState<string | null>(null);
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
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-3 sm:p-4">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 max-w-md w-full sm:p-8">
                    <div className="flex flex-col items-center text-center">
                        <LoadingSpinner />
                        <h2 className="text-lg font-display font-bold gradient-text-primary mt-4 mb-2 sm:text-xl sm:mt-6">
                            Connecting to JIRA...
                        </h2>
                        <p className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">
                            Please wait while we complete the connection.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-3 sm:p-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 max-w-md w-full sm:p-8">
                {status === 'success' ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-success flex items-center justify-center mb-4 shadow-lg shadow-success-500/30 sm:w-16 sm:h-16 sm:mb-6">
                            <CheckCircleIcon className="w-8 h-8 text-white sm:w-10 sm:h-10" />
                        </div>
                        <h2 className="text-xl font-display font-bold gradient-text-primary mb-2 sm:text-2xl">
                            Successfully Connected!
                        </h2>
                        <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-4 sm:text-sm sm:mb-6">
                            Your JIRA integration has been set up successfully.
                        </p>
                        <button
                            onClick={() => navigate('/integrations', { replace: true })}
                            className="w-full px-5 py-2.5 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary text-sm sm:px-6 sm:py-3 sm:text-base"
                        >
                            Go to Integrations
                        </button>
                        {autoRedirectCountdown > 0 && (
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-3 sm:mt-4">
                                Redirecting in {autoRedirectCountdown} seconds...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-danger flex items-center justify-center mb-4 shadow-lg shadow-danger-500/30 sm:w-16 sm:h-16 sm:mb-6">
                            <XCircleIcon className="w-8 h-8 text-white sm:w-10 sm:h-10" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-danger-600 dark:text-danger-400 mb-2 sm:text-2xl">
                            Connection Failed
                        </h2>
                        <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-4 break-words sm:text-sm sm:mb-6">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/integrations', { replace: true })}
                            className="w-full px-5 py-2.5 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary text-sm sm:px-6 sm:py-3 sm:text-base"
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

