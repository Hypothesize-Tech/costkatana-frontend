import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const SubscriptionCancel: React.FC = () => {
    const navigate = useNavigate();
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

    // Auto-redirect after countdown
    useEffect(() => {
        if (autoRedirectCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoRedirectCountdown(autoRedirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (autoRedirectCountdown === 0) {
            navigate('/subscription', { replace: true });
        }
    }, [autoRedirectCountdown, navigate]);

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center p-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-warning flex items-center justify-center mb-6 shadow-lg shadow-warning-500/30">
                        <XCircleIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-warning mb-2">
                        Payment Cancelled
                    </h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                        Your payment was cancelled. No charges have been made. You can try again anytime.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => navigate('/pricing', { replace: true })}
                            className="flex-1 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary"
                        >
                            View Plans
                        </button>
                        <button
                            onClick={() => navigate('/subscription', { replace: true })}
                            className="flex-1 px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500/10 transition-all duration-300"
                        >
                            Go to Subscription
                        </button>
                    </div>
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

export default SubscriptionCancel;

