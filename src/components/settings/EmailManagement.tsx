import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { emailService, EmailData } from '../../services/email.service';
import { EmailManagementShimmer } from '../shimmer/SettingsShimmer';

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
        return <EmailManagementShimmer />;
    }

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Primary Email Section - Responsive */}
            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
                <h3 className="flex gap-1.5 items-center mb-3 text-base font-semibold font-display gradient-text sm:gap-2 sm:mb-4 sm:text-lg">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                    Primary Email
                </h3>

                {primaryEmail && (
                    <div className="flex flex-col gap-3 justify-between items-start p-3 rounded-lg border glass border-primary-200/30 sm:flex-row sm:items-center sm:p-4">
                        <div className="flex flex-1 gap-2 items-center w-full sm:gap-3">
                            <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-gradient-primary glow-primary sm:w-10 sm:h-10">
                                <Mail className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-1.5 items-center sm:gap-2">
                                    <p className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary truncate sm:text-base">
                                        {primaryEmail.email}
                                    </p>
                                    <span className="glass px-2 py-0.5 rounded-full text-xs font-display font-semibold border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                                        Primary
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-1">
                                    {primaryEmail.verified ? (
                                        <span className="flex gap-1 items-center text-xs font-body text-success-600 dark:text-success-400 sm:text-sm">
                                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            Verified
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex gap-1 items-center text-xs font-body text-warning-600 dark:text-warning-400 sm:text-sm">
                                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                Not Verified
                                            </span>
                                            <button
                                                onClick={() => handleResendVerification(primaryEmail.email)}
                                                disabled={resendingEmail === primaryEmail.email}
                                                className="text-xs btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
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

            {/* Secondary Emails Section - Responsive */}
            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 sm:p-5 md:p-6">
                <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-4">
                    <h3 className="flex gap-1.5 items-center text-base font-semibold font-display gradient-text-secondary sm:gap-2 sm:text-lg">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                        Secondary Emails
                    </h3>
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                        {secondaryEmails.length}/2 used
                    </span>
                </div>

                {/* Secondary Email List - Responsive */}
                <div className="mb-3 space-y-2.5 sm:mb-4 sm:space-y-3">
                    {secondaryEmails.length === 0 ? (
                        <div className="p-5 text-center rounded-lg border glass border-accent-200/30 sm:p-6">
                            <Mail className="mx-auto mb-2 w-10 h-10 opacity-50 text-accent-500 sm:mb-3 sm:w-12 sm:h-12" />
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-base">
                                No secondary emails added yet
                            </p>
                            <p className="mt-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                                Add up to 2 additional email addresses
                            </p>
                        </div>
                    ) : (
                        secondaryEmails.map((email) => (
                            <div
                                key={email.email}
                                className="flex flex-col gap-3 justify-between items-start p-3 rounded-lg border glass border-secondary-200/30 sm:flex-row sm:items-center sm:p-4"
                            >
                                <div className="flex flex-1 gap-2 items-center w-full sm:gap-3">
                                    <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-gradient-secondary/20 sm:w-10 sm:h-10">
                                        <Mail className="w-4 h-4 text-secondary-500 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary truncate sm:text-base">
                                            {email.email}
                                        </p>
                                        <div className="flex flex-wrap gap-2 items-center mt-1 sm:gap-3">
                                            {email.verified ? (
                                                <span className="flex gap-0.5 items-center text-xs font-body text-success-600 dark:text-success-400 sm:gap-1 sm:text-sm">
                                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="flex gap-0.5 items-center text-xs font-body text-warning-600 dark:text-warning-400 sm:gap-1 sm:text-sm">
                                                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        Not Verified
                                                    </span>
                                                    <button
                                                        onClick={() => handleResendVerification(email.email)}
                                                        disabled={resendingEmail === email.email}
                                                        className="text-xs btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
                                                    >
                                                        {resendingEmail === email.email ? 'Sending...' : 'Resend'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center w-full sm:w-auto">
                                    {email.verified && (
                                        <button
                                            onClick={() => setConfirmPrimaryEmail(email.email)}
                                            className="text-xs btn btn-secondary flex-1 sm:flex-initial sm:text-sm"
                                        >
                                            Set as Primary
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setConfirmRemoveEmail(email.email)}
                                        disabled={removingEmail === email.email}
                                        className="p-2 btn btn-ghost text-danger-600 dark:text-danger-400 hover:bg-danger-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Remove email"
                                    >
                                        {removingEmail === email.email ? (
                                            <div className="w-4 h-4 rounded-full border-2 animate-spin border-danger-600 border-t-transparent sm:w-5 sm:h-5" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Email Form - Responsive */}
                {canAddMore && (
                    <form onSubmit={handleAddEmail} className="p-3 rounded-lg border glass border-info-200/30 bg-gradient-info/5 sm:p-4">
                        <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
                            Add Secondary Email
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="flex-1 input"
                                disabled={addingEmail}
                            />
                            <button
                                type="submit"
                                disabled={addingEmail || !newEmail}
                                className="whitespace-nowrap btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {addingEmail ? 'Adding...' : 'Add Email'}
                            </button>
                        </div>
                        <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                            A verification email will be sent to verify ownership
                        </p>
                    </form>
                )}
            </div>

            {/* Confirm Remove Modal - Responsive */}
            {confirmRemoveEmail && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-3 backdrop-blur-sm bg-black/50 sm:p-4">
                    <div className="p-4 w-full max-w-md rounded-xl border shadow-2xl glass border-danger-200/30 sm:p-6">
                        <h3 className="mb-3 text-lg font-bold font-display gradient-text-danger sm:mb-4 sm:text-xl">
                            Remove Email Address
                        </h3>
                        <p className="mb-4 text-sm font-body text-light-text-primary dark:text-dark-text-primary sm:mb-6 sm:text-base">
                            Are you sure you want to remove <strong className="break-all">{confirmRemoveEmail}</strong> from your account?
                        </p>
                        <div className="flex flex-col gap-2 justify-end sm:flex-row sm:gap-3">
                            <button
                                onClick={() => setConfirmRemoveEmail(null)}
                                className="btn btn-secondary w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveEmail(confirmRemoveEmail)}
                                className="btn btn-danger w-full sm:w-auto"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Set Primary Modal - Responsive */}
            {confirmPrimaryEmail && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-3 backdrop-blur-sm bg-black/50 sm:p-4">
                    <div className="p-4 w-full max-w-md rounded-xl border shadow-2xl glass border-warning-200/30 sm:p-6">
                        <h3 className="mb-3 text-lg font-bold font-display gradient-text-warning sm:mb-4 sm:text-xl">
                            Change Primary Email
                        </h3>
                        <p className="mb-3 text-sm font-body text-light-text-primary dark:text-dark-text-primary sm:mb-4 sm:text-base">
                            Are you sure you want to change your primary email to <strong className="break-all">{confirmPrimaryEmail}</strong>?
                        </p>
                        <p className="mb-4 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:mb-6 sm:text-sm">
                            Your current primary email will become a secondary email.
                        </p>
                        <div className="flex flex-col gap-2 justify-end sm:flex-row sm:gap-3">
                            <button
                                onClick={() => setConfirmPrimaryEmail(null)}
                                className="btn btn-secondary w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSetPrimary(confirmPrimaryEmail)}
                                className="btn btn-primary w-full sm:w-auto"
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

