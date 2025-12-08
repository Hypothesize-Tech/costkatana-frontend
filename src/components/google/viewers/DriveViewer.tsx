import React, { useState, useEffect } from 'react';
import {
    FolderIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ArrowUpTrayIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection, GoogleDriveFile } from '../../../services/google.service';

interface DriveViewerProps {
    connection: GoogleConnection;
}

export const DriveViewer: React.FC<DriveViewerProps> = ({ connection }) => {
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    useEffect(() => {
        loadFiles();
    }, [connection]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            const response = await googleService.listDriveFiles(connection._id, { pageSize: 50 });
            setFiles(response.files);
        } catch (error) {
            console.error('Failed to load Drive files:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('folder')) return <FolderIcon className="w-8 h-8 text-yellow-500" />;
        return <DocumentTextIcon className="w-8 h-8 text-blue-500" />;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <FolderIcon className="w-5 h-5" />
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
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                            <ArrowUpTrayIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search files..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex gap-1 bg-primary-100 dark:bg-primary-900/20 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-2 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white dark:bg-gray-700' : ''}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-2 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700' : ''}`}
                        >
                            Grid
                        </button>
                    </div>
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <FolderIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No files found</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {getFileIcon(file.mimeType)}
                                    <div className="mt-2 w-full">
                                        <div className="font-medium text-secondary-900 dark:text-white truncate text-sm">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-secondary-500 mt-1">
                                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                            className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded">
                                        <ShareIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600">
                                        <TrashIcon className="w-4 h-4" />
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

