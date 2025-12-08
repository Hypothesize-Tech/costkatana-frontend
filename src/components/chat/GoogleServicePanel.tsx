import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { GmailViewer } from '../google/viewers/GmailViewer';
import { DriveViewer } from '../google/viewers/DriveViewer';
import { SheetViewer } from '../google/viewers/SheetViewer';
import { DocViewer } from '../google/viewers/DocViewer';
import { CalendarViewer } from '../google/viewers/CalendarViewer';
import { FormViewer } from '../google/viewers/FormViewer';
import { SlideViewer } from '../google/viewers/SlideViewer';
import { googleService, GoogleConnection } from '../../services/google.service';
import gmailLogo from '../../assets/gmail-logo.webp';
import driveLogo from '../../assets/google-drive-logo.webp';
import sheetsLogo from '../../assets/google-sheets-logo.webp';
import docsLogo from '../../assets/google-docs-logo.webp';
import calendarLogo from '../../assets/google-calender-logo.webp';
import formsLogo from '../../assets/google-forms-logo.webp';
import slidesLogo from '../../assets/google-slides-logo.webp';

interface GoogleServicePanelProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'quick' | 'gmail' | 'drive' | 'sheets' | 'docs' | 'calendar' | 'forms' | 'slides';
}

export const GoogleServicePanel: React.FC<GoogleServicePanelProps> = ({
    isOpen,
    onClose,
    defaultTab = 'quick'
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [connection, setConnection] = useState<GoogleConnection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);

    useEffect(() => {
        loadConnection();
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
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                    <g>
                        <path d="M43.6 20.5H42V20.4H24V27.6H35.8C34.7 31.1 31.7 33.5 28 33.5C23.6 33.5 20 29.9 20 25.5C20 21.1 23.6 17.5 28 17.5C29.5 17.5 30.8 17.9 31.9 18.6L36.6 14C34.2 12.1 31.2 11 28 11C19.2 11 12 18.2 12 27C12 35.8 19.2 43 28 43C36.8 43 44 35.8 44 27C44 25.2 43.8 23.4 43.6 20.5Z" fill="#4285F4" />
                        <path d="M6.3 14.1L12.4 18.7C14.5 15 18 12.5 22 12.1V5.7H22.1C15.7 6.3 10.1 10.3 6.3 14.1Z" fill="#34A853" />
                        <path d="M28 5C32 5 35.5 6.5 38 8.7L32.7 13.3C31.5 12.3 29.9 11.5 28 11.5C23.7 11.5 20.2 15 20.2 19.3C20.2 20.3 20.4 21.2 20.8 22.1L16 26.4C14.5 24.4 13.7 21.9 13.7 19.3C13.7 11.5 20.2 5 28 5Z" fill="#FBBC05" />
                        <path d="M28 43C36.8 43 44 35.8 44 27H36.5C35.9 29.6 33.3 31.7 30.2 31.7C27.3 31.7 25 29.4 25 26.5C25 23.6 27.3 21.3 30.2 21.3C33.1 21.3 35.1 23.2 35.5 25.4H44C44.1 24.8 44.2 24.2 44.2 23.5C44.2 14.7 36.8 7.5 28 7.5C19.2 7.5 12 14.7 12 23.5C12 32.3 19.2 39.5 28 39.5L28 43Z" fill="#EA4335" />
                    </g>
                </svg>
            )
        },
        { id: 'gmail', label: 'Gmail', icon: null, logo: gmailLogo },
        { id: 'drive', label: 'Drive', icon: null, logo: driveLogo },
        { id: 'sheets', label: 'Sheets', icon: null, logo: sheetsLogo },
        { id: 'docs', label: 'Docs', icon: null, logo: docsLogo },
        { id: 'calendar', label: 'Calendar', icon: null, logo: calendarLogo },
        { id: 'forms', label: 'Forms', icon: null, logo: formsLogo },
        { id: 'slides', label: 'Slides', icon: null, logo: slidesLogo }
    ];

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-primary-200/30 dark:border-primary-500/20">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                            Google Workspace
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                }`}
                        >
                            {tab.logo && typeof tab.logo === 'string' ? (
                                <img src={tab.logo} alt={tab.label} className="w-4 h-4" />
                            ) : tab.icon ? (
                                <span>{tab.icon}</span>
                            ) : null}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-secondary-600 dark:text-secondary-400">Loading Google services...</p>
                        </div>
                    </div>
                ) : !connection ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8">
                            <SparklesIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                                Connect Google Account
                            </h3>
                            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                                Connect your Google account to access Gmail, Drive, Sheets, and more.
                            </p>
                            <a
                                href="/integrations"
                                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Connect Google
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'quick' && (
                            <div className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-4 rounded-lg border-2 border-primary-200 dark:border-primary-700 hover:border-primary-600 dark:hover:border-primary-500 transition-colors text-left">
                                        <img src={gmailLogo} alt="Gmail" className="w-8 h-8 mb-2" />
                                        <div className="font-medium text-secondary-900 dark:text-white">Send Email</div>
                                        <div className="text-xs text-secondary-500">Compose new email</div>
                                    </button>
                                    <button className="p-4 rounded-lg border-2 border-primary-200 dark:border-primary-700 hover:border-primary-600 dark:hover:border-primary-500 transition-colors text-left">
                                        <img src={sheetsLogo} alt="Sheets" className="w-8 h-8 mb-2" />
                                        <div className="font-medium text-secondary-900 dark:text-white">Create Sheet</div>
                                        <div className="text-xs text-secondary-500">New spreadsheet</div>
                                    </button>
                                    <button className="p-4 rounded-lg border-2 border-primary-200 dark:border-primary-700 hover:border-primary-600 dark:hover:border-primary-500 transition-colors text-left">
                                        <img src={docsLogo} alt="Docs" className="w-8 h-8 mb-2" />
                                        <div className="font-medium text-secondary-900 dark:text-white">Create Doc</div>
                                        <div className="text-xs text-secondary-500">New document</div>
                                    </button>
                                    <button className="p-4 rounded-lg border-2 border-primary-200 dark:border-primary-700 hover:border-primary-600 dark:hover:border-primary-500 transition-colors text-left">
                                        <img src={calendarLogo} alt="Calendar" className="w-8 h-8 mb-2" />
                                        <div className="font-medium text-secondary-900 dark:text-white">Schedule Meeting</div>
                                        <div className="text-xs text-secondary-500">Add calendar event</div>
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'gmail' && <GmailViewer connection={connection} />}
                        {activeTab === 'drive' && <DriveViewer connection={connection} />}
                        {activeTab === 'sheets' && <SheetViewer connection={connection} />}
                        {activeTab === 'docs' && <DocViewer connection={connection} />}
                        {activeTab === 'calendar' && <CalendarViewer connection={connection} />}
                        {activeTab === 'forms' && <FormViewer connection={connection} />}
                        {activeTab === 'slides' && <SlideViewer connection={connection} />}
                    </>
                )}
            </div>
        </div>
    );
};

