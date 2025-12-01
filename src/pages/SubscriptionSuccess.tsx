import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';

const SubscriptionSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<'loading' | 'success'>('loading');
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

    useEffect(() => {
        // Get query parameters from PayPal redirect
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const PayerID = params.get('PayerID');

        // Invalidate subscription query to refresh data
        queryClient.invalidateQueries(['subscription']);

        // If we have PayPal parameters, the payment was successful
        if (token || PayerID) {
            setStatus('success');
        } else {
            // Even without parameters, assume success if we're on this page
            setStatus('success');
        }
    }, [location, queryClient]);

    // Auto-redirect on success
    useEffect(() => {
        if (status === 'success' && autoRedirectCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoRedirectCountdown(autoRedirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && autoRedirectCountdown === 0) {
            navigate('/subscription', { replace: true });
        }
    }, [status, autoRedirectCountdown, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                        <LoadingSpinner />
                        <h2 className="text-xl font-display font-bold gradient-text-primary mt-6 mb-2">
                            Processing Payment...
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                            Please wait while we confirm your subscription.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center mb-6 shadow-lg shadow-success-500/30">
                        <CheckCircleIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                        Payment Successful!
                    </h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                        Your subscription has been activated successfully. You can now enjoy all the features of your plan.
                    </p>
                    <button
                        onClick={() => navigate('/subscription', { replace: true })}
                        className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary"
                    >
                        View Subscription
                    </button>
                    {autoRedirectCountdown > 0 && (
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-4">
                            Redirecting in {autoRedirectCountdown} seconds...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccess;

