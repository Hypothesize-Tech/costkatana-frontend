import React, { useState, useEffect, useCallback } from 'react';
import { KeyIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { backupCodesService, BackupCodesMetadata } from '../../services/backupCodes.service';
import { PasswordVerificationModal } from './PasswordVerificationModal';
import { useNotifications } from '../../contexts/NotificationContext';

interface DownloadOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadPlain: () => void;
    onDownloadProtected: (password: string) => void;
}

const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
    isOpen,
    onClose,
    onDownloadPlain,
    onDownloadProtected
}) => {
    const [selectedOption, setSelectedOption] = useState<'plain' | 'protected' | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = () => {
        if (selectedOption === 'plain') {
            onDownloadPlain();
            handleClose();
        } else if (selectedOption === 'protected') {
            if (!password.trim()) {
                setError('Password is required for protected download');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                return;
            }
            onDownloadProtected(password);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedOption(null);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-md w-full p-6 animate-slide-up">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
                            <ArrowDownTrayIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold gradient-text-secondary">
                                Download Options
                            </h2>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                Choose how to download your backup codes
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4 mb-6">
                        {/* Plain Text Option */}
                        <button
                            onClick={() => {
                                setSelectedOption('plain');
                                setPassword('');
                                setConfirmPassword('');
                                setError('');
                            }}
                            className={`w-full glass rounded-lg p-4 border transition-all duration-300 text-left ${selectedOption === 'plain'
                                ? 'border-primary-400/50 bg-primary-50/50 dark:bg-primary-900/20'
                                : 'border-secondary-200/30 hover:border-primary-300/50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <DocumentTextIcon className={`h-6 w-6 flex-shrink-0 ${selectedOption === 'plain'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-secondary-500'
                                    }`} />
                                <div className="flex-1">
                                    <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">
                                        Plain Text File
                                    </h3>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                        Download codes as a simple text file. Easy to read but not encrypted.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Password Protected Option */}
                        <button
                            onClick={() => {
                                setSelectedOption('protected');
                                setError('');
                            }}
                            className={`w-full glass rounded-lg p-4 border transition-all duration-300 text-left ${selectedOption === 'protected'
                                ? 'border-success-400/50 bg-success-50/50 dark:bg-success-900/20'
                                : 'border-secondary-200/30 hover:border-success-300/50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <LockClosedIcon className={`h-6 w-6 flex-shrink-0 ${selectedOption === 'protected'
                                    ? 'text-success-600 dark:text-success-400'
                                    : 'text-secondary-500'
                                    }`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                                            Password-Protected File
                                        </h3>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">
                                            Recommended
                                        </span>
                                    </div>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                        Download codes encrypted with a password. Maximum security.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Password Fields (shown when protected is selected) */}
                        {selectedOption === 'protected' && (
                            <div className="space-y-3 pt-2 animate-slide-down">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                        Encryption Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        className="input w-full"
                                        placeholder="Enter encryption password"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError('');
                                        }}
                                        className="input w-full"
                                        placeholder="Confirm encryption password"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                                        Show passwords
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 glass rounded-lg p-3 border border-danger-200/30 bg-danger-50/50 dark:bg-danger-900/20">
                            <p className="text-sm text-danger-700 dark:text-danger-300">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDownload}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedOption}
                        >
                            Download
                        </button>
                    </div>

                    {/* Security Note */}
                    <div className="mt-4 pt-4 border-t border-primary-200/30">
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            🔒 Password-protected files use AES-256 encryption for maximum security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BackupCodesSection: React.FC = () => {
    const [metadata, setMetadata] = useState<BackupCodesMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'generate' | 'view' | 'download'>('generate');
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [generating, setGenerating] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const { showNotification } = useNotifications();

    const loadMetadata = useCallback(async () => {
        try {
            setLoading(true);
            const data = await backupCodesService.getBackupCodesMetadata();
            setMetadata(data);
        } catch (error) {
            console.error('Failed to load backup codes metadata:', error);
            showNotification('Failed to load backup codes information', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    // Load metadata on mount
    useEffect(() => {
        loadMetadata();
    }, [loadMetadata]);

    const handleGenerateClick = () => {
        setModalAction('generate');
        setShowModal(true);
    };

    const handlePasswordVerify = async (password: string) => {
        try {
            if (modalAction === 'generate') {
                setGenerating(true);
                const result = await backupCodesService.generateBackupCodes(password);
                setBackupCodes(result.codes);
                await loadMetadata();
                showNotification('Backup codes generated successfully!', 'success');
            } else if (modalAction === 'download') {
                // Download mode - verify password then show download options
                const isValid = await backupCodesService.verifyPassword(password);
                if (isValid) {
                    setShowModal(false);
                    setShowDownloadOptions(true);
                } else {
                    throw new Error('Invalid password');
                }
            } else {
                // View mode - inform user that codes are hashed
                showNotification(
                    'Backup codes are securely hashed. Please regenerate to view new codes.',
                    'info'
                );
                setShowModal(false);
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to verify password';
            throw new Error(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadClick = () => {
        setModalAction('download');
        setShowModal(true);
    };

    const handleDownloadWithPassword = (password: string) => {
        if (backupCodes) {
            backupCodesService.downloadBackupCodesProtected(backupCodes, password);
            showNotification('Password-protected backup codes downloaded successfully', 'success');
            setShowDownloadOptions(false);
        }
    };

    const handleDownloadPlain = () => {
        if (backupCodes) {
            backupCodesService.downloadBackupCodes(backupCodes);
            showNotification('Backup codes downloaded successfully', 'success');
            setShowDownloadOptions(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        showNotification('Code copied to clipboard', 'success');
    };

    const handleCloseCodesView = () => {
        setBackupCodes(null);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="animate-pulse">
                    <div className="h-6 bg-gradient-primary/20 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gradient-primary/20 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
                        <KeyIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-secondary">
                        Backup Codes
                    </h2>
                </div>

                {/* Description */}
                <div className="glass rounded-lg p-4 border border-info-200/30 bg-info-50/50 dark:bg-info-900/20 mb-6">
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        Backup codes can be used to access your account if you lose access to your authenticator app.
                        Each code can only be used once. Store them in a safe place.
                    </p>
                </div>

                {/* Codes Display or Status */}
                {backupCodes ? (
                    <div className="space-y-4">
                        {/* Warning Banner */}
                        <div className="glass rounded-lg p-4 border border-warning-200/30 bg-warning-50/50 dark:bg-warning-900/20">
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-warning-800 dark:text-warning-200 mb-1">
                                        Important: These codes will not be shown again!
                                    </p>
                                    <p className="text-xs text-warning-700 dark:text-warning-300">
                                        Download or save these codes securely before closing this window.
                                        Your old backup codes have been invalidated.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Codes Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {backupCodes.map((code, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCopyCode(code)}
                                    className="glass rounded-lg p-4 border border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 transition-all duration-300 group"
                                >
                                    <div className="text-center">
                                        <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">
                                            Code {index + 1}
                                        </div>
                                        <div className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                                            {code}
                                        </div>
                                        <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Click to copy
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownloadClick}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Download Securely
                            </button>
                            <button
                                onClick={handleCloseCodesView}
                                className="btn-secondary flex-1"
                            >
                                I've Saved My Codes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Status Info */}
                        {metadata?.hasBackupCodes ? (
                            <div className="glass rounded-lg p-4 border border-success-200/30 bg-success-50/50 dark:bg-success-900/20">
                                <div className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-success-800 dark:text-success-200 mb-1">
                                            Backup codes configured
                                        </p>
                                        <div className="text-xs text-success-700 dark:text-success-300 space-y-1">
                                            <p>You have {metadata.codesCount} backup codes available</p>
                                            <p>Last generated: {formatDate(metadata.lastGenerated)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass rounded-lg p-4 border border-warning-200/30 bg-warning-50/50 dark:bg-warning-900/20">
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-warning-800 dark:text-warning-200 mb-1">
                                            No backup codes configured
                                        </p>
                                        <p className="text-xs text-warning-700 dark:text-warning-300">
                                            Generate backup codes to ensure you can access your account if you lose your authenticator device.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerateClick}
                                className="btn-primary flex-1"
                                disabled={generating}
                            >
                                {generating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Generating...
                                    </span>
                                ) : metadata?.hasBackupCodes ? (
                                    'Regenerate Backup Codes'
                                ) : (
                                    'Generate Backup Codes'
                                )}
                            </button>
                        </div>

                        {/* Security Note */}
                        <div className="glass rounded-lg p-3 border border-secondary-200/20">
                            <p className="text-xs text-secondary-600 dark:text-secondary-400">
                                🔒 Generating new codes will invalidate all previous codes. Make sure to save the new codes securely.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Verification Modal */}
            <PasswordVerificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onVerify={handlePasswordVerify}
                title={
                    modalAction === 'generate'
                        ? 'Generate Backup Codes'
                        : modalAction === 'download'
                            ? 'Download Backup Codes'
                            : 'View Backup Codes'
                }
                description="Please enter your password to continue"
            />

            {/* Download Options Modal */}
            {showDownloadOptions && (
                <DownloadOptionsModal
                    isOpen={showDownloadOptions}
                    onClose={() => setShowDownloadOptions(false)}
                    onDownloadPlain={handleDownloadPlain}
                    onDownloadProtected={handleDownloadWithPassword}
                />
            )}
        </>
    );
};


