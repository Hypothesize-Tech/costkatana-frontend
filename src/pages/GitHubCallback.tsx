import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
            } else {
                // If not in popup, redirect to chat
                navigate('/chat');
            }
        } else if (path.includes('/github/error')) {
            const message = params.get('message');

            // Send error message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'github-oauth-error',
                    message
                }, window.location.origin);
                window.close();
            } else {
                // If not in popup, redirect to chat with error
                navigate('/chat', { state: { error: message } });
            }
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                    {location.pathname.includes('/success') ? 'Completing GitHub connection...' : 'Handling error...'}
                </p>
            </div>
        </div>
    );
};

export default GitHubCallback;

