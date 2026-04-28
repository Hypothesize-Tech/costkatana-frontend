import React, { useMemo, useState } from 'react';
import {
    DocumentTextIcon,
    EyeIcon,
    XMarkIcon,
    ChevronUpIcon,
    PaperClipIcon, // dock keeps the paperclip — it's an "attached" indicator, not an action
} from '@heroicons/react/24/outline';
import type { ChatMessage } from '@/services/chat.service';

interface ConversationFilesDockProps {
    messages: ChatMessage[];
    onPreview: (documentId: string, fileName: string) => void;
}

interface DockedFile {
    documentId: string;
    fileName: string;
    chunksCount?: number;
    fileType?: string;
}

/**
 * Floating bottom-right surface that aggregates every document attached to
 * the current conversation. Re-derives from the live message list, so the
 * dock survives chat switches and page reloads as soon as the messages are
 * hydrated from `getConversationHistory` (which restores `attachedDocuments`
 * on each persisted message).
 *
 * Click a chip to open the existing `DocumentPreviewModal` via the parent's
 * `onPreview` handler, which already drives the library-side preview.
 */
export const ConversationFilesDock: React.FC<ConversationFilesDockProps> = ({
    messages,
    onPreview,
}) => {
    const [expanded, setExpanded] = useState(false);

    const files: DockedFile[] = useMemo(() => {
        const seen = new Set<string>();
        const collected: DockedFile[] = [];
        for (const msg of messages ?? []) {
            for (const doc of msg?.attachedDocuments ?? []) {
                if (!doc?.documentId || seen.has(doc.documentId)) continue;
                seen.add(doc.documentId);
                collected.push({
                    documentId: doc.documentId,
                    fileName: doc.fileName,
                    chunksCount: doc.chunksCount,
                    fileType: doc.fileType,
                });
            }
        }
        return collected;
    }, [messages]);

    if (files.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-40 select-none">
            {/* Expanded list */}
            {expanded && (
                <div className="mb-2 w-72 max-w-[calc(100vw-3rem)] glass rounded-xl border border-primary-200/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-primary-200/20">
                        <div className="flex items-center gap-2">
                            <PaperClipIcon className="w-4 h-4 text-primary-500" />
                            <span className="text-xs font-display font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide">
                                Attached files
                            </span>
                            <span className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary">
                                {files.length}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            className="p-1 rounded-md hover:bg-primary-500/15 transition-colors"
                            title="Collapse"
                        >
                            <XMarkIcon className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                        </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                        {files.map((file) => (
                            <button
                                key={file.documentId}
                                type="button"
                                onClick={() => onPreview(file.documentId, file.fileName)}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-primary-500/10 transition-colors group"
                                title={file.fileName}
                            >
                                <DocumentTextIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                                        {file.fileName}
                                    </div>
                                    {typeof file.chunksCount === 'number' && file.chunksCount > 0 && (
                                        <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            {file.chunksCount} {file.chunksCount === 1 ? 'chunk' : 'chunks'}
                                        </div>
                                    )}
                                </div>
                                <EyeIcon className="w-3.5 h-3.5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Collapsed pill */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full glass border border-primary-200/30 backdrop-blur-xl shadow-xl hover:border-primary-400/50 hover:bg-primary-500/10 transition-all"
                title={expanded ? 'Collapse attached files' : 'Show attached files'}
            >
                <PaperClipIcon className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
                <ChevronUpIcon
                    className={`w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary transition-transform ${expanded ? '' : 'rotate-180'}`}
                />
            </button>
        </div>
    );
};

export default ConversationFilesDock;
