import React, { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/config/api';

interface MCPConfirmationRequest {
    confirmationId: string;
    resource: string;
    action: string;
    impact: string;
    expiresIn: number;
    integration: string;
    toolName: string;
}

interface MCPConfirmationDialogProps {
    isOpen: boolean;
    request?: MCPConfirmationRequest;
    onConfirm: () => void;
    onDeny: () => void;
}

export const MCPConfirmationDialog: React.FC<MCPConfirmationDialogProps> = ({
    isOpen,
    request,
    onConfirm,
    onDeny,
}) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!request || !isOpen) return;

        setTimeRemaining(request.expiresIn);

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDeny(); // Auto-deny on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [request, isOpen, onDeny]);

    if (!isOpen || !request) return null;

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await apiClient.post('/mcp/confirmation', {
                confirmationId: request.confirmationId,
                confirmed: true,
            });
            onConfirm();
        } catch (error) {
            console.error('Failed to submit confirmation:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeny = async () => {
        setIsProcessing(true);
        try {
            await apiClient.post('/mcp/confirmation', {
                confirmationId: request.confirmationId,
                confirmed: false,
            });
            onDeny();
        } catch (error) {
            console.error('Failed to submit denial:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                className="relative rounded-2xl border border-accent-500/30 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-light-bg/95 to-light-panel/95 dark:from-dark-bg-200/95 dark:to-dark-panel/95 max-w-lg w-full mx-4 p-6 animate-fade-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mcp-confirmation-title"
            >
                {/* Close button */}
                <button
                    onClick={handleDeny}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 p-1.5 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200 disabled:opacity-50"
                    aria-label="Deny"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-accent-500 to-accent-600 animate-pulse">
                        <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            id="mcp-confirmation-title"
                            className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-1"
                        >
                            Dangerous Operation Confirmation
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {request.integration} • {request.toolName}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-4">
                    {/* Resource */}
                    <div className="p-4 rounded-lg bg-light-card dark:bg-dark-card border border-secondary-200 dark:border-secondary-700">
                        <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            Resource
                        </div>
                        <div className="font-mono text-sm text-light-text-primary dark:text-dark-text-primary break-all">
                            {request.resource}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="p-4 rounded-lg bg-accent-50/50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700">
                        <div className="text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
                            Action
                        </div>
                        <div className="font-semibold text-accent-900 dark:text-accent-100">
                            {request.action}
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="p-4 rounded-lg bg-primary-50/50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700">
                        <div className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                            Impact
                        </div>
                        <div className="text-sm text-primary-900 dark:text-primary-100 leading-relaxed">
                            {request.impact}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-light-panel dark:bg-dark-panel">
                        <ClockIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                        <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            Time remaining: <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{formatTime(timeRemaining)}</span>
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleDeny}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 rounded-lg font-medium text-light-text-secondary dark:text-dark-text-secondary bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            'Deny'
                        )}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-gradient-primary hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            'Confirm Operation'
                        )}
                    </button>
                </div>

                {/* Warning */}
                <div className="mt-4 text-xs text-center text-light-text-muted dark:text-dark-text-muted">
                    This action will be denied automatically if not confirmed within the time limit
                </div>
            </div>
        </div>
    );
};
