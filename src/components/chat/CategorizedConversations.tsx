import React, { useState, useMemo } from 'react';
import {
    TrashIcon,
    ArchiveBoxIcon,
    PencilIcon,
    ArchiveBoxArrowDownIcon,
    CogIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { ChatService, Conversation } from '@/services/chat.service';
import { PinIcon, MoreVertical, Loader2 } from 'lucide-react';
import { usePopper } from 'react-popper';

interface CategorizedConversationsProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onConversationsUpdate: () => void;
    onConversationUpdate?: (id: string, updates: Partial<Conversation>) => void;
    onDeleteRequest?: (conversationId: string) => void;
    collapsed?: boolean;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onLoadMore?: () => void;
}

export const CategorizedConversations: React.FC<CategorizedConversationsProps> = ({
    conversations,
    currentConversationId,
    onSelectConversation,
    onConversationsUpdate,
    onConversationUpdate,
    onDeleteRequest,
    collapsed = false,
    hasMore = false,
    isLoadingMore = false,
    onLoadMore,
}) => {
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 4],
                },
            },
        ],
    });

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [pinningId, setPinningId] = useState<string | null>(null);

    // Categorize conversations by time and pin status
    const categorized = useMemo(() => {
        const filtered = showArchived
            ? conversations
            : conversations.filter((c) => !c.isArchived);

        // Separate pinned and unpinned conversations
        const pinnedConversations = filtered.filter((c) => c.isPinned)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const unpinnedConversations = filtered.filter((c) => !c.isPinned);

        // Categorize unpinned conversations by time
        const timeCategorized = ChatService.categorizeConversationsByTime(unpinnedConversations);

        return {
            pinned: pinnedConversations,
            ...timeCategorized,
        };
    }, [conversations, showArchived]);

    const archivedCount = useMemo(() => {
        return conversations.filter((c) => c.isArchived).length;
    }, [conversations]);

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const handleContextMenu = (
        e: React.MouseEvent,
        conv: Conversation
    ) => {
        e.preventDefault();
        e.stopPropagation();
        // Handle right-click to open menu
        setMenuOpen(conv.id);
    };

    const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, convId: string) => {
        e.stopPropagation();
        setMenuOpen(menuOpen === convId ? null : convId);
    };

    const handleRename = async (convId: string) => {
        const conv = conversations.find((c) => c.id === convId);
        if (conv) {
            setRenamingId(conv.id);
            setRenameValue(conv.title);
            setMenuOpen(null);
        }
    };

    const handleRenameSubmit = async (conversationId: string) => {
        if (!renameValue.trim()) return;
        try {
            await ChatService.renameConversation(conversationId, renameValue.trim());
            setRenamingId(null);
            setRenameValue('');

            // Update local state first for immediate UI feedback
            if (onConversationUpdate) {
                onConversationUpdate(conversationId, { title: renameValue.trim() });
            } else {
                onConversationsUpdate();
            }
        } catch (error) {
            console.error('Error renaming conversation:', error);
        }
    };

    const handlePin = async (convId: string, isPinned: boolean) => {
        try {
            setPinningId(convId);
            // Update local state first for immediate UI feedback
            if (onConversationUpdate) {
                onConversationUpdate(convId, { isPinned: !isPinned });
            }

            await ChatService.pinConversation(convId, !isPinned);
            setMenuOpen(null);

            // Only call full refresh as fallback if local update not available
            if (!onConversationUpdate) {
                onConversationsUpdate();
            }
        } catch (error) {
            console.error('Error pinning conversation:', error);
            // Revert local state on error if we updated it
            if (onConversationUpdate) {
                onConversationUpdate(convId, { isPinned: isPinned });
            }
        } finally {
            setPinningId(null);
        }
    };

    const handleArchive = async (convId: string, isArchived: boolean) => {
        try {
            setArchivingId(convId);
            // Update local state first for immediate UI feedback
            if (onConversationUpdate) {
                onConversationUpdate(convId, { isArchived: !isArchived });
            }

            await ChatService.archiveConversation(convId, !isArchived);
            setMenuOpen(null);

            // Only call full refresh as fallback if local update not available
            if (!onConversationUpdate) {
                onConversationsUpdate();
            }
        } catch (error) {
            console.error('Error archiving conversation:', error);
            // Revert local state on error if we updated it
            if (onConversationUpdate) {
                onConversationUpdate(convId, { isArchived: isArchived });
            }
        } finally {
            setArchivingId(null);
        }
    };

    const handleDelete = (conversationId: string) => {
        setMenuOpen(null);
        if (onDeleteRequest) {
            onDeleteRequest(conversationId);
        }
    };

    const renderConversation = (conversation: Conversation) => {
        const isRenaming = renamingId === conversation.id;
        const isActive = currentConversationId === conversation.id;
        const isMenuOpen = menuOpen === conversation.id;

        return (
            <div
                key={conversation.id}
                className={`group p-2 md:p-2.5 lg:p-3 mx-1 md:mx-2 mb-1.5 md:mb-2 rounded-lg md:rounded-xl cursor-pointer hover:bg-primary-500/10 transition-all duration-300 ${isActive
                    ? 'bg-gradient-primary/10 border border-primary-200/50 shadow-lg'
                    : 'hover:shadow-md'
                    }`}
                onClick={() => !isRenaming && onSelectConversation(conversation.id)}
                onContextMenu={(e) => handleContextMenu(e, conversation)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        {isRenaming ? (
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => handleRenameSubmit(conversation.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleRenameSubmit(conversation.id);
                                    } else if (e.key === 'Escape') {
                                        setRenamingId(null);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary w-full bg-white dark:bg-gray-700 border border-primary-300 dark:border-primary-600 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                autoFocus
                            />
                        ) : (
                            <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-1 flex items-center gap-2">
                                {conversation.isPinned && (
                                    <PinIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                )}
                                {conversation.isArchived && (
                                    <ArchiveBoxIcon className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
                                )}
                                <span className="truncate">{conversation.title}</span>
                                {conversation.governedTasks && conversation.governedTasks.count > 0 && (
                                    <span className="ml-2 inline-flex items-center gap-1">
                                        {conversation.governedTasks.active?.status === 'completed' ? (
                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        ) : conversation.governedTasks.active?.status === 'failed' ? (
                                            <XCircleIcon className="w-4 h-4 text-red-500" />
                                        ) : conversation.governedTasks.active?.status === 'in_progress' ? (
                                            <CogIcon className="w-4 h-4 text-blue-500 animate-spin" />
                                        ) : (
                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {conversation.governedTasks.count} plan{conversation.governedTasks.count > 1 ? 's' : ''}
                                        </span>
                                    </span>
                                )}
                            </h4>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-light-text-muted dark:text-dark-text-muted">
                            <span>{conversation.messageCount} msgs</span>
                            <span>•</span>
                            <span>{formatTimestamp(conversation.updatedAt)}</span>
                        </div>
                        {conversation.totalCost && (
                            <p className="text-xs font-bold gradient-text mt-1 inline-block bg-gradient-success/10 px-2 py-0.5 rounded-lg">
                                ${conversation.totalCost.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* 3-dot menu button */}
                    <div className="relative">
                        <button
                            ref={(el) => isMenuOpen ? setReferenceElement(el) : null}
                            onClick={(e) => handleMenuClick(e, conversation.id)}
                            className={`opacity-0 group-hover:opacity-100 ml-2 p-1.5 rounded-lg transition-all duration-300 ${isMenuOpen
                                ? 'opacity-100 bg-primary-500/20 text-primary-600 dark:text-primary-400'
                                : 'text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10'
                                }`}
                            title="More options"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Popper menu */}
                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(null)}
                                />
                                <div
                                    ref={setPopperElement}
                                    style={styles.popper}
                                    {...attributes.popper}
                                    className="z-50 glass backdrop-blur-xl bg-white dark:bg-dark-bg-200 rounded-xl shadow-2xl border border-primary-200/30 dark:border-primary-700/20 py-1.5 min-w-[180px]"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRename(conversation.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200 flex items-center gap-3 text-light-text-primary dark:text-dark-text-primary font-medium"
                                    >
                                        <PencilIcon className="w-4 h-4 text-primary-500" />
                                        <span>Rename</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePin(conversation.id, conversation.isPinned || false);
                                        }}
                                        disabled={pinningId === conversation.id}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200 flex items-center gap-3 text-light-text-primary dark:text-dark-text-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {pinningId === conversation.id ? (
                                            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                                        ) : (
                                            <PinIcon className="w-4 h-4 text-primary-500" />
                                        )}
                                        <span>{conversation.isPinned ? 'Unpin' : 'Pin'}</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchive(conversation.id, conversation.isArchived || false);
                                        }}
                                        disabled={archivingId === conversation.id}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200 flex items-center gap-3 text-light-text-primary dark:text-dark-text-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {archivingId === conversation.id ? (
                                            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                                        ) : conversation.isArchived ? (
                                            <ArchiveBoxArrowDownIcon className="w-4 h-4 text-primary-500" />
                                        ) : (
                                            <ArchiveBoxIcon className="w-4 h-4 text-primary-500" />
                                        )}
                                        <span>{conversation.isArchived ? 'Unarchive' : 'Archive'}</span>
                                    </button>
                                    <div className="my-1 border-t border-primary-200/30 dark:border-primary-700/30" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(conversation.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-200 flex items-center gap-3 text-danger-600 dark:text-danger-400 font-medium"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCategory = (title: string, convs: Conversation[], isPinned: boolean = false) => {
        if (convs.length === 0) return null;

        return (
            <div className="mb-4">
                <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${isPinned
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-light-text-muted dark:text-dark-text-muted'
                    }`}>
                    {isPinned && <PinIcon className="w-3.5 h-3.5" />}
                    {title}
                </div>
                {convs.map(renderConversation)}
            </div>
        );
    };

    if (collapsed) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            {conversations.length === 0 ? (
                <div className="p-4 text-center">
                    <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                        No conversations yet
                    </p>
                </div>
            ) : (
                <>
                    {renderCategory('Pinned', categorized.pinned, true)}
                    {renderCategory('Today', categorized.today)}
                    {renderCategory('Yesterday', categorized.yesterday)}
                    {renderCategory('Last 7 Days', categorized.sevenDays)}
                    {renderCategory('Last 30 Days', categorized.thirtyDays)}
                    {renderCategory('Earlier', categorized.earlier)}

                    {archivedCount > 0 && (
                        <div className="px-3 py-2">
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center gap-1 transition-colors duration-200"
                            >
                                <ArchiveBoxIcon className="w-4 h-4" />
                                {showArchived ? 'Hide' : 'Show'} Archived ({archivedCount})
                            </button>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && onLoadMore && (
                        <div className="px-3 py-4 flex justify-center">
                            <button
                                onClick={onLoadMore}
                                disabled={isLoadingMore}
                                className="px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-primary-600/10 hover:from-primary-500/20 hover:to-primary-600/20 text-primary-600 dark:text-primary-400 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed border border-primary-200/30 dark:border-primary-700/30 hover:shadow-md hover:scale-105"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Loading more chats...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Load More Conversations</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

