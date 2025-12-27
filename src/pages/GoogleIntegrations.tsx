import React, { useState, useEffect } from 'react';
import { googleService, GoogleConnection, GoogleDriveFile, GoogleExportAudit } from '../services/google.service';
import {
    PlusIcon,
    XMarkIcon,
    Cog6ToothIcon,
    LinkIcon,
    ChartBarIcon,
    DocumentTextIcon,
    FolderIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import googleDriveLogo from '../assets/google-drive-logo.webp';
import googleSheetsLogo from '../assets/google-sheets-logo.webp';
import googleDocsLogo from '../assets/google-docs-logo.webp';
import { DriveViewer } from '../components/google/viewers/DriveViewer';
import { SheetViewer } from '../components/google/viewers/SheetViewer';
import { DocViewer } from '../components/google/viewers/DocViewer';


export const GoogleIntegrations: React.FC = () => {
    const [connections, setConnections] = useState<GoogleConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<GoogleConnection | null>(null);
    const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
    const [exportAudits, setExportAudits] = useState<GoogleExportAudit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'drive' | 'exports' | 'sheets' | 'docs'>('overview');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [exportDateRange, setExportDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportDateRange, setReportDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [activeExportRange, setActiveExportRange] = useState<number>(30); // Track active range in days
    const [activeReportRange, setActiveReportRange] = useState<number>(30);

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
                startDate: new Date(exportDateRange.startDate),
                endDate: new Date(exportDateRange.endDate)
            });

            window.open(result.spreadsheetUrl, '_blank');
            await loadExportAudits();
            setShowExportModal(false);
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
                startDate: new Date(reportDateRange.startDate),
                endDate: new Date(reportDateRange.endDate),
                includeTopModels: true,
                includeRecommendations: true
            });

            window.open(result.documentUrl, '_blank');
            await loadExportAudits();
            setShowReportModal(false);
            alert('Cost report created successfully in Google Docs!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create cost report');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickDateRange = (days: number, isExport: boolean) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dateRange = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
        
        if (isExport) {
            setExportDateRange(dateRange);
            setActiveExportRange(days);
        } else {
            setReportDateRange(dateRange);
            setActiveReportRange(days);
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

    const getExportTypeIcon = (exportType: string) => {
        switch (exportType) {
            case 'sheets':
                return <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />;
            case 'docs':
                return <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
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
                        {connections.length === 0 && (
                            <button
                                onClick={handleConnectGoogle}
                                disabled={loading}
                                className="px-4 py-2.5 font-semibold text-white rounded-lg transition-all duration-300 bg-gradient-primary hover:shadow-lg glow-primary flex items-center gap-2 text-sm sm:text-base sm:px-6 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5" />
                                {loading ? 'Connecting...' : 'Connect Google Account'}
                            </button>
                        )}
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
                                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 mb-6 overflow-visible">
                                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pt-2 pb-3 px-1 -mx-1">
                                            <button
                                                onClick={() => setActiveTab('overview')}
                                                className={`relative px-4 py-3 rounded-lg font-display font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === 'overview'
                                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                                    }`}
                                            >
                                                Overview
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('drive')}
                                                className={`relative px-4 py-3 pr-7 rounded-lg font-display font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === 'drive'
                                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                                    }`}
                                            >
                                                <img src={googleDriveLogo} alt="Drive" className="w-4 h-4 object-contain" />
                                                Drive
                                                {driveFiles.length > 0 && (
                                                    <span className="absolute top-1 right-0 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full bg-gradient-primary shadow-lg transform translate-x-1/3 -translate-y-1/2 z-10">
                                                        {driveFiles.length > 99 ? '99+' : driveFiles.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('exports')}
                                                className={`relative px-4 py-3 pr-7 rounded-lg font-display font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === 'exports'
                                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                                    }`}
                                            >
                                                Export History
                                                {exportAudits.length > 0 && (
                                                    <span className="absolute top-1 right-0 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full bg-gradient-primary shadow-lg transform translate-x-1/3 -translate-y-1/2 z-10">
                                                        {exportAudits.length > 99 ? '99+' : exportAudits.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('sheets')}
                                                className={`relative px-4 py-3 rounded-lg font-display font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === 'sheets'
                                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                                    }`}
                                            >
                                                <img src={googleSheetsLogo} alt="Sheets" className="w-4 h-4 object-contain" />
                                                Sheets
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('docs')}
                                                className={`relative px-4 py-3 rounded-lg font-display font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === 'docs'
                                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                                    }`}
                                            >
                                                <img src={googleDocsLogo} alt="Docs" className="w-4 h-4 object-contain" />
                                                Docs
                                            </button>
                                        </div>
                                    </div>

                                    {/* Overview Tab */}
                                    {activeTab === 'overview' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                                        <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white mb-2">
                                                    Export to Sheets
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Export cost data to Google Sheets for analysis
                                                </p>
                                                <button
                                                    onClick={() => setShowExportModal(true)}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-gradient-primary hover:shadow-lg glow-primary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Export Cost Data
                                                </button>
                                            </div>

                                            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                        <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white mb-2">
                                                    Create Report
                                                </h3>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                    Generate cost report in Google Docs
                                                </p>
                                                <button
                                                    onClick={() => setShowReportModal(true)}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 bg-gradient-primary hover:shadow-lg glow-primary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Create Report
                                                </button>
                                            </div>

                                            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                                        <Cog6ToothIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white mb-2">
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

                                            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                                                        <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-semibold font-display text-secondary-900 dark:text-white mb-2">
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
                                    {activeTab === 'drive' && selectedConnection && (
                                        <div className="h-[600px]">
                                            <DriveViewer connection={selectedConnection} />
                                        </div>
                                    )}

                                    {/* Exports Tab */}
                                    {activeTab === 'exports' && (
                                        <div>
                                            <h3 className="text-lg font-semibold font-display text-secondary-900 dark:text-white mb-4">
                                                Export History
                                            </h3>
                                            <div className="space-y-3">
                                                {exportAudits.map((audit) => (
                                                    <div
                                                        key={audit._id}
                                                        className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50/50 dark:hover:bg-primary-900/30 transition-all duration-200 flex items-center gap-4"
                                                    >
                                                        {getExportTypeIcon(audit.exportType)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold font-display text-secondary-900 dark:text-white mb-1">
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
                                                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-primary hover:shadow-lg glow-primary text-white transition-all duration-300"
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

                                    {/* Sheets Tab */}
                                    {activeTab === 'sheets' && selectedConnection && (
                                        <div className="h-[600px]">
                                            <SheetViewer connection={selectedConnection} />
                                        </div>
                                    )}

                                    {/* Docs Tab */}
                                    {activeTab === 'docs' && selectedConnection && (
                                        <div className="h-[600px]">
                                            <DocViewer connection={selectedConnection} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Export to Sheets Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="w-full max-w-lg mx-auto glass rounded-2xl shadow-2xl border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-display">
                                        Export to Google Sheets
                                    </h2>
                                    <p className="text-sm text-white/80 font-body">
                                        Select date range for cost data export
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            {/* Quick Date Range Buttons */}
                            <div>
                                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 font-display">
                                    Quick Select
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleQuickDateRange(7, true)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeExportRange === 7
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 7 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(30, true)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeExportRange === 30
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 30 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(90, true)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeExportRange === 90
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 90 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(365, true)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeExportRange === 365
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last Year
                                    </button>
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            <div>
                                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 font-display">
                                    Custom Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-2 font-medium font-body">
                                            From
                                        </label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={exportDateRange.startDate}
                                                onChange={(e) => {
                                                    setExportDateRange({ ...exportDateRange, startDate: e.target.value });
                                                    setActiveExportRange(0); // Reset active state
                                                }}
                                                max={exportDateRange.endDate}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-2 font-medium font-body">
                                            To
                                        </label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={exportDateRange.endDate}
                                                onChange={(e) => {
                                                    setExportDateRange({ ...exportDateRange, endDate: e.target.value });
                                                    setActiveExportRange(0); // Reset active state
                                                }}
                                                min={exportDateRange.startDate}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date Range Summary */}
                            <div className="p-4 rounded-lg glass bg-gradient-primary/10 border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-sm">
                                <p className="text-sm text-secondary-700 dark:text-secondary-300 font-body">
                                    <strong className="font-display">Selected Range:</strong> {new Date(exportDateRange.startDate).toLocaleDateString()} - {new Date(exportDateRange.endDate).toLocaleDateString()}
                                    <span className="ml-2 text-xs text-secondary-600 dark:text-secondary-400">
                                        ({Math.ceil((new Date(exportDateRange.endDate).getTime() - new Date(exportDateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel/50 dark:bg-gradient-dark-panel/50 backdrop-blur-xl">
                            <button
                                onClick={() => setShowExportModal(false)}
                                disabled={loading}
                                className="px-6 py-2.5 font-semibold rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white hover:bg-gradient-secondary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-display"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExportCostData}
                                disabled={loading}
                                className="px-6 py-2.5 font-semibold rounded-lg bg-gradient-primary hover:shadow-lg glow-primary text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-display"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <ChartBarIcon className="w-5 h-5" />
                                        Export to Sheets
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="w-full max-w-lg mx-auto glass rounded-2xl shadow-2xl border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-display">
                                        Create Cost Report
                                    </h2>
                                    <p className="text-sm text-white/80 font-body">
                                        Select date range for Google Docs report
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            {/* Quick Date Range Buttons */}
                            <div>
                                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 font-display">
                                    Quick Select
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleQuickDateRange(7, false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeReportRange === 7
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 7 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(30, false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeReportRange === 30
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 30 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(90, false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeReportRange === 90
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last 90 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(365, false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 font-body ${
                                            activeReportRange === 365
                                                ? 'border-primary-500 bg-gradient-primary text-white shadow-md'
                                                : 'border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-900 dark:text-white'
                                        }`}
                                    >
                                        Last Year
                                    </button>
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            <div>
                                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 font-display">
                                    Custom Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-2 font-medium font-body">
                                            From
                                        </label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={reportDateRange.startDate}
                                                onChange={(e) => {
                                                    setReportDateRange({ ...reportDateRange, startDate: e.target.value });
                                                    setActiveReportRange(0); // Reset active state
                                                }}
                                                max={reportDateRange.endDate}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-2 font-medium font-body">
                                            To
                                        </label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={reportDateRange.endDate}
                                                onChange={(e) => {
                                                    setReportDateRange({ ...reportDateRange, endDate: e.target.value });
                                                    setActiveReportRange(0); // Reset active state
                                                }}
                                                min={reportDateRange.startDate}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date Range Summary */}
                            <div className="p-4 rounded-lg glass bg-gradient-primary/10 border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-sm">
                                <p className="text-sm text-secondary-700 dark:text-secondary-300 font-body">
                                    <strong className="font-display">Selected Range:</strong> {new Date(reportDateRange.startDate).toLocaleDateString()} - {new Date(reportDateRange.endDate).toLocaleDateString()}
                                    <span className="ml-2 text-xs text-secondary-600 dark:text-secondary-400">
                                        ({Math.ceil((new Date(reportDateRange.endDate).getTime() - new Date(reportDateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel/50 dark:bg-gradient-dark-panel/50 backdrop-blur-xl">
                            <button
                                onClick={() => setShowReportModal(false)}
                                disabled={loading}
                                className="px-6 py-2.5 font-semibold rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white hover:bg-gradient-secondary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-display"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCostReport}
                                disabled={loading}
                                className="px-6 py-2.5 font-semibold rounded-lg bg-gradient-primary hover:shadow-lg glow-primary text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-display"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <DocumentTextIcon className="w-5 h-5" />
                                        Create Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
