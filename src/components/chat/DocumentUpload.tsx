import React, { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, DocumentTextIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { documentService, DocumentMetadata } from '@/services/document.service';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentUploadProps {
    onDocumentUploaded: (document: DocumentMetadata) => void;
    onDocumentRemoved: (documentId: string) => void;
    selectedDocuments: DocumentMetadata[];
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    onDocumentUploaded,
    onDocumentRemoved,
    selectedDocuments
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStage, setUploadStage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [previewDocument, setPreviewDocument] = useState<{ id: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await uploadFile(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file: File) => {
        setError(null);

        // Validate file
        const validation = documentService.validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadStage(`Uploading ${file.name}...`);

        try {
            const result = await documentService.uploadDocument(file, {
                onProgress: (progress: number, stage: string) => {
                    setUploadProgress(progress);
                    setUploadStage(stage);
                }
            });

            // Create document metadata
            // Note: Backend processes asynchronously, so chunksCount may not be available immediately
            const docMetadata: DocumentMetadata = {
                documentId: result.documentId,
                fileName: result.fileName,
                fileType: file.name.split('.').pop() || 'unknown',
                uploadDate: new Date().toISOString(),
                chunksCount: result.documentsCreated || 0, // May be 0 if still processing
                s3Key: result.s3Key
            };

            onDocumentUploaded(docMetadata);

            // Reset progress after a brief moment
            await new Promise(resolve => setTimeout(resolve, 500));
            setUploadProgress(0);
            setUploadStage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploadProgress(0);
            setUploadStage('');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    return (
        <div className="space-y-3">
            {/* Upload Button and Helper Text */}
            <div className="flex items-center justify-between">
                {/* Helper Text */}
                {selectedDocuments.length === 0 && !uploading && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#06ec9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Upload documents (PDF, MD, TXT, Code files) to ask questions about them. Max 10MB.
                    </p>
                )}
                
                {/* Upload Button */}
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,.ts,.js,.py,.java,.cpp,.go,.rs,.rb"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="document-upload"
                    />
                    <label
                        htmlFor="document-upload"
                        className={`btn btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${uploading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:shadow-lg hover:scale-[1.02]'
                            }`}
                    >
                        <PaperClipIcon className="w-5 h-5" />
                        <span>{uploading ? 'Uploading...' : 'Attach Document'}</span>
                    </label>
                </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && uploadProgress > 0 && (
                <div className="space-y-2 p-4 glass rounded-xl border border-primary-200/30 shadow-sm backdrop-blur-xl animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{uploadStage}</span>
                        <span className="font-bold gradient-text">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                            className="progress-bar h-full transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm backdrop-blur-sm animate-fade-in">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Selected Documents */}
            {selectedDocuments.length > 0 && (
                <div
                    className="flex justify-end p-3 glass rounded-xl border border-primary-200/30 shadow-sm backdrop-blur-xl animate-fade-in"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="flex flex-wrap gap-2 justify-end">
                        {selectedDocuments.map((doc) => (
                            <div
                                key={doc.documentId}
                                className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-300 dark:border-gray-600 text-sm shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 backdrop-blur-sm"
                            >
                                <DocumentTextIcon className="w-5 h-5 text-[#06ec9e] dark:text-[#06ec9e] flex-shrink-0" />
                                <span className="text-gray-900 dark:text-gray-100 font-medium max-w-[180px] truncate">
                                    {doc.fileName}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full font-medium">
                                    {doc.chunksCount} chunks
                                </span>
                                <CheckCircleIcon className="w-4 h-4 text-[#22c55e] dark:text-[#22c55e] flex-shrink-0" />
                                <button
                                    onClick={() => setPreviewDocument({ id: doc.documentId, name: doc.fileName })}
                                    className="ml-1 p-1 hover:bg-[#06ec9e]/10 dark:hover:bg-[#06ec9e]/20 rounded-md transition-all duration-200"
                                    title="Preview document"
                                >
                                    <EyeIcon className="w-4 h-4 text-[#009454] dark:text-[#06ec9e] hover:text-[#06ec9e]" />
                                </button>
                                <button
                                    onClick={() => onDocumentRemoved(doc.documentId)}
                                    className="ml-0.5 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-all duration-200"
                                    title="Remove document"
                                >
                                    <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDocument && (
                <DocumentPreviewModal
                    documentId={previewDocument.id}
                    fileName={previewDocument.name}
                    onClose={() => setPreviewDocument(null)}
                />
            )}
        </div>
    );
};
