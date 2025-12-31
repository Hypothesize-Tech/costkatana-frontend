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
        className="relative glass rounded-2xl border border-primary-200/30 dark:border-primary-700/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-md w-full mx-4 p-6 animate-scale-in"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${danger
              ? 'bg-gradient-to-br from-danger-500 to-danger-600'
              : 'bg-gradient-to-br from-primary-500 to-primary-600'
              }`}
          >
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              id="dialog-title"
              className="text-lg font-display font-bold text-secondary-900 dark:text-white mb-2"
            >
              {title}
            </h3>

            {/* Message */}
            <div className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
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
            className="flex-1 px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${danger
              ? 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 focus:ring-danger-500'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500'
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

