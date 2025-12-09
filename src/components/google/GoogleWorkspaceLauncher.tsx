import React, { useState, useEffect } from 'react';
import {
    FolderIcon,
    DocumentTextIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection } from '../../services/google.service';
import gmailLogo from '../../assets/gmail-logo.webp';
import googleCalendarLogo from '../../assets/google-calender-logo.webp';
import googleDriveLogo from '../../assets/google-drive-logo.webp';
import googleSheetsLogo from '../../assets/google-sheets-logo.webp';
import googleDocsLogo from '../../assets/google-docs-logo.webp';
import googleSlidesLogo from '../../assets/google-slides-logo.webp';
import googleFormsLogo from '../../assets/google-forms-logo.webp';

interface GoogleWorkspaceLauncherProps {
    isOpen: boolean;
    onClose: () => void;
}

interface QuickAction {
    id: string;
    icon: string; // Image source path
    label: string;
    description: string;
    command: string;
    bgColor: string;
}

export const GoogleWorkspaceLauncher: React.FC<GoogleWorkspaceLauncherProps> = ({ isOpen, onClose }) => {
    const [connections, setConnections] = useState<GoogleConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<GoogleConnection | null>(null);
    const [recentFiles, setRecentFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadConnections();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedConnection) {
            loadRecentFiles();
        }
    }, [selectedConnection]);

    const loadConnections = async () => {
        try {
            setLoading(true);
            const data = await googleService.listConnections();
            const activeConnections = data.filter(c => c.isActive);
            setConnections(activeConnections);
            if (activeConnections.length > 0) {
                setSelectedConnection(activeConnections[0]);
            }
        } catch (err: any) {
            console.error('Failed to load Google connections:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentFiles = async () => {
        if (!selectedConnection) return;

        try {
            setLoading(true);
            const { files } = await googleService.listDriveFiles(selectedConnection._id, { pageSize: 10 });
            setRecentFiles(files.slice(0, 5));
        } catch (err: any) {
            console.error('Failed to load recent files:', err);
            // Gracefully handle error - recent files are optional
            setRecentFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions: QuickAction[] = [
        {
            id: 'send-email',
            icon: gmailLogo,
            label: 'Send Email',
            description: 'Send cost update via Gmail',
            command: 'send email to team about monthly costs',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            id: 'schedule-meeting',
            icon: googleCalendarLogo,
            label: 'Schedule Meeting',
            description: 'Create calendar event',
            command: 'schedule budget review meeting next week',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'export-sheet',
            icon: googleSheetsLogo,
            label: 'Export to Sheets',
            description: 'Create cost spreadsheet',
            command: 'export cost data to google sheets',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            id: 'create-doc',
            icon: googleDocsLogo,
            label: 'Cost Report',
            description: 'Generate Google Doc report',
            command: 'create cost report in google docs',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'qbr-slides',
            icon: googleSlidesLogo,
            label: 'QBR Slides',
            description: 'Create presentation',
            command: 'create QBR slides for this quarter',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            id: 'feedback-form',
            icon: googleFormsLogo,
            label: 'Create Form',
            description: 'Collect team feedback',
            command: 'create feedback form for AI usage',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ];

    const handleQuickAction = (action: QuickAction) => {
        // Trigger the chat with the pre-filled command
        const chatInput = document.querySelector('textarea[placeholder*="chat"]') as HTMLTextAreaElement;
        if (chatInput) {
            chatInput.value = action.command;
            chatInput.focus();
            // Dispatch input event to trigger any listeners
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary-200/30 dark:border-primary-500/20 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <FolderIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Google Workspace
                            </h2>
                            <p className="text-sm text-white/80">
                                Quick access to all Google services
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Loading State */}
                    {loading && connections.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-500/30 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                Loading Google Workspace...
                            </p>
                        </div>
                    ) : connections.length === 0 ? (
                        /* No Connection State */
                        <div className="p-8 text-center">
                            <FolderIcon className="w-16 h-16 mx-auto mb-4 text-secondary-400 dark:text-secondary-500" />
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                                No Google Account Connected
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                Connect your Google account to access Workspace services
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        const { authUrl } = await googleService.initiateOAuth();
                                        window.location.href = authUrl;
                                    } catch (err: any) {
                                        console.error('Failed to initiate OAuth:', err);
                                        alert('Failed to connect Google account. Please try again.');
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Connecting...' : 'Connect Google Account'}
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Connected Account */}
                            {selectedConnection && (
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200/30 dark:border-primary-500/20">
                                    {selectedConnection.googleAvatar && (
                                        <img
                                            src={selectedConnection.googleAvatar}
                                            alt={selectedConnection.googleName || 'User'}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold text-secondary-900 dark:text-white">
                                            {selectedConnection.googleName}
                                        </div>
                                        <div className="text-sm text-secondary-600 dark:text-secondary-300">
                                            {selectedConnection.googleEmail}
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                        Connected
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div>
                                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-3">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {quickActions.map((action) => {
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleQuickAction(action)}
                                                className={`p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 ${action.bgColor} hover:shadow-md transition-all text-left group`}
                                            >
                                                <img
                                                    src={action.icon}
                                                    alt={action.label}
                                                    className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform"
                                                />
                                                <div className="font-semibold text-sm text-secondary-900 dark:text-white mb-1">
                                                    {action.label}
                                                </div>
                                                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                                                    {action.description}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Files */}
                            <div>
                                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-3">
                                    Recent Files
                                </h3>
                                {loading && recentFiles.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="inline-block w-8 h-8 border-3 border-primary-200 dark:border-primary-500/30 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                                        <span className="ml-3 text-sm text-secondary-600 dark:text-secondary-300">
                                            Loading files...
                                        </span>
                                    </div>
                                ) : recentFiles.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentFiles.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.webViewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                            >
                                                <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                                                        {file.name}
                                                    </div>
                                                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                                                        {file.modifiedTime && new Date(file.modifiedTime).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-secondary-500 dark:text-secondary-400">
                                        <FolderIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p>No recent files found</p>
                                    </div>
                                )}
                            </div>

                            {/* Help Text */}
                            <div className="p-4 rounded-lg bg-gradient-primary/10 border border-primary-200/30 dark:border-primary-500/20">
                                <div className="text-sm text-secondary-700 dark:text-secondary-300">
                                    <strong>Tip:</strong> Use natural language in the chat to interact with Google Workspace.
                                    Try "Send email to...", "Create a sheet with...", or "Schedule a meeting for..."
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

