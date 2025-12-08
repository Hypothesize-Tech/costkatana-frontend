import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Loader, CheckCircle, AlertCircle, X, FileText, Table, Presentation, Image } from 'lucide-react';
import googleService, { GoogleConnection, GoogleDriveFile } from '../../services/google.service';

interface GoogleConnectorProps {
    onConnect?: (connectionId: string) => void;
    onSelectFile?: (file: GoogleDriveFile, connectionId: string) => void;
    onClose?: () => void;
    fileType?: 'sheets' | 'docs' | 'slides' | 'drive' | 'all';
}

const GoogleConnector: React.FC<GoogleConnectorProps> = ({
    onConnect,
    onSelectFile,
    onClose,
    fileType = 'all'
}) => {
    const [loading, setLoading] = useState(false);
    const [connections, setConnections] = useState<GoogleConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<GoogleConnection | null>(null);
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'connect' | 'select-file'>('connect');
    const [searchQuery, setSearchQuery] = useState('');

    const loadFiles = useCallback(async (connectionId: string) => {
        try {
            setLoading(true);
            let query = '';

            // Filter by file type if specified
            if (fileType === 'sheets') {
                query = "mimeType='application/vnd.google-apps.spreadsheet'";
            } else if (fileType === 'docs') {
                query = "mimeType='application/vnd.google-apps.document'";
            } else if (fileType === 'slides') {
                query = "mimeType='application/vnd.google-apps.presentation'";
            }

            const { files: driveFiles } = await googleService.listDriveFiles(connectionId, {
                pageSize: 50,
                query
            });
            setFiles(driveFiles);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    }, [fileType]);

    const loadConnections = useCallback(async () => {
        try {
            setLoading(true);
            const conns = await googleService.listConnections();
            setConnections(conns);

            if (conns.length > 0) {
                setSelectedConnection(conns[0]);
                if (onConnect) {
                    onConnect(conns[0]._id);
                }
                await loadFiles(conns[0]._id);
                setStep('select-file');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load connections');
        } finally {
            setLoading(false);
        }
    }, [onConnect, loadFiles]);

    useEffect(() => {
        loadConnections();
    }, [loadConnections]);

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);

            const { authUrl } = await googleService.initiateOAuth();
            window.location.href = authUrl;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to connect Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConnection = async (connection: GoogleConnection) => {
        try {
            setLoading(true);
            setSelectedConnection(connection);
            if (onConnect) {
                onConnect(connection._id);
            }
            await loadFiles(connection._id);
            setStep('select-file');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFile = (file: GoogleDriveFile) => {
        if (selectedConnection && onSelectFile) {
            onSelectFile(file, selectedConnection._id);
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('spreadsheet')) {
            return <Table className="w-5 h-5 text-green-600 dark:text-green-400" />;
        }
        if (mimeType.includes('document')) {
            return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
        }
        if (mimeType.includes('presentation')) {
            return <Presentation className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
        }
        if (mimeType.includes('folder')) {
            return <Folder className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
        }
        if (mimeType.includes('image')) {
            return <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
        }
        return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-secondary-200 dark:border-secondary-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                            <Folder className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                Connect Google Workspace
                            </h2>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {step === 'connect' ? 'Link your Google account' : `Choose a ${fileType === 'all' ? 'file' : fileType} to use`}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === 'connect' && (
                        <div className="space-y-6">
                            {connections.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-highlight-100 dark:from-primary-900/30 dark:to-highlight-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Folder className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        No Google Connection
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
                                        Connect your Google Workspace account to export cost data, create reports, and sync budgets
                                    </p>
                                    <button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Folder className="w-5 h-5" />
                                                Connect Google
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                        Select a Google account to continue:
                                    </p>
                                    <div className="space-y-3">
                                        {connections.map((conn) => (
                                            <button
                                                key={conn._id}
                                                onClick={() => handleSelectConnection(conn)}
                                                disabled={loading}
                                                className="w-full p-4 border-2 border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center gap-4 text-left disabled:opacity-50 focus-ring"
                                            >
                                                {conn.googleAvatar ? (
                                                    <img
                                                        src={conn.googleAvatar}
                                                        alt={conn.googleName || conn.googleEmail}
                                                        className="w-12 h-12 rounded-full ring-2 ring-secondary-200 dark:ring-secondary-700"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                                                        {conn.googleEmail.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                        {conn.googleName || conn.googleEmail}
                                                    </p>
                                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                                        {conn.googleEmail}
                                                    </p>
                                                    {conn.googleDomain && (
                                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                                            @{conn.googleDomain}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${conn.healthStatus === 'healthy'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : conn.healthStatus === 'needs_reconnect'
                                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                        }`}>
                                                        {conn.healthStatus.replace('_', ' ')}
                                                    </span>
                                                    <CheckCircle className="w-5 h-5 text-success-500" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="mt-4 w-full p-3 border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 focus-ring"
                                    >
                                        + Connect Another Account
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'select-file' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div>
                                <input
                                    type="text"
                                    placeholder={`Search ${fileType === 'all' ? 'files' : fileType}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            {/* File List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader className="w-6 h-6 animate-spin text-primary-500" />
                                    </div>
                                ) : filteredFiles.length === 0 ? (
                                    <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                        No files found
                                    </div>
                                ) : (
                                    filteredFiles.map((file) => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleSelectFile(file)}
                                            className="w-full p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left focus-ring"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {getFileIcon(file.mimeType)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                                                            {file.name}
                                                        </p>
                                                        {file.modifiedTime && (
                                                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                                                                Modified {new Date(file.modifiedTime).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        {file.size && (
                                                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {file.webViewLink && (
                                                    <a
                                                        href={file.webViewLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep('connect')}
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus-ring"
                                >
                                    ← Back to connections
                                </button>
                                <button
                                    onClick={() => selectedConnection && loadFiles(selectedConnection._id)}
                                    disabled={loading}
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus-ring disabled:opacity-50"
                                >
                                    Refresh files
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoogleConnector;

