import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    DocumentTextIcon,
    TableCellsIcon,
    PhotoIcon,
    CodeBracketIcon,
    ArchiveBoxIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowTopRightOnSquareIcon,
    FolderIcon,
} from '@heroicons/react/24/outline';
import { fileUploadService } from '../../services/fileUpload.service';
import { FileUploadProgress, MessageAttachment } from '../../types/attachment.types';
import { GoogleDriveLinkInput } from '../google/GoogleDriveLinkInput';
import { googleService, GoogleDriveFile, GoogleConnection } from '../../services/google.service';

interface AttachFilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAttachmentsSelected: (attachments: MessageAttachment[]) => void;
}

const AttachFilesModal: React.FC<AttachFilesModalProps> = ({
    isOpen,
    onClose,
    onAttachmentsSelected,
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'google'>('upload');
    const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
    const [selectedAttachments, setSelectedAttachments] = useState<MessageAttachment[]>([]);

    // Google Drive state
    const [googleConnection, setGoogleConnection] = useState<GoogleConnection | null>(null);
    const [googleFiles, setGoogleFiles] = useState<GoogleDriveFile[]>([]);
    const [googleFilesLoading, setGoogleFilesLoading] = useState(false);
    const [googleFilesError, setGoogleFilesError] = useState<string | null>(null);
    const [connectionChecked, setConnectionChecked] = useState(false);

    // Load Google files
    const loadGoogleFiles = useCallback(async (connectionId: string) => {
        try {
            setGoogleFilesLoading(true);
            setGoogleFilesError(null);
            const files = await googleService.getAccessibleFiles(connectionId);
            setGoogleFiles(files);
        } catch (error) {
            console.error('Failed to load Google files:', error);
            setGoogleFilesError('Failed to load Google Drive files.');
        } finally {
            setGoogleFilesLoading(false);
        }
    }, []);

    // Load Google connection
    const loadGoogleConnection = useCallback(async () => {
        try {
            const connections = await googleService.listConnections();
            const activeConnection = connections.find(conn => conn.isActive);

            if (activeConnection) {
                setGoogleConnection(activeConnection);
            } else {
                setGoogleConnection(null);
            }
            setConnectionChecked(true);
        } catch (error) {
            console.error('Failed to load Google connection:', error);
            setGoogleConnection(null);
            setConnectionChecked(true);
        }
    }, []);

    // Check for Google connection when modal opens (to show/hide tab)
    useEffect(() => {
        if (isOpen && !connectionChecked) {
            loadGoogleConnection();
        }
    }, [isOpen, connectionChecked, loadGoogleConnection]);

    // Load Google files when Google tab is opened
    useEffect(() => {
        if (activeTab === 'google' && isOpen && googleConnection && googleFiles.length === 0) {
            loadGoogleFiles(googleConnection._id);
        }
    }, [activeTab, isOpen, googleConnection, googleFiles.length, loadGoogleFiles]);

    const getFileIcon = (fileType: string) => {
        const iconClass = "w-8 h-8 text-primary-600 dark:text-primary-400";
        const iconName = fileUploadService.getFileIcon(fileType);

        const iconMap: Record<string, React.ReactElement> = {
            DocumentTextIcon: <DocumentTextIcon className={iconClass} />,
            TableCellsIcon: <TableCellsIcon className={iconClass} />,
            DocumentIcon: <DocumentIcon className={iconClass} />,
            CodeBracketIcon: <CodeBracketIcon className={iconClass} />,
            PhotoIcon: <PhotoIcon className={iconClass} />,
            ArchiveBoxIcon: <ArchiveBoxIcon className={iconClass} />,
            VideoCameraIcon: <VideoCameraIcon className={iconClass} />,
            MusicalNoteIcon: <MusicalNoteIcon className={iconClass} />,
        };

        return iconMap[iconName] || <DocumentIcon className={iconClass} />;
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newUploads: FileUploadProgress[] = acceptedFiles.map((file) => ({
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setUploads((prev) => [...prev, ...newUploads]);

        // Upload files one by one
        for (let i = 0; i < newUploads.length; i++) {
            const upload = newUploads[i];
            const uploadIndex = uploads.length + i;

            try {
                setUploads((prev) =>
                    prev.map((u, idx) =>
                        idx === uploadIndex ? { ...u, status: 'uploading' as const } : u
                    )
                );

                const result = await fileUploadService.uploadFile(upload.file, (progress) => {
                    setUploads((prev) =>
                        prev.map((u, idx) =>
                            idx === uploadIndex ? { ...u, progress } : u
                        )
                    );
                });

                setUploads((prev) =>
                    prev.map((u, idx) =>
                        idx === uploadIndex
                            ? { ...u, status: 'completed' as const, result, progress: 100 }
                            : u
                    )
                );

                // Add to selected attachments
                const attachment: MessageAttachment = {
                    type: 'uploaded',
                    fileId: result.fileId,
                    fileName: result.fileName,
                    fileSize: result.fileSize,
                    mimeType: result.mimeType,
                    fileType: result.fileType,
                    url: result.url,
                    extractedText: result.extractedText,
                };
                setSelectedAttachments((prev) => [...prev, attachment]);
            } catch (error) {
                setUploads((prev) =>
                    prev.map((u, idx) =>
                        idx === uploadIndex
                            ? {
                                ...u,
                                status: 'error' as const,
                                error: error instanceof Error ? error.message : 'Upload failed',
                            }
                            : u
                    )
                );
            }
        }
    }, [uploads.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });

    const removeUpload = (index: number) => {
        const upload = uploads[index];
        if (upload.result) {
            // Remove from selected attachments
            setSelectedAttachments((prev) =>
                prev.filter((a) => a.fileId !== upload.result?.fileId)
            );
        }
        setUploads((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleGoogleFileSelected = (file: GoogleDriveFile) => {
        const attachment: MessageAttachment = {
            type: 'google',
            fileId: file.id,
            fileName: file.name,
            fileSize: file.size || 0,
            mimeType: file.mimeType,
            fileType: getFileTypeLabel(file.mimeType).toLowerCase().replace(' ', '_'),
            url: file.webViewLink || '',
        };
        setSelectedAttachments((prev) => [...prev, attachment]);
    };

    const getFileTypeLabel = (mimeType: string): string => {
        if (mimeType.includes('document')) return 'Google Docs';
        if (mimeType.includes('spreadsheet')) return 'Google Sheets';
        if (mimeType.includes('folder')) return 'Folder';
        if (mimeType.includes('presentation')) return 'Google Slides';
        return 'File';
    };

    const getGoogleFileIcon = (mimeType: string) => {
        if (mimeType.includes('document')) {
            return <DocumentIcon className="w-8 h-8 text-blue-500" />;
        } else if (mimeType.includes('spreadsheet')) {
            return <TableCellsIcon className="w-8 h-8 text-green-500" />;
        } else if (mimeType.includes('folder')) {
            return <FolderIcon className="w-8 h-8 text-yellow-500" />;
        }
        return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown size';
        const mb = bytes / (1024 * 1024);
        if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${mb.toFixed(1)} MB`;
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isFileSelected = (fileId: string): boolean => {
        return selectedAttachments.some(a => a.fileId === fileId);
    };

    const removeGoogleFile = (fileId: string) => {
        setSelectedAttachments((prev) => prev.filter(a => a.fileId !== fileId));
    };

    const handleClose = () => {
        onClose();
        // Reset connection check state for next time modal opens
        setConnectionChecked(false);
    };

    const handleAttach = () => {
        onAttachmentsSelected(selectedAttachments);
        handleClose();
        // Reset state
        setUploads([]);
        setSelectedAttachments([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-primary-200/30 dark:border-primary-500/20 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20 flex items-center justify-between">
                    <h2 className="font-display font-semibold text-xl text-secondary-900 dark:text-white">
                        Attach Files
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-primary-200/30 dark:border-primary-500/20">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 font-display font-semibold transition-colors ${activeTab === 'upload'
                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                            : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                    >
                        Upload Files
                    </button>
                    {googleConnection && (
                        <button
                            onClick={() => setActiveTab('google')}
                            className={`px-4 py-2 font-display font-semibold transition-colors ${activeTab === 'google'
                                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                                }`}
                        >
                            Google Files
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'upload' ? (
                        <div className="space-y-4">
                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-primary-200 dark:border-primary-500/30 hover:border-primary-400 dark:hover:border-primary-500'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-primary-600 dark:text-primary-400" />
                                <p className="font-display font-semibold text-secondary-900 dark:text-white mb-2">
                                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                                </p>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    or click to browse • All file types supported • 25MB max
                                </p>
                            </div>

                            {/* Upload List */}
                            {uploads.length > 0 && (
                                <div className="space-y-2">
                                    {uploads.map((upload, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200/30 dark:border-primary-500/20 rounded-lg"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    {getFileIcon(upload.file.name.split('.').pop() || '')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-display font-semibold text-sm text-secondary-900 dark:text-white truncate">
                                                            {upload.file.name}
                                                        </p>
                                                        <button
                                                            onClick={() => removeUpload(index)}
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                                        {fileUploadService.formatFileSize(upload.file.size)}
                                                        {upload.result?.hasExtractedText && (
                                                            <span className="ml-2 text-green-600 dark:text-green-400">
                                                                • Text extracted
                                                            </span>
                                                        )}
                                                    </p>
                                                    {upload.status === 'uploading' && (
                                                        <div className="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
                                                            <div
                                                                className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all"
                                                                style={{ width: `${upload.progress}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                    {upload.status === 'completed' && (
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">Uploaded</span>
                                                        </div>
                                                    )}
                                                    {upload.status === 'error' && (
                                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <ExclamationCircleIcon className="w-4 h-4" />
                                                            <span className="text-xs">{upload.error}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Google Drive Link Input */}
                            {googleConnection && (
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200/30 dark:border-primary-500/20 rounded-lg">
                                    <h5 className="font-display font-semibold text-secondary-900 dark:text-white mb-3 text-sm">
                                        Add File by Link
                                    </h5>
                                    <GoogleDriveLinkInput
                                        connectionId={googleConnection._id}
                                        onFileAdded={async () => await loadGoogleFiles(googleConnection._id)}
                                        onError={(error) => setGoogleFilesError(error)}
                                    />
                                </div>
                            )}

                            {/* Google Files List */}
                            {googleFilesLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                                    <p className="text-secondary-600 dark:text-secondary-400 font-display">Loading files...</p>
                                </div>
                            ) : googleFilesError ? (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-display">{googleFilesError}</p>
                                    {!googleConnection && (
                                        <a
                                            href="/google-integrations"
                                            className="mt-2 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                            Connect Google Account
                                        </a>
                                    )}
                                </div>
                            ) : googleFiles.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-primary/10 flex items-center justify-center shadow-lg">
                                        <FolderIcon className="w-10 h-10 text-primary-500" />
                                    </div>
                                    <h4 className="text-lg font-display font-semibold text-secondary-900 dark:text-white mb-2">
                                        No files available
                                    </h4>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                        Add files by pasting a Google Drive link above
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h5 className="font-display font-semibold text-secondary-900 dark:text-white text-sm mb-2">
                                        Your Google Drive Files ({googleFiles.length})
                                    </h5>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {googleFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                onClick={() => {
                                                    if (isFileSelected(file.id)) {
                                                        removeGoogleFile(file.id);
                                                    } else {
                                                        handleGoogleFileSelected(file);
                                                    }
                                                }}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${isFileSelected(file.id)
                                                    ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-500'
                                                    : 'bg-white dark:bg-dark-card border-primary-200/30 dark:border-primary-500/20 hover:border-primary-400/50 dark:hover:border-primary-400/50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {file.iconLink ? (
                                                            <img src={file.iconLink} alt="" className="w-8 h-8" />
                                                        ) : (
                                                            getGoogleFileIcon(file.mimeType)
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-display font-semibold text-sm text-secondary-900 dark:text-white truncate mb-1">
                                                            {file.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                                                            <span>{getFileTypeLabel(file.mimeType)}</span>
                                                            {file.modifiedTime && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{formatDate(file.modifiedTime)}</span>
                                                                </>
                                                            )}
                                                            {file.size && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{formatFileSize(file.size)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {file.webViewLink && (
                                                            <a
                                                                href={file.webViewLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                                                title="Open in Google Drive"
                                                            >
                                                                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-primary-500" />
                                                            </a>
                                                        )}
                                                        {isFileSelected(file.id) && (
                                                            <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-primary-200/30 dark:border-primary-500/20 flex items-center justify-between">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {selectedAttachments.length} file(s) selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 font-display font-semibold text-secondary-600 dark:text-secondary-400 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAttach}
                            disabled={selectedAttachments.length === 0}
                            className="px-4 py-2 font-display font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Attach Files
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttachFilesModal;

