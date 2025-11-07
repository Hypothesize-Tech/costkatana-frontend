import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Clock, CheckCircle } from 'lucide-react';
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
                <div className="p-6 rounded-xl border glass border-warning-200/30 bg-warning-500/5">
                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-warning-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="mb-2 font-semibold font-display text-warning-600 dark:text-warning-400">
                                Account Pending Deletion
                            </h3>
                            <p className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
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
                <div className="p-6 rounded-xl border glass border-info-200/30 bg-info-500/5">
                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0">
                            <Clock className="w-6 h-6 text-info-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="mb-2 font-semibold font-display text-info-600 dark:text-info-400">
                                Cooldown Period Active
                            </h3>
                            <p className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
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
            <div className="p-6 rounded-xl border glass border-danger-200/30 bg-danger-500/5">
                <div className="flex gap-3 items-center mb-4">
                    <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold font-display gradient-text-danger">
                        Danger Zone
                    </h2>
                </div>

                <p className="mb-4 font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Once you close your account, there is no going back after the 30-day grace period.
                    Please be certain before proceeding.
                </p>

                {!isPending && !isInProcess && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex gap-2 items-center btn btn-danger"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>Close Account</span>
                    </button>
                )}
            </div>

            {/* Closure Modal */}
            {isModalOpen && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
                    <div className="p-6 w-full max-w-md rounded-2xl border shadow-2xl backdrop-blur-xl glass border-danger-200/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold font-display gradient-text-danger">
                                {modalStep === 'warning' && 'Close Account'}
                                {modalStep === 'email-sent' && 'Email Sent'}
                                {modalStep === 'cooldown' && 'Cooldown Active'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg transition-colors btn btn-ghost hover:bg-danger-500/10 hover:text-danger-500"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Step 1: Warning */}
                        {modalStep === 'warning' && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg border glass border-danger-200/30 bg-danger-500/10">
                                    <h4 className="mb-2 font-semibold font-display text-danger-600 dark:text-danger-400">
                                        This action will:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        <li className="flex gap-2 items-start">
                                            <span className="mt-1 text-danger-500">•</span>
                                            <span>Start a 24-hour cooldown period</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span className="mt-1 text-danger-500">•</span>
                                            <span>Give you 30 days to change your mind</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span className="mt-1 text-danger-500">•</span>
                                            <span>Permanently delete all your data after 30 days</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span className="mt-1 text-danger-500">•</span>
                                            <span>Delete API keys, usage data, and settings</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium font-display gradient-text">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full input"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium font-display gradient-text">
                                        Reason (Optional)
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Help us understand why you're leaving..."
                                        rows={3}
                                        className="w-full resize-none input"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 btn btn-secondary"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleInitiateClosure}
                                        className="flex-1 btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <div className="flex justify-center items-center mx-auto w-16 h-16 bg-gradient-to-br rounded-full ring-2 from-green-500/20 to-green-600/20 ring-green-500/30">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-lg font-semibold font-display">
                                        Check Your Email
                                    </h4>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        We've sent a confirmation link to your email address.
                                        Click the link to confirm account closure and start the 24-hour cooldown period.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full btn btn-primary"
                                >
                                    Got It
                                </button>
                            </div>
                        )}

                        {/* Step 3: Cooldown */}
                        {modalStep === 'cooldown' && cooldownEndsAt && (
                            <div className="space-y-4 text-center">
                                <div className="flex justify-center items-center mx-auto w-16 h-16 bg-gradient-to-br rounded-full ring-2 from-yellow-500/20 to-yellow-600/20 ring-yellow-500/30">
                                    <Clock className="w-10 h-10 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-lg font-semibold font-display">
                                        Cooldown Period
                                    </h4>
                                    <p className="mb-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Your account closure has been confirmed. The cooldown period ends in:
                                    </p>
                                    <p className="text-xl font-bold font-display gradient-text-warning">
                                        {formatTimeRemaining(cooldownEndsAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancelClosure}
                                    disabled={isLoading}
                                    className="w-full btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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

