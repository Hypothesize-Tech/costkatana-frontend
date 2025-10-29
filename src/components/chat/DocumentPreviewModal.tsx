import React, { useEffect, useState } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { documentService } from '@/services/document.service';
import { Modal } from '@/components/common/Modal';

interface DocumentPreviewModalProps {
    documentId: string;
    fileName: string;
    onClose: () => void;
}

interface DocumentPreview {
    documentId: string;
    fileName: string;
    fileType: string;
    preview: string;
    totalChunks: number;
    previewChunks: number;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    documentId,
    fileName,
    onClose
}) => {
    const [preview, setPreview] = useState<DocumentPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setLoading(true);
                const previewData = await documentService.getDocumentPreview(documentId);
                setPreview(previewData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load document preview');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [documentId]);

    const modalFooter = (
        <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Document ID: <code className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-mono">{documentId}</code>
            </p>
            <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-primary hover:opacity-90 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
                Close
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            maxWidth="6xl"
            showCloseButton={false}
            footer={modalFooter}
        >
            {/* Header with Document Info */}
            <div className="flex items-center gap-3 mb-6 -mt-2">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fileName}</h2>
                    {preview && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {preview.totalChunks} chunks{preview.fileType ? ` • ${preview.fileType.toUpperCase()}` : ''}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="ml-auto p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close preview"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 absolute top-0 left-0"></div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-20 h-20 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mb-4">
                        <XMarkIcon className="w-10 h-10 text-danger-600 dark:text-danger-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to Load Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
                </div>
            )}

            {/* Preview Content */}
            {preview && !loading && !error && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="prose prose-base dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed text-base">
                                {preview.preview}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

