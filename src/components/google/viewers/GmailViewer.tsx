import React, { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection } from '../../../services/google.service';
import { GoogleViewerStates } from '../GoogleViewerStates';
import { GmailShimmer, GmailDetailShimmer } from '../../ui/GoogleServiceShimmer';
import gmailLogo from '../../../assets/gmail-logo.webp';

interface GmailViewerProps {
    connection: GoogleConnection | null;
    onNavigateToChat?: (command: string) => void;
}

interface Email {
    id: string;
    threadId?: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
    body?: string;
}

export const GmailViewer: React.FC<GmailViewerProps> = ({ connection, onNavigateToChat }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [fullEmailContent, setFullEmailContent] = useState<string | null>(null);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (connection) {
            loadInbox();
        }
    }, [connection]);

    const loadInbox = async () => {
        if (!connection) return;

        try {
            setLoading(true);
            setError(null);
            const messages = await googleService.searchEmails(connection._id, 'in:inbox', 50);
            setEmails(messages);
        } catch (error: any) {
            console.error('Failed to load inbox:', error);
            setError(error.message || 'Failed to load emails');
        } finally {
            setLoading(false);
        }
    };

    const loadFullEmail = async (email: Email) => {
        if (!connection) return;

        try {
            setLoadingEmail(true);
            const fullMessage = await googleService.getGmailMessage(connection._id, email.id);
            setFullEmailContent(fullMessage.body || email.snippet);
            setSelectedEmail({ ...email, body: fullMessage.body });
        } catch (error: any) {
            console.error('Failed to load full email:', error);
            // Fallback to snippet if full content fails
            setFullEmailContent(email.snippet);
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleEmailSelect = (email: Email) => {
        setSelectedEmail(email);
        setFullEmailContent(null); // Clear previous content
        loadFullEmail(email);
    };

    const openInGmail = (email: Email) => {
        // Gmail thread URL format: https://mail.google.com/mail/u/0/#inbox/{threadId}
        // If we have threadId, use it; otherwise use messageId
        const gmailUrl = email.threadId
            ? `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`
            : `https://mail.google.com/mail/u/0/#inbox/${email.id}`;
        window.open(gmailUrl, '_blank');
    };

    const handleCompose = () => {
        if (onNavigateToChat) {
            // Navigate to chat with compose command
            onNavigateToChat('@gmail send to ');
        } else {
            // Fallback: open Gmail compose
            window.open('https://mail.google.com/mail/u/0/#compose', '_blank');
        }
    };

    const filteredEmails = emails.filter(email =>
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show states
    if (!connection) {
        return (
            <GoogleViewerStates
                state="disconnected"
                serviceName="Gmail"
                onConnect={() => window.location.href = '/settings/integrations'}
                suggestedCommand="@gmail list"
            />
        );
    }

    if (error) {
        return (
            <GoogleViewerStates
                state="error"
                serviceName="Gmail"
                error={error}
                onRetry={loadInbox}
            />
        );
    }

    if (!loading && emails.length === 0) {
        return (
            <GoogleViewerStates
                state="empty"
                serviceName="Emails"
                suggestedCommand="@gmail search billing"
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <img src={gmailLogo} alt="Gmail" className="w-5 h-5 object-contain" />
                        Inbox ({emails.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadInbox}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleCompose}
                            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                            title="Compose new email"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
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
                        placeholder="Search emails..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800 text-secondary-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <GmailShimmer count={8} />
                ) : filteredEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <img src={gmailLogo} alt="Gmail" className="w-12 h-12 mb-2 opacity-50 object-contain" />
                        <p>No emails found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-primary-200/30 dark:divide-primary-500/20">
                        {filteredEmails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => handleEmailSelect(email)}
                                className={`p-4 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors ${selectedEmail?.id === email.id ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-secondary-900 dark:text-white">{email.from}</span>
                                    <span className="text-xs text-secondary-500">{new Date(email.date).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-1">
                                    {email.subject}
                                </div>
                                <div className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
                                    {email.snippet}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Email Detail */}
            {selectedEmail && (
                <>
                    {loadingEmail ? (
                        <GmailDetailShimmer />
                    ) : (
                        <div className="border-t border-primary-200/30 dark:border-primary-500/20 p-4 bg-primary-50 dark:bg-primary-900/10 max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">{selectedEmail.subject}</h4>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                        From: {selectedEmail.from} • {new Date(selectedEmail.date).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => openInGmail(selectedEmail)}
                                        className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        title="Open in Gmail"
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </button>
                                    <button
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="mt-4 pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {fullEmailContent ? (
                                        <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap font-sans bg-transparent p-0 m-0 overflow-x-auto">
                                            {fullEmailContent}
                                        </pre>
                                    ) : (
                                        <p className="text-sm text-secondary-700 dark:text-secondary-300">{selectedEmail.snippet}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

