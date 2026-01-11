import React from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

interface PlanModificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    value: string;
    onChange: (value: string) => void;
    isLoading: boolean;
}

export const PlanModificationDialog: React.FC<PlanModificationDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    value,
    onChange,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-primary-200/30 dark:border-primary-800/30 flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                        <PencilIcon className="w-6 h-6 text-primary-500" />
                        Modify Plan
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        Describe how you'd like to modify the plan. Be specific about what changes you want to make.
                    </p>
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="E.g., Add user authentication to the todo app, use PostgreSQL instead of MongoDB, deploy backend to AWS Lambda..."
                        className="w-full h-32 px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        autoFocus
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-primary-200/30 dark:border-primary-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!value.trim() || isLoading}
                        className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Modifying...
                            </>
                        ) : (
                            'Modify Plan'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanModificationDialog;
