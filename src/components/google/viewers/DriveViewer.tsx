import React, { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection, GoogleDriveFile } from '../../../services/google.service';
import { GoogleViewerStates } from '../GoogleViewerStates';
import { DriveFileShimmer } from '../../ui/GoogleServiceShimmer';
import GoogleFileAttachmentService from '../../../services/googleFileAttachment.service';
import googleDriveLogo from '../../../assets/google-drive-logo.webp';
import googleDocsLogo from '../../../assets/google-docs-logo.webp';
import googleSheetsLogo from '../../../assets/google-sheets-logo.webp';
import googleSlidesLogo from '../../../assets/google-slides-logo.webp';
import googleFormsLogo from '../../../assets/google-forms-logo.webp';

interface DriveViewerProps {
    connection: GoogleConnection;
}

export const DriveViewer: React.FC<DriveViewerProps> = ({ connection }) => {
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection._id]);

    const loadFiles = async () => {
        if (!connection) return;

        try {
            setLoading(true);
            setError(null);
            const response = await googleService.listDriveFiles(connection._id, { pageSize: 50 });
            setFiles(response.files);
        } catch (error: unknown) {
            console.error('Failed to load Drive files:', error);
            setError(error instanceof Error ? error.message : 'Failed to load Drive files');
        } finally {
            setLoading(false);
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('folder') || mimeType === 'application/vnd.google-apps.folder') {
            return <img src={googleDriveLogo} alt="Google Drive" className="w-8 h-8 object-contain" />;
        }
        if (mimeType.includes('spreadsheet') || mimeType === 'application/vnd.google-apps.spreadsheet') {
            return <img src={googleSheetsLogo} alt="Google Sheets" className="w-8 h-8 object-contain" />;
        }
        if (mimeType.includes('presentation') || mimeType === 'application/vnd.google-apps.presentation') {
            return <img src={googleSlidesLogo} alt="Google Slides" className="w-8 h-8 object-contain" />;
        }
        if (mimeType.includes('form') || mimeType === 'application/vnd.google-apps.form') {
            return <img src={googleFormsLogo} alt="Google Forms" className="w-8 h-8 object-contain" />;
        }
        if (mimeType.includes('document') || mimeType === 'application/vnd.google-apps.document') {
            return <img src={googleDocsLogo} alt="Google Docs" className="w-8 h-8 object-contain" />;
        }
        // Default to Drive logo for other file types
        return <img src={googleDriveLogo} alt="Google Drive" className="w-8 h-8 object-contain" />;
    };

    const handleChatWithAI = (file: GoogleDriveFile) => {
        try {
            GoogleFileAttachmentService.navigateToChatWithFile(file, connection);
        } catch (error) {
            console.error('Failed to open chat with file:', error);
            // Fallback navigation to chat
            window.location.href = '/chat';
        }
    };

    // Show states
    if (!connection) {
        return (
            <GoogleViewerStates
                state="disconnected"
                serviceName="Google Drive"
                onConnect={() => window.location.href = '/settings/integrations'}
                suggestedCommand="@drive list files"
            />
        );
    }

    if (error) {
        return (
            <GoogleViewerStates
                state="error"
                serviceName="Google Drive"
                error={error}
                onRetry={loadFiles}
            />
        );
    }

    if (!loading && files.length === 0) {
        return (
            <GoogleViewerStates
                state="empty"
                serviceName="Google Drive Files"
                suggestedCommand="@drive upload file.txt"
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <img src={googleDriveLogo} alt="Google Drive" className="w-5 h-5 object-contain" />
                        My Drive ({files.length} files)
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadFiles}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800"
                    />
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <DriveFileShimmer count={6} />
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <img src={googleDriveLogo} alt="Google Drive" className="w-12 h-12 mb-2 opacity-50 object-contain" />
                        <p>No files found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(file.mimeType)}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-secondary-900 dark:text-white truncate">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-secondary-500">
                                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {file.webViewLink && (
                                        <a
                                            href={file.webViewLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                                            title="View in Google Drive"
                                        >
                                            <EyeIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleChatWithAI(file)}
                                        className="p-2 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
                                        title="Chat with AI about this file"
                                    >
                                        <div className="bg-gradient-primary p-0.5 rounded glow-primary group-hover:scale-110 transition-transform duration-300">
                                            <ChatBubbleLeftRightIcon className="w-3 h-3 text-white" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

