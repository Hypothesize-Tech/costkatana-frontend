import React, { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { googleService } from '../../../services/google.service';
import { useToast } from '../../../hooks/useToast';
import googleDocsLogo from '../../../assets/google-docs-logo.webp';

interface CreateDocModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectionId: string;
    onDocCreated?: () => void;
}

export const CreateDocModal: React.FC<CreateDocModalProps> = ({
    isOpen,
    onClose,
    connectionId,
    onDocCreated
}) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast('Please enter a title', 'error');
            return;
        }

        try {
            setLoading(true);
            const result = await googleService.createDocument(connectionId, title.trim());

            showToast('Document created successfully', 'success');
            onDocCreated?.();
            onClose();
            setTitle('');

            // Open the new document in a new tab
            if (result.documentUrl) {
                window.open(result.documentUrl, '_blank');
            }
        } catch (error: unknown) {
            console.error('Failed to create document:', error);
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                : undefined;
            showToast(errorMessage || 'Failed to create document', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-3 sm:px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="inline-block align-bottom glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-6 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full w-full max-h-[90vh] overflow-y-auto">
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                        >
                            <XCircleIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gray-400 dark:text-gray-500 hover:text-danger-500 dark:hover:text-danger-400" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            <div className="text-center sm:text-left mb-4 sm:mb-6 pr-8 sm:pr-0">
                                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                                        <img src={googleDocsLogo} alt="Google Docs" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                            Create Document
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    Create a new Google Document
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                                        Document Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="input w-full"
                                        placeholder="My Document"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-primary-200/30">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="btn btn-ghost text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creating...
                                            </span>
                                        ) : (
                                            'Create Document'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

