import React, { useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AccountClosureStatus } from '../../types/auth.types';
import { accountClosureService } from '../../services/accountClosure.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';

interface AccountClosureBannerProps {
    closureStatus: AccountClosureStatus;
}

export const AccountClosureBanner: React.FC<AccountClosureBannerProps> = ({ closureStatus }) => {
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed || closureStatus.status !== 'pending_deletion') {
        return null;
    }

    const handleReactivate = async () => {
        try {
            setIsLoading(true);
            await accountClosureService.reactivateAccount();

            showNotification('Account reactivated successfully! Welcome back!', 'success');
            queryClient.invalidateQueries(['user-profile']);
            queryClient.invalidateQueries(['account-closure-status']);
            setIsDismissed(true);
        } catch (error: any) {
            showNotification(error.response?.data?.message || 'Failed to reactivate account', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const daysText = closureStatus.daysRemaining === 1 ? 'day' : 'days';

    return (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
            <div className="glass border-b border-warning-200/30 bg-gradient-to-r from-warning-500/10 to-danger-500/10 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-warning flex items-center justify-center glow-warning">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-warning-600 dark:text-warning-400 mb-1">
                                    Account Pending Deletion
                                </h3>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Your account will be permanently deleted in{' '}
                                    <span className="font-semibold text-warning-600 dark:text-warning-400">
                                        {closureStatus.daysRemaining} {daysText}
                                    </span>
                                    . Click below to reactivate.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReactivate}
                                disabled={isLoading}
                                className="btn-success whitespace-nowrap disabled:opacity-50"
                            >
                                {isLoading ? 'Reactivating...' : 'Reactivate Account'}
                            </button>
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                                aria-label="Dismiss"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

