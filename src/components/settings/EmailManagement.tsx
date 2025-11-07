// src/components/settings/EmailManagement.tsx
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
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
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold font-display gradient-text">
                    <Mail className="w-6 h-6" />
                    Primary Email
                </h3>

                {primaryEmail && (
                    <div className="flex justify-between items-center p-4 rounded-lg border glass border-primary-200/30">
                        <div className="flex flex-1 gap-3 items-center">
                            <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-primary glow-primary">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex gap-2 items-center">
                                    <p className="font-medium font-body text-light-text-primary dark:text-dark-text-primary">
                                        {primaryEmail.email}
                                    </p>
                                    <span className="glass px-2 py-0.5 rounded-full text-xs font-display font-semibold border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300">
                                        Primary
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center mt-1">
                                    {primaryEmail.verified ? (
                                        <span className="flex gap-1 items-center text-sm font-body text-success-600 dark:text-success-400">
                                            <CheckCircle className="w-4 h-4" />
                                            Verified
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex gap-1 items-center text-sm font-body text-warning-600 dark:text-warning-400">
                                                <AlertCircle className="w-4 h-4" />
                                                Not Verified
                                            </span>
                                            <button
                                                onClick={() => handleResendVerification(primaryEmail.email)}
                                                disabled={resendingEmail === primaryEmail.email}
                                                className="text-sm btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="flex gap-2 items-center text-lg font-semibold font-display gradient-text-secondary">
                        <Mail className="w-6 h-6" />
                        Secondary Emails
                    </h3>
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        {secondaryEmails.length}/2 used
                    </span>
                </div>

                {/* Secondary Email List */}
                <div className="mb-4 space-y-3">
                    {secondaryEmails.length === 0 ? (
                        <div className="p-6 text-center rounded-lg border glass border-accent-200/30">
                            <Mail className="mx-auto mb-3 w-12 h-12 opacity-50 text-accent-500" />
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                No secondary emails added yet
                            </p>
                            <p className="mt-1 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Add up to 2 additional email addresses
                            </p>
                        </div>
                    ) : (
                        secondaryEmails.map((email) => (
                            <div
                                key={email.email}
                                className="flex justify-between items-center p-4 rounded-lg border glass border-secondary-200/30"
                            >
                                <div className="flex flex-1 gap-3 items-center">
                                    <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-secondary/20">
                                        <Mail className="w-5 h-5 text-secondary-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium font-body text-light-text-primary dark:text-dark-text-primary">
                                            {email.email}
                                        </p>
                                        <div className="flex gap-3 items-center mt-1">
                                            {email.verified ? (
                                                <span className="flex gap-1 items-center text-sm font-body text-success-600 dark:text-success-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="flex gap-1 items-center text-sm font-body text-warning-600 dark:text-warning-400">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Not Verified
                                                    </span>
                                                    <button
                                                        onClick={() => handleResendVerification(email.email)}
                                                        disabled={resendingEmail === email.email}
                                                        className="text-sm btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {resendingEmail === email.email ? 'Sending...' : 'Resend'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    {email.verified && (
                                        <button
                                            onClick={() => setConfirmPrimaryEmail(email.email)}
                                            className="text-sm btn btn-secondary"
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
                                            <div className="w-5 h-5 rounded-full border-2 animate-spin border-danger-600 border-t-transparent" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Email Form */}
                {canAddMore && (
                    <form onSubmit={handleAddEmail} className="p-4 rounded-lg border glass border-info-200/30 bg-gradient-info/5">
                        <label className="block mb-2 font-medium font-display gradient-text">
                            Add Secondary Email
                        </label>
                        <div className="flex gap-2">
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
                                className="whitespace-nowrap btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingEmail ? 'Adding...' : 'Add Email'}
                            </button>
                        </div>
                        <p className="mt-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            A verification email will be sent to verify ownership
                        </p>
                    </form>
                )}
            </div>

            {/* Confirm Remove Modal */}
            {confirmRemoveEmail && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
                    <div className="p-6 w-full max-w-md rounded-xl border shadow-2xl glass border-danger-200/30">
                        <h3 className="mb-4 text-xl font-bold font-display gradient-text-danger">
                            Remove Email Address
                        </h3>
                        <p className="mb-6 font-body text-light-text-primary dark:text-dark-text-primary">
                            Are you sure you want to remove <strong>{confirmRemoveEmail}</strong> from your account?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmRemoveEmail(null)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveEmail(confirmRemoveEmail)}
                                className="btn btn-danger"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Set Primary Modal */}
            {confirmPrimaryEmail && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
                    <div className="p-6 w-full max-w-md rounded-xl border shadow-2xl glass border-warning-200/30">
                        <h3 className="mb-4 text-xl font-bold font-display gradient-text-warning">
                            Change Primary Email
                        </h3>
                        <p className="mb-4 font-body text-light-text-primary dark:text-dark-text-primary">
                            Are you sure you want to change your primary email to <strong>{confirmPrimaryEmail}</strong>?
                        </p>
                        <p className="mb-6 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Your current primary email will become a secondary email.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmPrimaryEmail(null)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSetPrimary(confirmPrimaryEmail)}
                                className="btn btn-primary"
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

