// src/components/settings/EmailManagement.tsx
import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import { emailService, EmailData } from '../../services/email.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const EmailManagement: React.FC = () => {
    const [emails, setEmails] = useState<EmailData[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingEmail, setAddingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [resendingEmail, setResendingEmail] = useState<string | null>(null);
    const [removingEmail, setRemovingEmail] = useState<string | null>(null);
    const [confirmRemoveEmail, setConfirmRemoveEmail] = useState<string | null>(null);
    const [confirmPrimaryEmail, setConfirmPrimaryEmail] = useState<string | null>(null);
    const { showNotification } = useNotifications();

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        try {
            setLoading(true);
            const data = await emailService.getEmails();
            setEmails(data);
        } catch (error) {
            showNotification('Failed to load emails', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEmail || !newEmail.includes('@')) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        try {
            setAddingEmail(true);
            await emailService.addSecondaryEmail(newEmail);
            showNotification('Verification email sent! Please check your inbox.', 'success');
            setNewEmail('');
            await loadEmails();
        } catch (error: any) {
            showNotification(error.message || 'Failed to add email', 'error');
        } finally {
            setAddingEmail(false);
        }
    };

    const handleRemoveEmail = async (email: string) => {
        try {
            setRemovingEmail(email);
            await emailService.removeSecondaryEmail(email);
            showNotification('Email removed successfully', 'success');
            setConfirmRemoveEmail(null);
            await loadEmails();
        } catch (error: any) {
            showNotification(error.message || 'Failed to remove email', 'error');
        } finally {
            setRemovingEmail(null);
        }
    };

    const handleSetPrimary = async (email: string) => {
        try {
            await emailService.setPrimaryEmail(email);
            showNotification('Primary email updated successfully', 'success');
            setConfirmPrimaryEmail(null);
            await loadEmails();
        } catch (error: any) {
            showNotification(error.message || 'Failed to set primary email', 'error');
        }
    };

    const handleResendVerification = async (email: string) => {
        try {
            setResendingEmail(email);
            await emailService.resendVerification(email);
            showNotification('Verification email sent!', 'success');
        } catch (error: any) {
            showNotification(error.message || 'Failed to send verification email', 'error');
        } finally {
            setResendingEmail(null);
        }
    };

    const primaryEmail = emails.find(e => e.isPrimary);
    const secondaryEmails = emails.filter(e => !e.isPrimary);
    const canAddMore = secondaryEmails.length < 2;

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* Primary Email Section */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <h3 className="font-display font-semibold gradient-text text-lg mb-4 flex items-center gap-2">
                    <EnvelopeIcon className="h-6 w-6" />
                    Primary Email
                </h3>

                {primaryEmail && (
                    <div className="glass rounded-lg p-4 border border-primary-200/30 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
                                <EnvelopeIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-body text-light-text-primary dark:text-dark-text-primary font-medium">
                                        {primaryEmail.email}
                                    </p>
                                    <span className="glass px-2 py-0.5 rounded-full text-xs font-display font-semibold border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300">
                                        Primary
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    {primaryEmail.verified ? (
                                        <span className="flex items-center gap-1 text-sm font-body text-success-600 dark:text-success-400">
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Verified
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-1 text-sm font-body text-warning-600 dark:text-warning-400">
                                                <ExclamationCircleIcon className="h-4 w-4" />
                                                Not Verified
                                            </span>
                                            <button
                                                onClick={() => handleResendVerification(primaryEmail.email)}
                                                disabled={resendingEmail === primaryEmail.email}
                                                className="text-sm font-body text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline disabled:opacity-50"
                                            >
                                                {resendingEmail === primaryEmail.email ? 'Sending...' : 'Resend Verification'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Secondary Emails Section */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold gradient-text-secondary text-lg flex items-center gap-2">
                        <EnvelopeIcon className="h-6 w-6" />
                        Secondary Emails
                    </h3>
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {secondaryEmails.length}/2 used
                    </span>
                </div>

                {/* Secondary Email List */}
                <div className="space-y-3 mb-4">
                    {secondaryEmails.length === 0 ? (
                        <div className="glass rounded-lg p-6 border border-accent-200/30 text-center">
                            <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 text-accent-500 opacity-50" />
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                No secondary emails added yet
                            </p>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">
                                Add up to 2 additional email addresses
                            </p>
                        </div>
                    ) : (
                        secondaryEmails.map((email) => (
                            <div
                                key={email.email}
                                className="glass rounded-lg p-4 border border-secondary-200/30 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-secondary/20 flex items-center justify-center">
                                        <EnvelopeIcon className="h-5 w-5 text-secondary-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-body text-light-text-primary dark:text-dark-text-primary font-medium">
                                            {email.email}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            {email.verified ? (
                                                <span className="flex items-center gap-1 text-sm font-body text-success-600 dark:text-success-400">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="flex items-center gap-1 text-sm font-body text-warning-600 dark:text-warning-400">
                                                        <ExclamationCircleIcon className="h-4 w-4" />
                                                        Not Verified
                                                    </span>
                                                    <button
                                                        onClick={() => handleResendVerification(email.email)}
                                                        disabled={resendingEmail === email.email}
                                                        className="text-sm font-body text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline disabled:opacity-50"
                                                    >
                                                        {resendingEmail === email.email ? 'Sending...' : 'Resend'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {email.verified && (
                                        <button
                                            onClick={() => setConfirmPrimaryEmail(email.email)}
                                            className="btn-secondary text-sm"
                                        >
                                            Set as Primary
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setConfirmRemoveEmail(email.email)}
                                        disabled={removingEmail === email.email}
                                        className="p-2 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/20 text-danger-600 dark:text-danger-400 transition-colors disabled:opacity-50"
                                        title="Remove email"
                                    >
                                        {removingEmail === email.email ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-danger-600 border-t-transparent rounded-full" />
                                        ) : (
                                            <TrashIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Email Form */}
                {canAddMore && (
                    <form onSubmit={handleAddEmail} className="glass rounded-lg p-4 border border-info-200/30 bg-gradient-info/5">
                        <label className="block font-display font-medium gradient-text mb-2">
                            Add Secondary Email
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="input flex-1"
                                disabled={addingEmail}
                            />
                            <button
                                type="submit"
                                disabled={addingEmail || !newEmail}
                                className="btn-primary whitespace-nowrap"
                            >
                                {addingEmail ? 'Adding...' : 'Add Email'}
                            </button>
                        </div>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mt-2">
                            A verification email will be sent to verify ownership
                        </p>
                    </form>
                )}
            </div>

            {/* Confirm Remove Modal */}
            {confirmRemoveEmail && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-2xl max-w-md w-full">
                        <h3 className="font-display font-bold gradient-text-danger text-xl mb-4">
                            Remove Email Address
                        </h3>
                        <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-6">
                            Are you sure you want to remove <strong>{confirmRemoveEmail}</strong> from your account?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmRemoveEmail(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveEmail(confirmRemoveEmail)}
                                className="btn-danger"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Set Primary Modal */}
            {confirmPrimaryEmail && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-2xl max-w-md w-full">
                        <h3 className="font-display font-bold gradient-text-warning text-xl mb-4">
                            Change Primary Email
                        </h3>
                        <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-4">
                            Are you sure you want to change your primary email to <strong>{confirmPrimaryEmail}</strong>?
                        </p>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mb-6">
                            Your current primary email will become a secondary email.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmPrimaryEmail(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSetPrimary(confirmPrimaryEmail)}
                                className="btn-primary"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

