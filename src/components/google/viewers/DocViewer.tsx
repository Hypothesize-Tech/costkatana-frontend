import React, { useState, useEffect } from 'react';
import {
    DocumentTextIcon,
    ArrowPathIcon,
    PlusIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { GoogleConnection } from '../../../services/google.service';

interface DocViewerProps {
    connection: GoogleConnection;
    docId?: string;
}

export const DocViewer: React.FC<DocViewerProps> = ({ connection, docId }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (docId) {
            loadDocContent();
        }
    }, [connection, docId]);

    const loadDocContent = async () => {
        if (!docId) return;

        try {
            setLoading(true);
            const response = await fetch(
                `/api/google/docs/${docId}/content?connectionId=${connection._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setContent(result.data.content || '');
            }
        } catch (error) {
            console.error('Failed to load document content:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        Documents
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadDocContent}
                            disabled={loading || !docId}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto p-6">
                {!docId ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                        <DocumentTextIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Select or create a document to view content</p>
                        <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Create New Document
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-primary-200/30 dark:border-primary-500/20">
                            <pre className="whitespace-pre-wrap font-sans text-secondary-900 dark:text-white">
                                {content || 'No content available'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {docId && (
                <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export to PDF
                    </button>
                    <a
                        href={`https://docs.google.com/document/d/${docId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        Open in Google Docs
                    </a>
                </div>
            )}
        </div>
    );
};

