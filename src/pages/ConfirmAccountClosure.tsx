import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { accountClosureService } from '../services/accountClosure.service';

export const ConfirmAccountClosure: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
    const [message, setMessage] = useState('Confirming account closure...');
    const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);

    useEffect(() => {
        const confirmClosure = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid confirmation link');
                return;
            }

            try {
                console.log('🔍 Starting account closure confirmation for token:', token);

                // Add minimum display time
                const [result] = await Promise.all([
                    accountClosureService.confirmAccountClosure(token),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);

                console.log('✅ Confirmation successful:', result);

                setStatus('success');
                setMessage('Account closure confirmed. Cooldown period started.');
                setCooldownEndsAt(new Date(result.cooldownEndsAt));

                // Redirect to login after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } catch (error: any) {
                console.error('💥 Confirmation error:', error);

                setStatus('error');
                setMessage(
                    error.response?.data?.message ||
                    'Confirmation failed. The link may be invalid or expired.'
                );
            }
        };

        confirmClosure();
    }, [token, navigate]);

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const formatCooldownTime = (date: Date) => {
        const hours = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60));
        const minutes = Math.floor(((date.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours} hours and ${minutes} minutes`;
    };

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 border border-danger-200/30 shadow-2xl backdrop-blur-xl max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    {/* Status Icon */}
                    <div className="mb-6">
                        {status === 'confirming' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-primary/20 flex items-center justify-center glow-primary">
                                <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-warning/20 flex items-center justify-center glow-warning">
                                <ClockIcon className="h-12 w-12 text-warning-500" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 rounded-full bg-gradient-danger/20 flex items-center justify-center">
                                <XCircleIcon className="h-12 w-12 text-danger-500" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className={`text-2xl font-display font-bold mb-3 ${status === 'success' ? 'gradient-text-warning' :
                        status === 'error' ? 'gradient-text-danger' :
                            'gradient-text'
                        }`}>
                        {status === 'confirming' && 'Confirming Account Closure'}
                        {status === 'success' && 'Closure Confirmed'}
                        {status === 'error' && 'Confirmation Failed'}
                    </h1>

                    {/* Message */}
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        {message}
                    </p>

                    {/* Success Details */}
                    {status === 'success' && cooldownEndsAt && (
                        <div className="w-full space-y-4 mb-6">
                            <div className="glass rounded-lg p-4 border border-warning-200/30 bg-warning-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <ClockIcon className="h-5 w-5 text-warning-500" />
                                    <h3 className="font-display font-semibold text-warning-600 dark:text-warning-400">
                                        24-Hour Cooldown Period
                                    </h3>
                                </div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Your account closure will be finalized in approximately {formatCooldownTime(cooldownEndsAt)}.
                                </p>
                            </div>

                            <div className="glass rounded-lg p-4 border border-info-200/30 bg-info-500/5">
                                <h3 className="font-display font-semibold text-info-600 dark:text-info-400 mb-2">
                                    What happens next?
                                </h3>
                                <ul className="text-sm text-left space-y-2 text-light-text-secondary dark:text-dark-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-info-500 mt-1">•</span>
                                        <span>After the cooldown, your account will enter a 30-day grace period</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-info-500 mt-1">•</span>
                                        <span>You can cancel anytime before cooldown ends</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-info-500 mt-1">•</span>
                                        <span>During grace period, simply log in to reactivate your account</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-info-500 mt-1">•</span>
                                        <span>After 30 days, all your data will be permanently deleted</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full">
                        {status === 'success' && (
                            <>
                                <button
                                    onClick={handleBackToLogin}
                                    className="btn-primary w-full"
                                >
                                    Back to Login
                                </button>
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    Redirecting automatically in 5 seconds...
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
                        {status === 'confirming' && (
                            <div className="space-y-2">
                                <div className="h-2 bg-gradient-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-primary animate-progress" />
                                </div>
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    Please wait while we confirm your request...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-danger-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
        </div>
    );
};

export default ConfirmAccountClosure;

