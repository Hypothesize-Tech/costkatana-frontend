import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative bg-white dark:bg-dark-bg-200 rounded-xl shadow-2xl border border-primary-200/30 dark:border-primary-700/20 max-w-md w-full mx-4 p-6 glass backdrop-blur-xl"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${danger
              ? 'bg-danger-100 dark:bg-danger-900/20'
              : 'bg-primary-100 dark:bg-primary-900/20'
              }`}
          >
            <ExclamationTriangleIcon
              className={`w-6 h-6 ${danger
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-primary-600 dark:text-primary-400'
                }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              id="dialog-title"
              className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2"
            >
              {title}
            </h3>

            {/* Message */}
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-medium border border-primary-200/30 dark:border-primary-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${danger
              ? 'bg-danger-600 hover:bg-danger-700 text-white shadow-lg'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg'
              }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

