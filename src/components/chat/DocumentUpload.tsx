import React, { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { documentService, DocumentMetadata } from '@/services/document.service';

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
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
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
        setUploadProgress(`Uploading ${file.name}...`);

        try {
            const result = await documentService.uploadDocument(file);

            setUploadProgress('Vectorizing document...');

            // Wait a moment for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create document metadata
            const docMetadata: DocumentMetadata = {
                documentId: result.documentId,
                fileName: result.fileName,
                fileType: file.name.split('.').pop() || 'unknown',
                uploadDate: new Date().toISOString(),
                chunksCount: result.documentsCreated,
                s3Key: result.s3Key
            };

            onDocumentUploaded(docMetadata);
            setUploadProgress(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploadProgress(null);
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
            {/* Upload Button */}
            <div className="flex items-center gap-2">
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <PaperClipIcon className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Attach Document'}</span>
                </label>

                {uploadProgress && (
                    <span className="text-xs text-gray-500">{uploadProgress}</span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* Selected Documents */}
            {selectedDocuments.length > 0 && (
                <div
                    className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {selectedDocuments.map((doc) => (
                        <div
                            key={doc.documentId}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-sm"
                        >
                            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700 max-w-[200px] truncate">
                                {doc.fileName}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({doc.chunksCount} chunks)
                            </span>
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <button
                                onClick={() => onDocumentRemoved(doc.documentId)}
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded transition-colors"
                                title="Remove document"
                            >
                                <XMarkIcon className="w-4 h-4 text-gray-500 hover:text-red-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Helper Text */}
            {selectedDocuments.length === 0 && !uploading && (
                <p className="text-xs text-gray-500">
                    Upload documents (PDF, MD, TXT, Code files) to ask questions about them. Max 10MB.
                </p>
            )}
        </div>
    );
};

