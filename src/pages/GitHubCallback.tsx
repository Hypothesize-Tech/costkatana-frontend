import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowRightIcon,
    HomeIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon,
    XCircleIcon as XCircleSolidIcon
} from '@heroicons/react/24/solid';
import githubService from '../services/github.service';

interface GitHubConnection {
    _id: string;
    githubUsername: string;
    avatarUrl?: string;
    repositories: Array<{ name: string; fullName: string }>;
    isActive: boolean;
}

const GitHubCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [connection, setConnection] = useState<GitHubConnection | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const path = location.pathname;

        if (path.includes('/github/success')) {
            const connectionId = params.get('connectionId');

            // Send message to parent window (OAuth popup)
            if (window.opener) {
                window.opener.postMessage({
                    type: 'github-oauth-success',
                    connectionId
                }, window.location.origin);
                window.close();
                return;
            }

            // If not in popup, fetch connection details and show success screen
            if (connectionId) {
                fetchConnectionDetails(connectionId);
            } else {
                setStatus('error');
                setErrorMessage('Connection ID not found');
            }
        } else if (path.includes('/github/error')) {
            const message = params.get('message') || 'An error occurred during GitHub connection';

            // Send error message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'github-oauth-error',
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

    const fetchConnectionDetails = async (connectionId: string) => {
        try {
            const connections = await githubService.listConnections();
            const foundConnection = connections.find(c => c._id === connectionId);

            if (foundConnection) {
                setConnection({
                    _id: foundConnection._id,
                    githubUsername: foundConnection.githubUsername || 'GitHub User',
                    avatarUrl: foundConnection.avatarUrl,
                    repositories: foundConnection.repositories || [],
                    isActive: foundConnection.isActive
                });
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage('Connection not found');
            }
        } catch (error) {
            console.error('Failed to fetch connection details:', error);
            setStatus('error');
            setErrorMessage('Failed to load connection details');
        }
    };

    // Auto-redirect countdown
    useEffect(() => {
        if (status === 'success' && autoRedirectCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoRedirectCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && autoRedirectCountdown === 0) {
            navigate('/github');
        }
    }, [status, autoRedirectCountdown, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-4 relative overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center relative z-10">
                    <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 glow-primary animate-pulse">
                        <ClockIcon className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-primary mb-3">
                        Completing GitHub Connection
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-300 text-base font-body">
                        Please wait while we finalize your connection...
                    </p>
                    <div className="mt-6 w-full bg-secondary-200 dark:bg-secondary-700/50 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-primary animate-pulse" style={{ width: '60%' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-4 relative overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger-500/8 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-md w-full glass rounded-2xl border border-danger-200/30 dark:border-danger-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 text-center relative z-10">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-gradient-danger rounded-full flex items-center justify-center mb-4 shadow-lg glow-danger">
                            <XCircleSolidIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold gradient-text-danger mb-3">
                            Connection Failed
                        </h2>
                        <p className="text-secondary-600 dark:text-secondary-300 font-body">
                            {errorMessage}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/github')}
                            className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub Settings
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <HomeIcon className="w-5 h-5" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-4 relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-success-500/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-lg w-full glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 text-center relative z-10">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mb-4 shadow-lg glow-success animate-bounce">
                        <CheckCircleSolidIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-bold gradient-text-success mb-3">
                        GitHub Connected Successfully!
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-300 font-body text-base">
                        Your GitHub account has been connected to CostKatana
                    </p>
                </div>

                {connection && (
                    <div className="mb-6 p-5 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center justify-center gap-4">
                            {connection.avatarUrl ? (
                                <div className="relative">
                                    <img
                                        src={connection.avatarUrl}
                                        alt={connection.githubUsername}
                                        className="w-14 h-14 rounded-full border-2 border-primary-300 dark:border-primary-600 shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white dark:border-secondary-800"></div>
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                            )}
                            <div className="text-left">
                                <p className="font-display font-semibold text-lg text-secondary-900 dark:text-white mb-1">
                                    @{connection.githubUsername}
                                </p>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300 font-medium">
                                    {connection.repositories.length} {connection.repositories.length === 1 ? 'repository' : 'repositories'} connected
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/github')}
                        className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>View GitHub Integrations</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                    {autoRedirectCountdown > 0 && (
                        <div className="mt-4 p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20">
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 font-medium flex items-center justify-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                Redirecting to GitHub Integrations in {autoRedirectCountdown} seconds...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GitHubCallback;

