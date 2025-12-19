import React, { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { FolderIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { googlePickerService, PickerFile } from '../../services/googlePicker.service';
import googleService from '../../services/google.service';
import { useToast } from '../../hooks/useToast';

interface GooglePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileType: 'docs' | 'sheets' | 'drive';
    connectionId: string;
    onFilesSelected: (files: PickerFile[]) => void;
    multiSelect?: boolean;
}

export const GooglePickerModal: React.FC<GooglePickerModalProps> = ({
    isOpen,
    onClose,
    fileType,
    connectionId,
    onFilesSelected,
    multiSelect = false
}) => {
    const { showToast } = useToast();
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (!connectionId) {
                setError('No Google connection found. Please connect your Google account first.');
                setIsInitializing(false);
                return;
            }
            initializeAndOpenPicker();
        } else {
            // Reset state when modal closes
            setError(null);
            setIsInitializing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, connectionId]);

    const initializeAndOpenPicker = async () => {
        setIsInitializing(true);
        setError(null);

        try {

            const { accessToken, developerKey } = await googleService.getPickerToken(connectionId);

            if (!accessToken) {
                throw new Error('Failed to obtain OAuth token. Please reconnect your Google account.');
            }

            if (!developerKey) {
                throw new Error('Google Picker API developer key is not configured. Please set GOOGLE_API_KEY in your backend environment variables.');
            }

            await googlePickerService.initialize(accessToken, developerKey);

            setIsInitializing(false);
            openPicker();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize file picker. Please try again.';
            console.error('Failed to initialize Google Picker:', err);
            setError(errorMessage);
            setIsInitializing(false);
            showToast(errorMessage, 'error');
        }
    };

    const openPicker = () => {
        try {
            googlePickerService.openPicker({
                fileType,
                multiSelect,
                connectionId,
                onSelect: (files) => {
                    showToast(
                        `Successfully selected ${files.length} file${files.length > 1 ? 's' : ''}`,
                        'success'
                    );
                    onFilesSelected(files);
                    onClose();
                },
                onCancel: () => {
                    onClose();
                }
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to open file picker';
            console.error('Failed to open picker:', err);
            setError(errorMessage);
            showToast('Failed to open file picker', 'error');
        }
    };

    const handleRetry = () => {
        setError(null);
        initializeAndOpenPicker();
    };

    if (!isOpen) return null;

    const getFileTypeInfo = () => {
        switch (fileType) {
            case 'docs':
                return {
                    icon: DocumentTextIcon,
                    title: 'Select Google Docs',
                    description: 'Choose documents from your Google Drive'
                };
            case 'sheets':
                return {
                    icon: TableCellsIcon,
                    title: 'Select Google Sheets',
                    description: 'Choose spreadsheets from your Google Drive'
                };
            default:
                return {
                    icon: FolderIcon,
                    title: 'Select Files',
                    description: 'Choose files from your Google Drive'
                };
        }
    };

    const { icon: Icon, title, description } = getFileTypeInfo();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-3 sm:px-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Modal */}
                <div className="inline-block align-bottom glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-6 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full w-full max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                            aria-label="Close modal"
                        >
                            <XCircleIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gray-400 dark:text-gray-500 hover:text-danger-500 dark:hover:text-danger-400" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            {/* Header */}
                            <div className="text-center sm:text-left mb-4 sm:mb-6 pr-8 sm:pr-0">
                                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            {isInitializing && (
                                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4">
                                        <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 font-medium">
                                        Initializing file picker...
                                    </p>
                                    <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-500 mt-2">
                                        This may take a moment
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4 sm:p-5 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-danger-600 dark:text-danger-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-danger-800 dark:text-danger-300 mb-1">
                                                Failed to Initialize
                                            </h4>
                                            <p className="text-sm text-danger-700 dark:text-danger-400 mb-3">
                                                {error}
                                            </p>
                                            <button
                                                onClick={handleRetry}
                                                className="text-sm font-medium text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 hover:underline transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isInitializing && !error && (
                                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 sm:p-5 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-1">
                                                File picker opened
                                            </p>
                                            <p className="text-xs text-primary-600 dark:text-primary-400">
                                                Select your {fileType === 'docs' ? 'documents' : fileType === 'sheets' ? 'spreadsheets' : 'files'} from the picker window and click "Select"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                            <span className="text-lg">💡</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                            Pro Tip
                                        </p>
                                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                                            Once selected, you can use commands like{' '}
                                            <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-mono">
                                                @{fileType} list
                                            </code>{' '}
                                            to see and work with your files directly!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
