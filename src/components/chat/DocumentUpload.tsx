import React, { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import { documentService, DocumentMetadata } from '@/services/document.service';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentUploadProps {
    onDocumentUploaded: (document: DocumentMetadata) => void;
    onDocumentRemoved: (documentId: string) => void;
    selectedDocuments: DocumentMetadata[];
    onGitHubConnect?: () => void;
    githubConnection?: {
        avatarUrl?: string;
        username?: string;
        hasConnection: boolean;
    };
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    onDocumentUploaded,
    onDocumentRemoved,
    selectedDocuments,
    onGitHubConnect,
    githubConnection
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
        <div className="space-y-2">
            {/* Selected Documents - Compact Chips - Right Aligned */}
            {selectedDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                    {selectedDocuments.map((doc) => (
                        <div
                            key={doc.documentId}
                            className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg border border-secondary-200/50 dark:border-secondary-700/50 text-xs hover:shadow-sm transition-all"
                        >
                            <DocumentTextIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                            <span className="text-secondary-700 dark:text-secondary-300 font-medium max-w-[120px] truncate">
                                {doc.fileName}
                            </span>
                            <span className="text-secondary-500 dark:text-secondary-400">
                                {doc.chunksCount}
                            </span>
                            <button
                                onClick={() => setPreviewDocument({ id: doc.documentId, name: doc.fileName })}
                                className="p-0.5 hover:bg-secondary-200/50 dark:hover:bg-secondary-700/50 rounded transition-colors"
                                title="Preview"
                            >
                                <EyeIcon className="w-3 h-3 text-secondary-500 dark:text-secondary-400" />
                            </button>
                            <button
                                onClick={() => onDocumentRemoved(doc.documentId)}
                                className="p-0.5 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded transition-colors"
                                title="Remove"
                            >
                                <XMarkIcon className="w-3 h-3 text-secondary-500 dark:text-secondary-400 hover:text-danger-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress Bar - Right Aligned */}
            {uploading && uploadProgress > 0 && (
                <div className="px-2 py-1.5 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-sm animate-fade-in max-w-md ml-auto">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-secondary-700 dark:text-secondary-300 truncate">{uploadStage}</span>
                        <span className="font-semibold text-primary-600 dark:text-primary-400 ml-2">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-gradient-primary transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message - Right Aligned */}
            {error && (
                <div className="flex items-start gap-2 text-xs text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950/30 px-3 py-2 rounded-lg border border-danger-200 dark:border-danger-800/50 animate-fade-in max-w-md ml-auto">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Input Controls - Right Aligned */}
            <div className="flex items-center justify-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,.ts,.js,.py,.java,.cpp,.go,.rs,.rb"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                    id="document-upload"
                />

                {/* GitHub Connection Status */}
                {onGitHubConnect && (
                    <button
                        onClick={onGitHubConnect}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800/50 rounded-lg transition-all duration-200 border border-secondary-200/50 dark:border-secondary-700/50 hover:border-primary-300 dark:hover:border-primary-600"
                        title={githubConnection?.hasConnection ? "View GitHub repositories" : "Connect GitHub"}
                    >
                        {githubConnection?.hasConnection && githubConnection?.avatarUrl ? (
                            <>
                                <img
                                    src={githubConnection.avatarUrl}
                                    alt={githubConnection.username || 'GitHub'}
                                    className="w-4 h-4 rounded-full"
                                />
                                <span className="hidden sm:inline">{githubConnection.username || 'GitHub'}</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span className="hidden sm:inline">GitHub</span>
                            </>
                        )}
                    </button>
                )}

                {/* Attachment Button */}
                <div className="relative group">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-secondary-900 dark:bg-secondary-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        Drop files here or click to attach • Max 10MB
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-900 dark:border-t-secondary-800"></div>
                    </div>
                </div>
            </div>

            {/* Drag & Drop Area - Hidden visually but still functional */}
            {selectedDocuments.length === 0 && !uploading && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                />
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
