import React, { useState, useEffect } from 'react';
import { googleService, GoogleConnection, GoogleDriveFile, GoogleExportAudit } from '../services/google.service';
import {
    PlusIcon,
    XMarkIcon,
    Cog6ToothIcon,
    LinkIcon,
    ChartBarIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
    FolderIcon,
    PhotoIcon,
    DocumentIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    CalendarIcon,
    EnvelopeIcon,
    ClipboardDocumentListIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';

export const GoogleIntegrations: React.FC = () => {
    const [connections, setConnections] = useState<GoogleConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<GoogleConnection | null>(null);
    const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
    const [exportAudits, setExportAudits] = useState<GoogleExportAudit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'drive' | 'exports'>('overview');

    useEffect(() => {
        loadConnections();
        loadExportAudits();
    }, []);

    useEffect(() => {
        if (selectedConnection) {
            setDriveFiles(selectedConnection.driveFiles || []);
        }
    }, [selectedConnection]);

    const loadConnections = async () => {
        try {
            setLoading(true);
            const data = await googleService.listConnections();
            setConnections(data);
            if (data.length > 0 && !selectedConnection) {
                setSelectedConnection(data[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load Google connections');
        } finally {
            setLoading(false);
        }
    };

    const loadExportAudits = async () => {
        try {
            const audits = await googleService.getExportAudits({ limit: 20 });
            setExportAudits(audits);
        } catch (err: any) {
            console.error('Failed to load export audits:', err);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            setLoading(true);
            const { authUrl } = await googleService.initiateOAuth();
            window.location.href = authUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initiate Google OAuth');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        if (!confirm('Are you sure you want to disconnect this Google account?')) {
            return;
        }

        try {
            setLoading(true);
            await googleService.disconnectConnection(connectionId);
            await loadConnections();
            if (selectedConnection?._id === connectionId) {
                setSelectedConnection(null);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to disconnect Google account');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckHealth = async (connectionId: string) => {
        try {
            setLoading(true);
            const health = await googleService.checkConnectionHealth(connectionId);
            alert(`Connection Status: ${health.status}\n${health.message}`);
            await loadConnections();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to check connection health');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCostData = async () => {
        if (!selectedConnection) return;

        try {
            setLoading(true);
            const result = await googleService.exportCostData({
                connectionId: selectedConnection._id,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                endDate: new Date()
            });

            window.open(result.spreadsheetUrl, '_blank');
            await loadExportAudits();
            alert('Cost data exported successfully to Google Sheets!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to export cost data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCostReport = async () => {
        if (!selectedConnection) return;

        try {
            setLoading(true);
            const result = await googleService.createCostReport({
                connectionId: selectedConnection._id,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                endDate: new Date(),
                includeTopModels: true,
                includeRecommendations: true
            });

            window.open(result.documentUrl, '_blank');
            await loadExportAudits();
            alert('Cost report created successfully in Google Docs!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create cost report');
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshDriveFiles = async () => {
        if (!selectedConnection) return;

        try {
            setLoading(true);
            const { files } = await googleService.listDriveFiles(selectedConnection._id, {
                pageSize: 50
            });
            setDriveFiles(files);
            await loadConnections(); // Refresh connection to update cache
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to refresh Drive files');
        } finally {
            setLoading(false);
        }
    };

    const getHealthStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'needs_reconnect':
                return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
            case 'error':
                return <XCircleIcon className="w-4 h-4 text-red-500" />;
            default:
                return <XCircleIcon className="w-4 h-4 text-gray-400" />;
        }
    };

    const getMimeTypeIcon = (mimeType: string) => {
        if (mimeType.includes('spreadsheet')) {
            return <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />;
        }
        if (mimeType.includes('document')) {
            return <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
        }
        if (mimeType.includes('presentation')) {
            return <PresentationChartLineIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />;
        }
        if (mimeType.includes('folder')) {
            return <FolderIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />;
        }
        if (mimeType.includes('image')) {
            return <PhotoIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
        }
        if (mimeType.includes('pdf')) {
            return <DocumentIcon className="w-8 h-8 text-red-600 dark:text-red-400" />;
        }
        return <DocumentIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />;
    };

    const getExportTypeIcon = (exportType: string) => {
        switch (exportType) {
            case 'sheets':
                return <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />;
            case 'docs':
                return <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
            case 'slides':
                return <PresentationChartLineIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />;
            default:
                return <FolderIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />;
        }
    };

    return (
        <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-4 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 lg:p-8 lg:mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex-1">
                            <h1 className="mb-3 text-2xl font-bold font-display gradient-text-primary sm:text-3xl lg:text-4xl lg:mb-4">
                                Google Workspace Integration
                            </h1>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 sm:text-base">
                                Connect your Google Workspace account to export cost data to Sheets and Docs
                            </p>
                        </div>
                        <button
                            onClick={handleConnectGoogle}
                            disabled={loading}
                            className="px-4 py-2.5 font-semibold text-white rounded-lg transition-all duration-300 bg-gradient-primary hover:shadow-lg glow-primary flex items-center gap-2 text-sm sm:text-base sm:px-6 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-5 h-5" />
                            {loading ? 'Connecting...' : 'Connect Google Account'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 mb-4 rounded-lg border backdrop-blur-sm glass border-red-200/30 dark:border-red-500/20 bg-red-50/80 dark:bg-red-900/20 sm:p-4 sm:mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />
                                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {connections.length === 0 ? (
                    <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                                <LinkIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold font-display text-secondary-900 dark:text-white mb-2">
                            No Google Connections
                        </h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                            Connect your Google Workspace account to export cost data to Sheets and Docs
                        </p>
                        <button
                            onClick={handleConnectGoogle}
                            className="px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300 bg-gradient-primary hover:shadow-lg glow-primary flex items-center gap-2 mx-auto"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Connect Google Account
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white mb-4">
                                    Connected Accounts
                                </h3>
                                <div className="space-y-3">
                                    {connections.map((conn) => (
                                        <div
                                            key={conn._id}
                                            onClick={() => setSelectedConnection(conn)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedConnection?._id === conn._id
                                                ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-400'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                {conn.googleAvatar ? (
                                                    <img
                                                        src={conn.googleAvatar}
                                                        alt={conn.googleName || conn.googleEmail}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {conn.googleEmail.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                                                        {conn.googleName || conn.googleEmail}
                                                    </div>
                                                    <div className="text-xs text-secondary-600 dark:text-secondary-300 truncate">
                                                        {conn.googleEmail}
                                                    </div>
                                                    {conn.googleDomain && (
                                                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                                            @{conn.googleDomain}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {getHealthStatusIcon(conn.healthStatus)}
                                                <span className="text-secondary-600 dark:text-secondary-300 capitalize">
                                                    {conn.healthStatus.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        {selectedConnection && (
                            <div className="lg:col-span-3">
                                <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6">
                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-6 border-b border-primary-200/30 dark:border-primary-500/20">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'overview'
                                                ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                                                }`}
                                        >
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('drive')}
                                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'drive'
                                                ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                                                }`}
                                        >
                                            Drive Files ({driveFiles.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('exports')}
                                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'exports'
                                                ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                                                }`}
                                        >
                                            Export History ({exportAudits.length})
                                        </button>
                                    </div>

                                    {/* Overview Tab */}
                                    {activeTab === 'overview' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                                        <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold text-secondary-900 dark:text-white mb-2">
                                                    Export to Sheets
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Export cost data to Google Sheets for analysis
                                                </p>
                                                <button
                                                    onClick={handleExportCostData}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-gradient-primary hover:shadow-lg glow-primary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Export Cost Data
                                                </button>
                                            </div>

                                            <div className="p-6 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                        <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold text-secondary-900 dark:text-white mb-2">
                                                    Create Report
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Generate cost report in Google Docs
                                                </p>
                                                <button
                                                    onClick={handleCreateCostReport}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-gradient-primary hover:shadow-lg glow-primary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Create Report
                                                </button>
                                            </div>

                                            <div className="p-6 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                                        <Cog6ToothIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold text-secondary-900 dark:text-white mb-2">
                                                    Connection Health
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Check your Google connection status
                                                </p>
                                                <button
                                                    onClick={() => handleCheckHealth(selectedConnection._id)}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-gradient-secondary hover:shadow-lg glow-secondary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Check Health
                                                </button>
                                            </div>

                                            <div className="p-6 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                                                        <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold text-secondary-900 dark:text-white mb-2">
                                                    Disconnect
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Remove this Google connection
                                                </p>
                                                <button
                                                    onClick={() => handleDisconnect(selectedConnection._id)}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Disconnect
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Drive Tab */}
                                    {activeTab === 'drive' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                                                    Drive Files
                                                </h3>
                                                <button
                                                    onClick={handleRefreshDriveFiles}
                                                    disabled={loading}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                                    Refresh
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {driveFiles.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex items-center gap-4"
                                                    >
                                                        {getMimeTypeIcon(file.mimeType)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                                                                {file.name}
                                                            </div>
                                                            <div className="text-xs text-secondary-600 dark:text-secondary-300">
                                                                {file.size && `${(file.size / 1024).toFixed(2)} KB`}
                                                                {file.modifiedTime && ` • Modified ${new Date(file.modifiedTime).toLocaleDateString()}`}
                                                            </div>
                                                        </div>
                                                        {file.webViewLink && (
                                                            <a
                                                                href={file.webViewLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-primary hover:shadow-lg glow-primary text-white transition-all duration-300"
                                                            >
                                                                View
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                                {driveFiles.length === 0 && (
                                                    <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
                                                        <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                        <p>No files found in Drive</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Exports Tab */}
                                    {activeTab === 'exports' && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                                                Export History
                                            </h3>
                                            <div className="space-y-3">
                                                {exportAudits.map((audit) => (
                                                    <div
                                                        key={audit._id}
                                                        className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex items-center gap-4"
                                                    >
                                                        {getExportTypeIcon(audit.exportType)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-secondary-900 dark:text-white mb-1">
                                                                {audit.fileName}
                                                            </div>
                                                            <div className="text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                                                                {audit.datasetType} • {audit.scope}
                                                                {audit.recordCount && ` • ${audit.recordCount} records`}
                                                            </div>
                                                            <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                                                {new Date(audit.exportedAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={audit.fileLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                                                        >
                                                            Open
                                                        </a>
                                                    </div>
                                                ))}
                                                {exportAudits.length === 0 && (
                                                    <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
                                                        <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                        <p>No exports yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
