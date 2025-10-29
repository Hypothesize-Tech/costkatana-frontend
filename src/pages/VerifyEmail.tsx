// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../config/api';

export const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        const verifyEmail = async () => {
            if (!token) {
                if (isMounted) {
                    setStatus('error');
                    setMessage('Invalid verification link');
                }
                return;
            }

            try {
                console.log('🔍 Starting email verification for token:', token);

                // Add minimum display time for "verifying" state (800ms)
                // This ensures users see the verification process
                const [response] = await Promise.all([
                    apiClient.get(`/auth/verify-email/${token}`),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);

                console.log('✅ Verification API response:', response.data);
                console.log('📊 Response status:', response.status);
                console.log('🔑 Success flag:', response.data?.success);

                if (!isMounted) {
                    console.log('⚠️ Component unmounted, skipping state update');
                    return;
                }

                if (response.data && response.data.success === true) {
                    console.log('🎉 Verification successful! Updating UI to success state');
                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully!');

                    // Redirect to dashboard after 3 seconds
                    timeoutId = setTimeout(() => {
                        if (isMounted) {
                            console.log('🚀 Redirecting to dashboard...');
                            navigate('/dashboard');
                        }
                    }, 3000);
                } else {
                    console.log('❌ Verification failed, success was not true');
                    setStatus('error');
                    setMessage(response.data?.message || 'Verification failed');
                }
            } catch (error: any) {
                console.error('💥 Verification error:', error);
                console.error('📋 Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });

                if (!isMounted) {
                    console.log('⚠️ Component unmounted during error, skipping state update');
                    return;
                }

                setStatus('error');
                setMessage(
                    error.response?.data?.message ||
                    'Verification failed. The link may be invalid or expired.'
                );
            }
        };

        verifyEmail();

        // Cleanup function
        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [token, navigate]);

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 border border-primary-200/30 shadow-2xl backdrop-blur-xl max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    {/* Status Icon */}
                    <div className="mb-6">
                        {status === 'verifying' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-primary/20 flex items-center justify-center glow-primary">
                                <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-success/20 flex items-center justify-center glow-success animate-bounce-once">
                                <CheckCircleIcon className="h-12 w-12 text-success-500" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-danger/20 flex items-center justify-center">
                                <XCircleIcon className="h-12 w-12 text-danger-500" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className={`text-2xl font-display font-bold mb-3 ${status === 'success' ? 'gradient-text-success' :
                        status === 'error' ? 'gradient-text-danger' :
                            'gradient-text'
                        }`}>
                        {status === 'verifying' && 'Verifying Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full">
                        {status === 'success' && (
                            <>
                                <button
                                    onClick={handleGoToDashboard}
                                    className="btn-primary w-full"
                                >
                                    Go to Dashboard
                                </button>
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    Redirecting automatically in 3 seconds...
                                </p>
                            </>
                        )}
                        {status === 'error' && (
                            <button
                                onClick={handleBackToLogin}
                                className="btn-secondary w-full"
                            >
                                Back to Login
                            </button>
                        )}
                        {status === 'verifying' && (
                            <div className="space-y-2">
                                <div className="h-2 bg-gradient-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-primary animate-progress" />
                                </div>
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    Please wait while we verify your email...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
        </div>
    );
};

export default VerifyEmail;

