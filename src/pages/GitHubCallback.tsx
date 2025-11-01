import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Github } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-light-text-primary dark:text-dark-text-primary text-lg font-medium">
                        Completing GitHub connection...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
                <div className="max-w-md w-full bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                            Connection Failed
                        </h2>
                        <p className="text-light-text-muted dark:text-dark-text-muted">
                            {errorMessage}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/github')}
                            className="flex-1 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-medium"
                        >
                            Go to GitHub Settings
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
            <div className="max-w-lg w-full bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <CheckCircle className="w-10 h-10 text-success-600 dark:text-success-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                        GitHub Connected Successfully!
                    </h2>
                    <p className="text-light-text-muted dark:text-dark-text-muted">
                        Your GitHub account has been connected to CostKatana
                    </p>
                </div>

                {connection && (
                    <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            {connection.avatarUrl ? (
                                <img
                                    src={connection.avatarUrl}
                                    alt={connection.githubUsername}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <Github className="w-12 h-12 text-light-text-muted dark:text-dark-text-muted" />
                            )}
                            <div className="text-left">
                                <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    @{connection.githubUsername}
                                </p>
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                    {connection.repositories.length} {connection.repositories.length === 1 ? 'repository' : 'repositories'} connected
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/github')}
                        className="w-full px-4 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
                    >
                        View GitHub Integrations
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full px-4 py-3 bg-secondary-100 dark:bg-secondary-800 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-medium"
                    >
                        Go to Dashboard
                    </button>
                    {autoRedirectCountdown > 0 && (
                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-4">
                            Redirecting to GitHub Integrations in {autoRedirectCountdown} seconds...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GitHubCallback;

