import React, { useState, useEffect } from 'react';
import {
    EnvelopeIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    TrashIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection } from '../../../services/google.service';

interface GmailViewerProps {
    connection: GoogleConnection;
}

interface Email {
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
}

export const GmailViewer: React.FC<GmailViewerProps> = ({ connection }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInbox();
    }, [connection]);

    const loadInbox = async () => {
        try {
            setLoading(true);
            const messages = await googleService.searchEmails(connection._id, 'in:inbox', 50);
            setEmails(messages);
        } catch (error) {
            console.error('Failed to load inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmails = emails.filter(email =>
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5" />
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
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
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
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <EnvelopeIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No emails found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-primary-200/30 dark:divide-primary-500/20">
                        {filteredEmails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
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
                <div className="border-t border-primary-200/30 dark:border-primary-500/20 p-4 bg-primary-50 dark:bg-primary-900/10">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-secondary-900 dark:text-white">{selectedEmail.subject}</h4>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded">
                                <ArchiveBoxIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                        From: {selectedEmail.from} • {new Date(selectedEmail.date).toLocaleString()}
                    </p>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{selectedEmail.snippet}</p>
                </div>
            )}
        </div>
    );
};

