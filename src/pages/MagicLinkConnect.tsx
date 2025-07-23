import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const MagicLinkConnect: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [apiKey, setApiKey] = useState<string>('');
    const [projectInfo, setProjectInfo] = useState<any>(null);

    useEffect(() => {
        const handleMagicLink = async () => {
            const token = searchParams.get('token');
            const data = searchParams.get('data');

            if (!token || !data) {
                setStatus('error');
                return;
            }

            try {
                // Decode the magic link data
                const decodedData = JSON.parse(atob(decodeURIComponent(data)));

                // Check if expired
                if (new Date() > new Date(decodedData.expiresAt)) {
                    setStatus('expired');
                    return;
                }

                // Call the backend to complete onboarding
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://cost-katana-backend.store';
                const response = await fetch(`${apiBaseUrl}/api/onboarding/complete?token=${token}&data=${encodeURIComponent(data)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const result = await response.text();

                    // Parse the HTML response to extract the success data
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(result, 'text/html');

                    // Extract API key and project info from the HTML
                    const apiKeyElement = doc.getElementById('apiKey');
                    if (apiKeyElement) {
                        setApiKey(apiKeyElement.textContent || '');
                    }

                    setUserInfo({
                        email: decodedData.email,
                        name: decodedData.name || decodedData.email.split('@')[0]
                    });

                    setProjectInfo({
                        name: 'My ChatGPT Project',
                        budget: '$100 monthly'
                    });

                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Magic link processing error:', error);
                setStatus('error');
            }
        };

        handleMagicLink();
    }, [searchParams]);

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        alert('API key copied to clipboard!');
    };

    const returnToChatGPT = () => {
        // Post message to parent window (ChatGPT) if opened in popup
        if (window.opener) {
            window.opener.postMessage({
                type: 'COST_KATANA_CONNECTED',
                data: {
                    apiKey,
                    userEmail: userInfo?.email,
                    projectName: projectInfo?.name,
                    status: 'success'
                }
            }, '*');
            window.close();
        } else {
            // Redirect to dashboard if not in popup
            navigate('/dashboard');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-gray-600">Setting up your Cost Katana account...</p>
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-6xl mb-4">⏰</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
                        <p className="text-gray-600 mb-6">
                            This magic link has expired. Please generate a new one from ChatGPT.
                        </p>
                        <button
                            onClick={() => window.close()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>
                        <p className="text-gray-600 mb-6">
                            There was an error setting up your account. Please try generating a new magic link from ChatGPT.
                        </p>
                        <button
                            onClick={() => window.close()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-4">
                        Successfully Connected to Cost Katana!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Welcome {userInfo?.name}! Your ChatGPT integration is ready.
                    </p>

                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="font-semibold text-green-800 mb-2">✅ What's been set up:</h3>
                            <ul className="text-left text-green-700 space-y-2">
                                <li>🔑 API Key generated for ChatGPT integration</li>
                                <li>📁 Default project created: "{projectInfo?.name}"</li>
                                <li>👤 Account ready for {userInfo?.email}</li>
                                <li>🤖 AI-powered cost tracking enabled</li>
                            </ul>
                        </div>

                        {apiKey && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">🔑 Your API Key:</h3>
                                <div className="bg-white border rounded p-3 font-mono text-sm break-all">
                                    {apiKey}
                                </div>
                                <button
                                    onClick={copyApiKey}
                                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Copy API Key
                                </button>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-800 mb-2">🔄 Next Steps:</h3>
                            <p className="text-blue-700 mb-4">
                                You can now return to ChatGPT and start tracking your AI costs!
                            </p>
                            <button
                                onClick={returnToChatGPT}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                            >
                                🚀 Return to ChatGPT & Start Tracking
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>This window will close automatically in a few seconds.</p>
                        </div>
                    </div>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                    // Auto-close after 10 seconds if opened in popup
                    setTimeout(() => {
                        if (window.opener) {
                            window.close();
                        }
                    }, 10000);
                `
            }} />
        </div>
    );
};

export default MagicLinkConnect; 