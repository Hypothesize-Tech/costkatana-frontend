import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    FolderIcon,
    DocumentIcon,
    DocumentTextIcon,
    TableCellsIcon,
    PhotoIcon,
    CodeBracketIcon,
    ArchiveBoxIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    ArrowTopRightOnSquareIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { fileUploadService } from '../../services/fileUpload.service';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface CombinedFile {
    id: string;
    name: string;
    size: number;
    type: 'uploaded' | 'google' | 'document';
    mimeType?: string;
    fileType?: string;
    url?: string;
    uploadedAt: Date;
    source: 'Uploaded' | 'Google Drive' | 'Document';
    chunksCount?: number; // For document files
    documentId?: string; // For document files
}

interface FileLibraryPanelProps {
    isExpanded: boolean;
    onToggleExpanded: () => void;
    currentConversationId?: string;
    filterMode: 'all' | 'current';
    onFilterModeChange: (mode: 'all' | 'current') => void;
}

export const FileLibraryPanel: React.FC<FileLibraryPanelProps> = ({
    isExpanded,
    onToggleExpanded,
    currentConversationId,
    filterMode,
    onFilterModeChange,
}) => {
    const [files, setFiles] = useState<CombinedFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [selectedDocumentName, setSelectedDocumentName] = useState<string>('');

    // Get file icon based on file type or mime type
    const getFileIcon = useCallback((file: CombinedFile) => {
        if (file.type === 'google') {
            return (
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            );
        }

        if (file.type === 'document') {
            return <DocumentTextIcon className="w-5 h-5 text-amber-500" />;
        }

        // For uploaded files, determine icon by file extension or mime type
        const fileName = file.name.toLowerCase();
        const mimeType = file.mimeType?.toLowerCase() || '';

        if (fileName.endsWith('.pdf') || mimeType.includes('pdf')) {
            return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
        }
        if (fileName.match(/\.(xlsx?|csv)$/) || mimeType.includes('spreadsheet')) {
            return <TableCellsIcon className="w-5 h-5 text-green-500" />;
        }
        if (fileName.match(/\.(docx?|txt|md)$/) || mimeType.includes('document')) {
            return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
        }
        if (fileName.match(/\.(jpe?g|png|gif|webp|svg)$/) || mimeType.includes('image')) {
            return <PhotoIcon className="w-5 h-5 text-purple-500" />;
        }
        if (fileName.match(/\.(js|ts|tsx|jsx|py|java|cpp?|c)$/) || mimeType.includes('text')) {
            return <CodeBracketIcon className="w-5 h-5 text-yellow-500" />;
        }
        if (fileName.match(/\.(zip|rar|tar|gz)$/)) {
            return <ArchiveBoxIcon className="w-5 h-5 text-orange-500" />;
        }
        if (fileName.match(/\.(mp4|mov|avi)$/) || mimeType.includes('video')) {
            return <VideoCameraIcon className="w-5 h-5 text-pink-500" />;
        }
        if (fileName.match(/\.(mp3|wav)$/) || mimeType.includes('audio')) {
            return <MusicalNoteIcon className="w-5 h-5 text-indigo-500" />;
        }

        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }, []);

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }, []);

    // Format date
    const formatDate = useCallback((date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }, []);

    // Load files based on filter mode using the unified API
    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let allFilesFromAPI: CombinedFile[] = [];

            if (filterMode === 'all') {
                // Get ALL files from all sources (uploaded, Google Drive, documents)
                const apiResponse = await fileUploadService.getAllUserFiles();
                allFilesFromAPI = apiResponse.map((file: any) => ({
                    id: file.id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    mimeType: file.mimeType,
                    fileType: file.fileType,
                    url: file.url,
                    uploadedAt: new Date(file.uploadedAt),
                    source: file.source,
                    chunksCount: file.chunksCount,
                    documentId: file.documentId,
                }));
            } else {
                // Get files for current conversation only
                if (currentConversationId) {
                    const apiResponse = await fileUploadService.getAllUserFiles(currentConversationId);
                    allFilesFromAPI = apiResponse.map((file: any) => ({
                        id: file.id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        mimeType: file.mimeType,
                        fileType: file.fileType,
                        url: file.url,
                        uploadedAt: new Date(file.uploadedAt),
                        source: file.source,
                        chunksCount: file.chunksCount,
                        documentId: file.documentId,
                    }));
                }
            }

            // Deduplicate by file ID (in case of any duplicates) and sort by upload date (newest first)
            const uniqueFiles = allFilesFromAPI.reduce((acc, file) => {
                const existing = acc.find(f => f.id === file.id);
                if (!existing) {
                    acc.push(file);
                }
                return acc;
            }, [] as CombinedFile[]);

            uniqueFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

            setFiles(uniqueFiles);
        } catch (err) {
            console.error('Error loading files:', err);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    }, [filterMode, currentConversationId]);

    // Load files when filter mode, conversation, or messages change
    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Clear files when starting a new conversation (when currentConversationId becomes null)
    useEffect(() => {
        if (!currentConversationId) {
            setFiles([]);
        }
    }, [currentConversationId]);

    const handleFileClick = (file: CombinedFile) => {
        if (file.type === 'document') {
            // Show document preview modal for RAG documents
            setSelectedDocumentId(file.documentId!);
            setSelectedDocumentName(file.name);
            return;
        }

        if (file.url) {
            window.open(file.url, '_blank', 'noopener,noreferrer');
        }
    };

    const closeDocumentPreview = () => {
        setSelectedDocumentId(null);
        setSelectedDocumentName('');
    };

    const fileCount = files.length;

    return (
        <>
            <div className="border-t border-primary-200/30 dark:border-primary-500/20">
                {/* Header */}
                <button
                    onClick={onToggleExpanded}
                    className="flex items-center justify-between w-full p-3 text-left hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <FolderIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            File Library
                        </span>
                        {fileCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-full">
                                {fileCount}
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    )}
                </button>

                {/* Panel Content */}
                {isExpanded && (
                    <div className="border-t border-primary-200/30 dark:border-primary-500/20">
                        {/* Filter Toggle */}
                        <div className="p-3">
                            <div className="flex items-center p-1 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 rounded-lg border border-primary-200/30">
                                <button
                                    onClick={() => onFilterModeChange('all')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-display font-semibold rounded-md transition-all duration-300 ${filterMode === 'all'
                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                        }`}
                                >
                                    All Files
                                </button>
                                <button
                                    onClick={() => onFilterModeChange('current')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-display font-semibold rounded-md transition-all duration-300 ${filterMode === 'current'
                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                        }`}
                                >
                                    Current
                                </button>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="max-h-80 overflow-y-auto px-3 pb-3">
                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                                                <div className="w-8 h-8 bg-primary-200/50 dark:bg-primary-700/50 rounded-lg"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="w-24 h-3 bg-primary-200/50 dark:bg-primary-700/50 rounded mb-1"></div>
                                                    <div className="w-16 h-2 bg-primary-200/30 dark:bg-primary-700/30 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="text-center py-6">
                                    <div className="text-red-500 text-sm font-display">{error}</div>
                                    <button
                                        onClick={loadFiles}
                                        className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : fileCount === 0 ? (
                                <div className="text-center py-8">
                                    <FolderIcon className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-3" />
                                    <p className="text-sm font-display text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                        No files found
                                    </p>
                                    <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                        {filterMode === 'current' ? 'No files in this conversation' : 'Upload files to see them here'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {files.map((file) => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleFileClick(file)}
                                            className="w-full flex items-center gap-2.5 p-2.5 text-left rounded-lg glass backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 border border-primary-200/30 hover:from-primary-50/50 hover:to-primary-100/30 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 hover:border-primary-400/50 transition-all duration-300 group"
                                        >
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                {getFileIcon(file)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Filename */}
                                                <p className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-0.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {file.name}
                                                </p>

                                                {/* Metadata Row */}
                                                <div className="flex items-center gap-1.5 text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    {file.type === 'document' ? (
                                                        <>
                                                            <span className="font-medium">{file.chunksCount} chunks</span>
                                                            <span>•</span>
                                                            <span className="px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                                                                Document
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium">{formatFileSize(file.size)}</span>
                                                            <span>•</span>
                                                            <span className={`px-1.5 py-0.5 rounded font-semibold ${file.type === 'google'
                                                                ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-100/80 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                                                                }`}>
                                                                {file.type === 'google' ? 'Google Drive' : 'Uploaded'}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span className="flex items-center gap-0.5">
                                                        <ClockIcon className="w-2.5 h-2.5" />
                                                        {formatDate(file.uploadedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* External Link Icon */}
                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Document Preview Modal */}
            {selectedDocumentId && (
                <DocumentPreviewModal
                    documentId={selectedDocumentId}
                    fileName={selectedDocumentName}
                    onClose={closeDocumentPreview}
                />
            )}
        </>
    );
};