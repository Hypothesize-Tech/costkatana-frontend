import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    SparklesIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import { GmailViewer } from '../google/viewers/GmailViewer';
import { DriveViewer } from '../google/viewers/DriveViewer';
import { SheetViewer } from '../google/viewers/SheetViewer';
import { DocViewer } from '../google/viewers/DocViewer';
import { CalendarViewer } from '../google/viewers/CalendarViewer';
import { googleService, GoogleConnection } from '../../services/google.service';
import { GooglePanelShimmer } from '../ui/GoogleServiceShimmer';
import { CreateDocModal } from '../google/modals/CreateDocModal';
import { CreateSheetModal } from '../google/modals/CreateSheetModal';
import { CreateCalendarEventModal } from '../google/modals/CreateCalendarEventModal';
import gmailLogo from '../../assets/gmail-logo.webp';
import driveLogo from '../../assets/google-drive-logo.webp';
import sheetsLogo from '../../assets/google-sheets-logo.webp';
import docsLogo from '../../assets/google-docs-logo.webp';
import calendarLogo from '../../assets/google-calender-logo.webp';

interface GoogleServicePanelProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'quick' | 'gmail' | 'drive' | 'sheets' | 'docs' | 'calendar';
}

export const GoogleServicePanel: React.FC<GoogleServicePanelProps> = ({
    isOpen,
    onClose,
    defaultTab = 'quick'
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [connection, setConnection] = useState<GoogleConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileTabs, setShowMobileTabs] = useState(false);
    const [showCreateDocModal, setShowCreateDocModal] = useState(false);
    const [showCreateSheetModal, setShowCreateSheetModal] = useState(false);
    const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false);

    useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);

    useEffect(() => {
        loadConnection();

        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadConnection = async () => {
        try {
            setLoading(true);
            const connections = await googleService.listConnections();
            if (connections.length > 0) {
                setConnection(connections[0]);
            }
        } catch (error) {
            console.error('Failed to load Google connection:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        {
            id: 'quick',
            label: 'Quick Actions',
            icon: '⚡',
            logo: (
                <svg className="w-5 h-5 integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            )
        },
        { id: 'gmail', label: 'Gmail', icon: null, logo: gmailLogo },
        { id: 'drive', label: 'Drive', icon: null, logo: driveLogo },
        { id: 'sheets', label: 'Sheets', icon: null, logo: sheetsLogo },
        { id: 'docs', label: 'Docs', icon: null, logo: docsLogo },
        { id: 'calendar', label: 'Calendar', icon: null, logo: calendarLogo }
    ];

    // Helper to display mobile tab selector
    const handleMobileTabsToggle = () => setShowMobileTabs((prev) => !prev);

    const handleQuickAction = (action: 'gmail' | 'sheet' | 'doc' | 'calendar') => {
        if (!connection) return;

        switch (action) {
            case 'gmail':
                setActiveTab('gmail');
                break;
            case 'sheet':
                setShowCreateSheetModal(true);
                break;
            case 'doc':
                setShowCreateDocModal(true);
                break;
            case 'calendar':
                setShowCreateCalendarModal(true);
                break;
        }
    };

    const handleRefresh = () => {
        if (connection) {
            loadConnection();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] glass backdrop-blur-xl border-l border-primary-200/30 dark:border-primary-500/20 shadow-2xl z-50 flex flex-col bg-gradient-light-panel dark:bg-gradient-dark-panel animate-slide-in-right">
                {/* Header */}
                <div className="p-3 sm:p-4 lg:p-5 border-b border-primary-200/30 dark:border-primary-500/20 glass backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel shrink-0">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold gradient-text-primary">
                                Google Workspace
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Show tab menu toggle if mobile */}
                            {isMobile && (
                                <button
                                    onClick={handleMobileTabsToggle}
                                    className="btn w-9 h-9 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl flex items-center justify-center text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 hover:scale-110"
                                    title="Show tab menu"
                                >
                                    <Bars3Icon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="btn w-9 h-9 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl flex items-center justify-center text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    {(isMobile ? showMobileTabs : true) && (
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id as 'quick' | 'gmail' | 'drive' | 'sheets' | 'docs' | 'calendar');
                                            if (isMobile) setShowMobileTabs(false);
                                        }}
                                        className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-display font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                            }`}
                                    >
                                        {tab.logo && typeof tab.logo === 'string' ? (
                                            <img src={tab.logo} alt={tab.label} className="w-4 h-4 object-contain" />
                                        ) : tab.logo && typeof tab.logo !== 'string' ? (
                                            tab.logo
                                        ) : tab.icon ? (
                                            <span className="text-base">{tab.icon}</span>
                                        ) : null}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Show GooglePanelShimmer as a skeleton loader overlay while loading */}
                    {loading && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-gradient-light-panel/80 dark:bg-gradient-dark-panel/80 backdrop-blur-sm pointer-events-none">
                            <GooglePanelShimmer />
                        </div>
                    )}

                    {/* Only render main content if not loading */}
                    {!loading && (
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            {!connection ? (
                                <div className="flex items-center justify-center h-full p-4 sm:p-6 lg:p-8">
                                    <div className="text-center max-w-md">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                                            <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-secondary-900 dark:text-white mb-2 sm:mb-3">
                                            Connect Google Account
                                        </h3>
                                        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 mb-4 sm:mb-6 font-body">
                                            Connect your Google account to access Gmail, Drive, Sheets, and more.
                                        </p>
                                        <a
                                            href="/integrations"
                                            className="inline-block px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-primary hover:shadow-lg glow-primary text-white font-display font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base"
                                        >
                                            Connect Google
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'quick' && (
                                        <div className="p-4 sm:p-6 lg:p-8">
                                            <h3 className="text-lg sm:text-xl font-display font-semibold text-secondary-900 dark:text-white mb-4 sm:mb-6">
                                                Quick Actions
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                                                <button
                                                    onClick={() => handleQuickAction('gmail')}
                                                    className="p-4 sm:p-5 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl group cursor-pointer"
                                                >
                                                    <img src={gmailLogo} alt="Gmail" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 object-contain group-hover:scale-110 transition-transform" />
                                                    <div className="font-display font-semibold text-sm sm:text-base text-secondary-900 dark:text-white mb-1">Send Email</div>
                                                    <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-body">Compose new email</div>
                                                </button>
                                                <button
                                                    onClick={() => handleQuickAction('sheet')}
                                                    className="p-4 sm:p-5 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl group cursor-pointer"
                                                >
                                                    <img src={sheetsLogo} alt="Sheets" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 object-contain group-hover:scale-110 transition-transform" />
                                                    <div className="font-display font-semibold text-sm sm:text-base text-secondary-900 dark:text-white mb-1">Create Sheet</div>
                                                    <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-body">New spreadsheet</div>
                                                </button>
                                                <button
                                                    onClick={() => handleQuickAction('doc')}
                                                    className="p-4 sm:p-5 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl group cursor-pointer"
                                                >
                                                    <img src={docsLogo} alt="Docs" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 object-contain group-hover:scale-110 transition-transform" />
                                                    <div className="font-display font-semibold text-sm sm:text-base text-secondary-900 dark:text-white mb-1">Create Doc</div>
                                                    <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-body">New document</div>
                                                </button>
                                                <button
                                                    onClick={() => handleQuickAction('calendar')}
                                                    className="p-4 sm:p-5 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl group cursor-pointer"
                                                >
                                                    <img src={calendarLogo} alt="Calendar" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 object-contain group-hover:scale-110 transition-transform" />
                                                    <div className="font-display font-semibold text-sm sm:text-base text-secondary-900 dark:text-white mb-1">Schedule Meeting</div>
                                                    <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-body">Add calendar event</div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'gmail' && <GmailViewer connection={connection} />}
                                    {activeTab === 'drive' && <DriveViewer connection={connection} />}
                                    {activeTab === 'sheets' && <SheetViewer connection={connection} />}
                                    {activeTab === 'docs' && <DocViewer connection={connection} />}
                                    {activeTab === 'calendar' && <CalendarViewer connection={connection} />}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {connection && (
                <>
                    <CreateDocModal
                        isOpen={showCreateDocModal}
                        onClose={() => setShowCreateDocModal(false)}
                        connectionId={connection._id}
                        onDocCreated={handleRefresh}
                    />
                    <CreateSheetModal
                        isOpen={showCreateSheetModal}
                        onClose={() => setShowCreateSheetModal(false)}
                        connectionId={connection._id}
                        onSheetCreated={handleRefresh}
                    />
                    <CreateCalendarEventModal
                        isOpen={showCreateCalendarModal}
                        onClose={() => setShowCreateCalendarModal(false)}
                        connectionId={connection._id}
                        onEventCreated={handleRefresh}
                    />
                </>
            )}
        </>
    );
};
