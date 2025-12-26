import React, { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { GoogleConnection, googleService } from '../../../services/google.service';
import { GoogleServiceShimmer } from '../../ui/GoogleServiceShimmer';
import { GoogleViewerStates } from '../GoogleViewerStates';
import { CreateDocModal } from '../modals/CreateDocModal';
import GoogleFileAttachmentService from '../../../services/googleFileAttachment.service';
import googleDocsLogo from '../../../assets/google-docs-logo.webp';

interface DocViewerProps {
    connection: GoogleConnection;
    docId?: string;
}

interface GoogleDocument {
    id: string;
    name: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
}

export const DocViewer: React.FC<DocViewerProps> = ({ connection, docId }) => {
    const [documents, setDocuments] = useState<GoogleDocument[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<GoogleDocument | null>(null);
    const [documentContent, setDocumentContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection._id]);

    useEffect(() => {
        if (docId) {
            loadDocumentContent(docId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection._id, docId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const documentsList = await googleService.listDocuments(connection._id);
            setDocuments(documentsList);

            // If docId is provided, find and select that document
            if (docId) {
                const doc = documentsList.find(d => d.id === docId);
                if (doc) {
                    setSelectedDocument(doc);
                }
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDocumentContent = async (documentId: string) => {
        try {
            setLoadingContent(true);
            const result = await googleService.getDocumentContent(connection._id, documentId);
            setDocumentContent(result.content || '');
        } catch (error) {
            console.error('Failed to load document content:', error);
            setDocumentContent(null);
        } finally {
            setLoadingContent(false);
        }
    };

    const handleSelectDocument = async (document: GoogleDocument) => {
        setSelectedDocument(document);
        await loadDocumentContent(document.id);
    };

    const toggleDocExpanded = (docId: string) => {
        setExpandedDocs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(docId)) {
                newSet.delete(docId);
            } else {
                newSet.add(docId);
            }
            return newSet;
        });
    };

    const handleChatWithAI = (document: GoogleDocument) => {
        try {
            // Convert GoogleDocument to GoogleFileAttachment format
            const googleFile = {
                id: document.id,
                name: document.name,
                mimeType: 'application/vnd.google-apps.document',
                webViewLink: document.webViewLink,
                modifiedTime: document.modifiedTime,
                createdTime: document.createdTime,
                connectionId: connection._id,
            };
            GoogleFileAttachmentService.navigateToChatWithFile(googleFile, connection);
        } catch (error) {
            console.error('Failed to open chat with document:', error);
            // Fallback navigation to chat
            window.location.href = '/chat';
        }
    };

    // Render selected document's content if selectedDocument is set
    const renderSelectedDocumentContent = () => {
        if (!selectedDocument) return null;

        return (
            <div className="p-4 border border-primary-200/30 dark:border-primary-500/20 rounded-lg mb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="mb-2 font-semibold text-secondary-900 dark:text-white">
                            {selectedDocument.name}
                        </h4>
                        <div className="mb-2 text-sm text-secondary-700 dark:text-secondary-200">
                            <span>Created: {new Date(selectedDocument.createdTime).toLocaleString()}</span>
                            <br />
                            <span>Last Modified: {new Date(selectedDocument.modifiedTime).toLocaleString()}</span>
                            <br />
                            <a
                                href={selectedDocument.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700"
                            >
                                Open Document in Google Docs →
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedDocument(null)}
                        className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                        title="Close"
                    >
                        <ChevronUpIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {loadingContent ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : documentContent ? (
                    <div className="mt-4 pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg max-h-96 overflow-y-auto font-sans">
                                {documentContent}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="text-secondary-500 text-sm py-4">No content available for this document.</div>
                )}
            </div>
        );
    };

    if (loading && documents.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                            <img src={googleDocsLogo} alt="Google Docs" className="w-5 h-5 object-contain" />
                            Documents
                        </h3>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <GoogleServiceShimmer count={6} type="list" />
                </div>
            </div>
        );
    }

    if (!loading && documents.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                            <img src={googleDocsLogo} alt="Google Docs" className="w-5 h-5 object-contain" />
                            Documents
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={loadDocuments}
                                disabled={loading}
                                className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                title="Refresh"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                title="Create new document"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <GoogleViewerStates
                        state="empty"
                        serviceName="Documents"
                        suggestedCommand="@docs list my documents"
                    />
                </div>
                {showCreateModal && (
                    <CreateDocModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        connectionId={connection._id}
                        onDocCreated={loadDocuments}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <img src={googleDocsLogo} alt="Google Docs" className="w-5 h-5 object-contain" />
                        Documents
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadDocuments}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Refresh"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                            title="Create new document"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Selected Document Content */}
            {renderSelectedDocumentContent()}

            {/* Documents List */}
            <div className="flex-1 overflow-auto p-4">
                {loading && documents.length > 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((document) => {
                            const isExpanded = expandedDocs.has(document.id);
                            const isSelected = selectedDocument?.id === document.id;

                            return (
                                <div
                                    key={document.id}
                                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${isSelected
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-primary-200/30 dark:border-primary-500/20 hover:border-primary-600'
                                        }`}
                                    onClick={() => handleSelectDocument(document)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                                                {document.name}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                                <span>Created: {new Date(document.createdTime).toLocaleDateString()}</span>
                                                <span>Modified: {new Date(document.modifiedTime).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChatWithAI(document);
                                                }}
                                                className="p-1 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
                                                title="Chat with AI about this document"
                                            >
                                                <div className="bg-gradient-primary p-0.5 rounded glow-primary group-hover:scale-110 transition-transform duration-300">
                                                    <ChatBubbleLeftRightIcon className="w-3 h-3 text-white" />
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDocExpanded(document.id);
                                                }}
                                                className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                                                title={isExpanded ? 'Collapse' : 'View details'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUpIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                                ) : (
                                                    <ChevronDownIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-primary-200/30 dark:border-primary-500/20">
                                            <div className="flex items-center gap-4 text-sm">
                                                <a
                                                    href={document.webViewLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:text-primary-700"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Open in Google Docs →
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Create New Document
                </button>
                <button
                    onClick={loadDocuments}
                    className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Create Document Modal */}
            {showCreateModal && (
                <CreateDocModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    connectionId={connection._id}
                    onDocCreated={loadDocuments}
                />
            )}
        </div>
    );
};
