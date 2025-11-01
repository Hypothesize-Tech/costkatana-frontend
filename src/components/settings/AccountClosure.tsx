import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import { accountClosureService } from '../../services/accountClosure.service';
import { AccountClosureStatus } from '../../types/auth.types';
import { useQueryClient } from '@tanstack/react-query';

export const AccountClosure: React.FC = () => {
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<'warning' | 'email-sent' | 'cooldown'>('warning');
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [closureStatus, setClosureStatus] = useState<AccountClosureStatus | null>(null);
    const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);

    // Load closure status on component mount
    useEffect(() => {
        loadClosureStatus();
    }, []);

    const loadClosureStatus = async () => {
        try {
            const status = await accountClosureService.getAccountClosureStatus();
            setClosureStatus(status);

            if (status.cooldownEndsAt && !status.confirmationStatus.cooldownCompleted) {
                setCooldownEndsAt(new Date(status.cooldownEndsAt));
                setModalStep('cooldown');
            }
        } catch (error: any) {
            console.error('Error loading closure status:', error);
        }
    };

    const handleInitiateClosure = async () => {
        if (!password.trim()) {
            showNotification('Please enter your password', 'error');
            return;
        }

        try {
            setIsLoading(true);
            await accountClosureService.initiateAccountClosure(password, reason || undefined);

            setModalStep('email-sent');
            setPassword('');
            showNotification('Verification email sent! Please check your inbox.', 'success');

            // Reload status
            await loadClosureStatus();
        } catch (error: any) {
            showNotification(error.response?.data?.message || 'Failed to initiate account closure', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClosure = async () => {
        try {
            setIsLoading(true);
            await accountClosureService.cancelAccountClosure();

            showNotification('Account closure cancelled successfully', 'success');
            setIsModalOpen(false);
            setModalStep('warning');
            await loadClosureStatus();
            queryClient.invalidateQueries(['user-profile']);
        } catch (error: any) {
            showNotification(error.response?.data?.message || 'Failed to cancel closure', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReactivate = async () => {
        try {
            setIsLoading(true);
            await accountClosureService.reactivateAccount();

            showNotification('Account reactivated successfully! Welcome back!', 'success');
            await loadClosureStatus();
            queryClient.invalidateQueries(['user-profile']);
        } catch (error: any) {
            showNotification(error.response?.data?.message || 'Failed to reactivate account', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeRemaining = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff <= 0) return 'Cooldown ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    const isPending = closureStatus?.status === 'pending_deletion';
    const isInProcess = closureStatus?.confirmationStatus?.passwordConfirmed &&
        !closureStatus?.confirmationStatus?.cooldownCompleted;

    return (
        <div className="space-y-6">
            {/* Reactivation Banner for Pending Deletion */}
            {isPending && (
                <div className="glass rounded-xl p-6 border border-warning-200/30 bg-warning-500/5">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-warning-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-semibold text-warning-600 dark:text-warning-400 mb-2">
                                Account Pending Deletion
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                Your account is scheduled for permanent deletion in {closureStatus.daysRemaining} days.
                                You can reactivate your account at any time before then.
                            </p>
                            <button
                                onClick={handleReactivate}
                                disabled={isLoading}
                                className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Reactivating...' : 'Reactivate My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cooldown Status */}
            {isInProcess && cooldownEndsAt && (
                <div className="glass rounded-xl p-6 border border-info-200/30 bg-info-500/5">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-6 w-6 text-info-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-semibold text-info-600 dark:text-info-400 mb-2">
                                Cooldown Period Active
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                Your account closure has been confirmed. There's a 24-hour cooldown period before it takes effect.
                                {' '}{formatTimeRemaining(cooldownEndsAt)}
                            </p>
                            <button
                                onClick={handleCancelClosure}
                                disabled={isLoading}
                                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Cancelling...' : 'Cancel Closure'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Danger Zone */}
            <div className="glass rounded-xl p-6 border border-danger-200/30 bg-danger-500/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-danger">
                        Danger Zone
                    </h2>
                </div>

                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    Once you close your account, there is no going back after the 30-day grace period.
                    Please be certain before proceeding.
                </p>

                {!isPending && !isInProcess && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-danger flex items-center gap-2"
                    >
                        <TrashIcon className="h-5 w-5" />
                        <span>Close Account</span>
                    </button>
                )}
            </div>

            {/* Closure Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="glass rounded-2xl p-6 border border-danger-200/30 shadow-2xl backdrop-blur-xl max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-display font-bold gradient-text-danger">
                                {modalStep === 'warning' && 'Close Account'}
                                {modalStep === 'email-sent' && 'Email Sent'}
                                {modalStep === 'cooldown' && 'Cooldown Active'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-ghost p-2 rounded-lg hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Step 1: Warning */}
                        {modalStep === 'warning' && (
                            <div className="space-y-4">
                                <div className="glass rounded-lg p-4 border border-danger-200/30 bg-danger-500/10">
                                    <h4 className="font-display font-semibold text-danger-600 dark:text-danger-400 mb-2">
                                        This action will:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        <li className="flex items-start gap-2">
                                            <span className="text-danger-500 mt-1">•</span>
                                            <span>Start a 24-hour cooldown period</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-danger-500 mt-1">•</span>
                                            <span>Give you 30 days to change your mind</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-danger-500 mt-1">•</span>
                                            <span>Permanently delete all your data after 30 days</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-danger-500 mt-1">•</span>
                                            <span>Delete API keys, usage data, and settings</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block font-display font-medium gradient-text mb-2">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block font-display font-medium gradient-text mb-2">
                                        Reason (Optional)
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Help us understand why you're leaving..."
                                        rows={3}
                                        className="input w-full resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn btn-secondary flex-1"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleInitiateClosure}
                                        className="btn btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isLoading || !password.trim()}
                                    >
                                        {isLoading ? 'Processing...' : 'Continue'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Email Sent */}
                        {modalStep === 'email-sent' && (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center ring-2 ring-green-500/30">
                                    <CheckCircleIcon className="h-10 w-10 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold text-lg mb-2">
                                        Check Your Email
                                    </h4>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        We've sent a confirmation link to your email address.
                                        Click the link to confirm account closure and start the 24-hour cooldown period.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-primary w-full"
                                >
                                    Got It
                                </button>
                            </div>
                        )}

                        {/* Step 3: Cooldown */}
                        {modalStep === 'cooldown' && cooldownEndsAt && (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center ring-2 ring-yellow-500/30">
                                    <ClockIcon className="h-10 w-10 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold text-lg mb-2">
                                        Cooldown Period
                                    </h4>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Your account closure has been confirmed. The cooldown period ends in:
                                    </p>
                                    <p className="text-xl font-display font-bold gradient-text-warning">
                                        {formatTimeRemaining(cooldownEndsAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancelClosure}
                                    disabled={isLoading}
                                    className="btn btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Cancelling...' : 'Cancel Closure'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

