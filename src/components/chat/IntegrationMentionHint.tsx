import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Cog6ToothIcon,
    LinkIcon,
    XMarkIcon,
    LightBulbIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface IntegrationMentionHintProps {
    variant?: 'prominent' | 'compact';
    onDismiss?: () => void;
}

const STORAGE_KEY = 'integration_mention_hint_dismissed';
const STORAGE_DATE_KEY = 'integration_mention_hint_dismissed_date';
const REMINDER_DAYS = 7;

export const IntegrationMentionHint: React.FC<IntegrationMentionHintProps> = ({
    variant = 'prominent',
    onDismiss
}) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [showDontShowAgain, setShowDontShowAgain] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if hint was dismissed
        const dismissedDate = localStorage.getItem(STORAGE_DATE_KEY);
        if (dismissedDate) {
            const daysSinceDismissed = Math.floor(
                (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24)
            );
            // Show again after REMINDER_DAYS
            if (daysSinceDismissed < REMINDER_DAYS) {
                setIsDismissed(true);
            } else {
                // Clear old dismissal
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(STORAGE_DATE_KEY);
            }
        } else {
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (dismissed === 'true') {
                setIsDismissed(true);
            }
        }
    }, []);

    const handleDismiss = (permanent: boolean = false) => {
        setIsDismissed(true);
        if (permanent) {
            localStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem(STORAGE_DATE_KEY, Date.now().toString());
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    if (isDismissed) {
        return null;
    }

    if (variant === 'compact') {
        return (
            <div className="mb-2 px-4 py-2 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LightBulbIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-secondary-900 dark:text-white truncate">
                        Type <span className="font-semibold text-primary-600 dark:text-primary-400">@</span> to manage integrations directly in chat
                    </span>
                </div>
                <button
                    onClick={() => handleDismiss(false)}
                    className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors flex-shrink-0"
                    title="Dismiss"
                >
                    <XMarkIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </button>
            </div>
        );
    }

    // Prominent variant
    return (
        <div className="mb-8 glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-primary-50/80 via-primary-100/60 to-white/80 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-dark-card/50 shadow-xl backdrop-blur-xl overflow-hidden animate-fade-in">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg glow-primary">
                            <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg text-secondary-900 dark:text-white mb-1">
                                Manage Integrations in Chat
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Use @ mentions to interact with JIRA, Linear, Slack, Discord, and more
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDontShowAgain(true)}
                        className="p-1.5 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors flex-shrink-0"
                        title="Dismiss"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Example Usage */}
                <div className="mb-4 p-4 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-100/50 dark:border-primary-800/50">
                    <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-2">
                        Example Usage
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @jira:project:PROJ-123 create issue
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Create JIRA issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @linear:team:ENG:issues list all
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">List Linear issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @discord:list-channels
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Manage Discord server</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @discord create role "VIP"
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Create Discord roles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @slack:channel:general send alert
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Send Slack messages</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @google export to sheets
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Export to Google Sheets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @gmail send email to team@company.com
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Send emails via Gmail</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @calendar schedule meeting tomorrow
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Create calendar events</span>
                        </div>
                    </div>
                </div>

                {/* Available Integrations */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-2">
                        Available Integrations
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['JIRA', 'Linear', 'Slack', 'Discord', 'GitHub', 'Google Workspace', 'Webhooks'].map((integration) => (
                            <div
                                key={integration}
                                className="px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-500/20 flex items-center gap-1.5 flex-shrink-0"
                            >
                                <Cog6ToothIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                <span className="text-xs font-medium text-secondary-900 dark:text-white whitespace-nowrap">
                                    {integration}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigate('/integrations')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-lg font-display font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl glow-primary"
                    >
                        <span>Setup Integrations</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                    {showDontShowAgain && (
                        <button
                            onClick={() => handleDismiss(true)}
                            className="px-3 py-2 text-xs text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors"
                        >
                            Don't show again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

