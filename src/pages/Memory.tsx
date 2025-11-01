import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryService, MemoryInsight, UserPreference, ConversationMemory, MemoryStats } from '@/services/memory.service';
import {
    Cog6ToothIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    LockClosedIcon,
    HeartIcon,
    ArrowPathIcon,
    ShieldExclamationIcon,
    LightBulbIcon,
    DocumentTextIcon,
    BoltIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ArchiveBoxIcon,
    XCircleIcon,
    CpuChipIcon,
    CubeIcon,
    ServerIcon,
    EnvelopeIcon,
    BellIcon,
    CurrencyDollarIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { Brain } from 'lucide-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface TabProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'insights', label: 'Memory Insights', icon: Brain },
        { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
        { id: 'conversations', label: 'Conversations', icon: ChatBubbleLeftRightIcon },
        { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
        { id: 'privacy', label: 'Privacy', icon: LockClosedIcon }
    ];

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2 mb-6">
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MemoryInsightsTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [insights, setInsights] = useState<MemoryInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const data = await MemoryService.getMemoryInsights(userId);
                setInsights(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [userId]);

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'preference': return HeartIcon;
            case 'pattern': return ArrowPathIcon;
            case 'security': return ShieldExclamationIcon;
            case 'context': return LightBulbIcon;
            default: return DocumentTextIcon;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'bg-success-500';
        if (confidence >= 0.6) return 'bg-warning-500';
        return 'bg-danger-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Loading memory insights...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    Error: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
                        Memory Insights
                    </h2>
                </div>
                <p className="text-secondary-600 dark:text-secondary-300 text-lg">
                    AI-generated insights about your conversation patterns and preferences
                </p>
            </div>

            {insights.length === 0 ? (
                <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                        <LightBulbIcon className="w-16 h-16 text-secondary-400 dark:text-secondary-600" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                        No insights yet
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300">
                        Start chatting with the AI to build your memory profile!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insights.map((insight, index) => {
                        const Icon = getInsightIcon(insight.type);
                        return (
                            <div
                                key={index}
                                className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover transition-all duration-300 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-400"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary-500/10 dark:bg-primary-500/20">
                                            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="font-semibold text-secondary-900 dark:text-white capitalize">
                                            {insight.type}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getConfidenceColor(insight.confidence)}`}>
                                        {Math.round(insight.confidence * 100)}%
                                    </span>
                                </div>
                                <div className="text-secondary-700 dark:text-secondary-300 leading-relaxed mb-4">
                                    {insight.content}
                                </div>
                                <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400 pt-4 border-t border-primary-200/20 dark:border-primary-500/10">
                                    <span>Source: {insight.source}</span>
                                    <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PreferencesTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [preferences, setPreferences] = useState<UserPreference>({});
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const data = await MemoryService.getUserPreferences(userId);
                setPreferences(data.preferences);
                setSummary(data.summary);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [userId]);

    const handlePreferenceChange = (key: keyof UserPreference, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await MemoryService.updateUserPreferences(userId, preferences);
            const data = await MemoryService.getUserPreferences(userId);
            setPreferences(data.preferences);
            setSummary(data.summary);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all preferences? This cannot be undone.')) {
            try {
                setSaving(true);
                await MemoryService.resetPreferences(userId);
                const data = await MemoryService.getUserPreferences(userId);
                setPreferences(data.preferences);
                setSummary(data.summary);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
                        <Cog6ToothIcon className="w-5 h-5" />
                        Loading preferences...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    Error: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Cog6ToothIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
                        Your Preferences
                    </h2>
                </div>
                {summary && (
                    <p className="text-secondary-600 dark:text-secondary-300 text-lg max-w-2xl mx-auto">
                        {summary}
                    </p>
                )}
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* AI Model Preferences */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <CpuChipIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                            AI Model Preferences
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Preferred Model
                            </label>
                            <select
                                value={preferences.preferredModel || ''}
                                onChange={(e) => handlePreferenceChange('preferredModel', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Auto-select</option>
                                <option value="amazon.nova-pro-v1:0">Amazon Nova Pro</option>
                                <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet</option>
                                <option value="anthropic.claude-3-5-haiku-20241022-v1:0">Claude 3.5 Haiku</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Chat Mode
                            </label>
                            <select
                                value={preferences.preferredChatMode || ''}
                                onChange={(e) => handlePreferenceChange('preferredChatMode', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Auto-select</option>
                                <option value="fastest">
                                    <BoltIcon className="w-4 h-4 inline mr-1" />
                                    Fastest
                                </option>
                                <option value="balanced">Balanced</option>
                                <option value="cheapest">
                                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                                    Cheapest
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Response Preferences */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                            Response Preferences
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Response Length
                            </label>
                            <select
                                value={preferences.responseLength || ''}
                                onChange={(e) => handlePreferenceChange('responseLength', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Auto-select</option>
                                <option value="concise">Concise</option>
                                <option value="detailed">Detailed</option>
                                <option value="comprehensive">Comprehensive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Technical Level
                            </label>
                            <select
                                value={preferences.technicalLevel || ''}
                                onChange={(e) => handlePreferenceChange('technicalLevel', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Auto-detect</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Cost Preference
                            </label>
                            <select
                                value={preferences.costPreference || ''}
                                onChange={(e) => handlePreferenceChange('costPreference', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Balanced</option>
                                <option value="cheap">Cost-effective</option>
                                <option value="balanced">Balanced</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BellIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                            Notification Preferences
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.email || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    email: e.target.checked
                                })}
                                className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <span className="font-medium text-secondary-700 dark:text-secondary-300">
                                    Email notifications
                                </span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.weeklyDigest || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    weeklyDigest: e.target.checked
                                })}
                                className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <span className="font-medium text-secondary-700 dark:text-secondary-300">
                                    Weekly digest
                                </span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.costAlerts || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    costAlerts: e.target.checked
                                })}
                                className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <span className="font-medium text-secondary-700 dark:text-secondary-300">
                                    Cost alerts
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>Save Preferences</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Reset to Defaults</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConversationsTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [conversations, setConversations] = useState<ConversationMemory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [includeArchived, setIncludeArchived] = useState(false);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const data = await MemoryService.getConversationHistory(userId, {
                    page,
                    limit: 10,
                    includeArchived
                });
                setConversations(data.conversations);
                setTotalPages(data.pagination.totalPages);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [userId, page, includeArchived]);

    const handleArchive = async (conversationId: string) => {
        try {
            await MemoryService.archiveConversation(conversationId, userId);
            const data = await MemoryService.getConversationHistory(userId, {
                page,
                limit: 10,
                includeArchived
            });
            setConversations(data.conversations);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (conversationId: string) => {
        if (window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
            try {
                await MemoryService.deleteConversation(conversationId, userId);
                const data = await MemoryService.getConversationHistory(userId, {
                    page,
                    limit: 10,
                    includeArchived
                });
                setConversations(data.conversations);
            } catch (err: any) {
                setError(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Loading conversations...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    Error: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
                        Conversation History
                    </h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeArchived}
                        onChange={(e) => {
                            setIncludeArchived(e.target.checked);
                            setPage(1);
                        }}
                        className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                    <ArchiveBoxIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                    <span className="font-medium text-secondary-700 dark:text-secondary-300">
                        Include archived
                    </span>
                </label>
            </div>

            {conversations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-secondary-400 dark:text-secondary-600" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                        No conversations found
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300">
                        Your conversation history will appear here as you chat with the AI.
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation._id}
                                className={`glass rounded-xl border ${conversation.isArchived
                                    ? 'border-secondary-200/30 dark:border-secondary-500/20 opacity-75'
                                    : 'border-primary-200/30 dark:border-primary-500/20'
                                    } shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover transition-all duration-300`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="text-secondary-600 dark:text-secondary-400">
                                            {new Date(conversation.createdAt).toLocaleDateString()}
                                        </span>
                                        {conversation.metadata.modelUsed && (
                                            <span className="px-3 py-1 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-xs font-medium flex items-center gap-1">
                                                <CpuChipIcon className="w-4 h-4" />
                                                {conversation.metadata.modelUsed}
                                            </span>
                                        )}
                                        {conversation.isArchived && (
                                            <span className="px-3 py-1 rounded-full bg-secondary-500/10 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 text-xs font-medium flex items-center gap-1">
                                                <ArchiveBoxIcon className="w-4 h-4" />
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!conversation.isArchived && (
                                            <button
                                                onClick={() => handleArchive(conversation._id)}
                                                className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-500/10 dark:hover:bg-secondary-500/20 transition-colors"
                                                title="Archive conversation"
                                            >
                                                <ArchiveBoxIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(conversation._id)}
                                            className="p-2 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-colors"
                                            title="Delete conversation"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="text-secondary-700 dark:text-secondary-300">
                                        <strong className="text-secondary-900 dark:text-white">You:</strong>{' '}
                                        {conversation.query.substring(0, 200)}
                                        {conversation.query.length > 200 && '...'}
                                    </div>
                                    <div className="text-secondary-700 dark:text-secondary-300">
                                        <strong className="text-secondary-900 dark:text-white">AI:</strong>{' '}
                                        {conversation.response.substring(0, 300)}
                                        {conversation.response.length > 300 && '...'}
                                    </div>
                                </div>

                                {conversation.metadata.topics && conversation.metadata.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-primary-200/20 dark:border-primary-500/10">
                                        {conversation.metadata.topics.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-xs font-medium"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="btn btn-secondary p-2 rounded-lg bg-secondary-500/10 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/20 dark:hover:bg-secondary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                Previous
                            </button>
                            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="btn btn-secondary p-2 rounded-lg bg-secondary-500/10 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/20 dark:hover:bg-secondary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                Next
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const AnalyticsTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [stats, setStats] = useState<MemoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await MemoryService.getStorageStats(userId);
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" />
                        Loading analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    Error: {error}
                </p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    No analytics data available
                </p>
            </div>
        );
    }

    const statCards = [
        { icon: ChatBubbleLeftRightIcon, label: 'Conversations', value: stats.conversationCount, color: 'primary' },
        { icon: Brain, label: 'Memory Entries', value: stats.memoryCount, color: 'accent' },
        { icon: Cog6ToothIcon, label: 'Preferences Set', value: stats.hasPreferences ? 'Yes' : 'No', color: 'success' },
        { icon: CubeIcon, label: 'Vector Embeddings', value: stats.vectorStorage.totalVectors, color: 'highlight' },
        { icon: ServerIcon, label: 'Memory Usage', value: stats.vectorStorage.memoryUsage, color: 'warning' },
        { icon: BoltIcon, label: 'Cache Entries', value: stats.vectorStorage.cacheSize, color: 'primary' }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            primary: {
                bg: 'bg-primary-500/20 dark:bg-primary-500/20',
                text: 'text-primary-600 dark:text-primary-400',
                icon: 'text-primary-600 dark:text-primary-400'
            },
            accent: {
                bg: 'bg-accent-500/20 dark:bg-accent-500/20',
                text: 'text-accent-600 dark:text-accent-400',
                icon: 'text-accent-600 dark:text-accent-400'
            },
            success: {
                bg: 'bg-success-500/20 dark:bg-success-500/20',
                text: 'text-success-600 dark:text-success-400',
                icon: 'text-success-600 dark:text-success-400'
            },
            highlight: {
                bg: 'bg-highlight-500/20 dark:bg-highlight-500/20',
                text: 'text-highlight-600 dark:text-highlight-400',
                icon: 'text-highlight-600 dark:text-highlight-400'
            },
            warning: {
                bg: 'bg-warning-500/20 dark:bg-warning-500/20',
                text: 'text-warning-600 dark:text-warning-400',
                icon: 'text-warning-600 dark:text-warning-400'
            }
        };
        return colors[color] || colors.primary;
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <ChartBarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
                        Memory Analytics
                    </h2>
                </div>
                <p className="text-secondary-600 dark:text-secondary-300 text-lg">
                    Insights into your AI assistant usage and memory storage
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const colors = getColorClasses(stat.color);
                    return (
                        <div
                            key={index}
                            className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium mb-1">
                                        {stat.label}
                                    </p>
                                    <p className={`text-2xl font-display font-bold ${colors.text}`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${colors.bg}`}>
                                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-6 border-t border-primary-200/20 dark:border-primary-500/10">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Last updated: {new Date(stats.lastUpdated).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

const PrivacyTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [preferences, setPreferences] = useState<UserPreference>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const data = await MemoryService.getUserPreferences(userId);
                setPreferences(data.preferences);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [userId]);

    const handlePrivacyChange = (key: string, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            privacySettings: {
                shareData: false,
                trackUsage: true,
                personalizedRecommendations: true,
                retainConversations: true,
                allowModelTraining: false,
                ...prev.privacySettings,
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await MemoryService.updateUserPreferences(userId, preferences);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const data = await MemoryService.exportUserData(userId);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `memory-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleClearMemory = async () => {
        if (window.confirm('⚠️ This will permanently delete ALL your memory data including conversations, preferences, and insights. This cannot be undone. Are you absolutely sure?')) {
            try {
                setSaving(true);
                await MemoryService.clearUserMemory(userId);
                window.location.reload();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
                        <LockClosedIcon className="w-5 h-5" />
                        Loading privacy settings...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center">
                <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    Error: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <LockClosedIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
                        Privacy & Data Control
                    </h2>
                </div>
                <p className="text-secondary-600 dark:text-secondary-300 text-lg">
                    Manage how your data is used and stored
                </p>
            </div>

            {/* Privacy Settings */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldExclamationIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                        Privacy Settings
                    </h3>
                </div>

                <div className="space-y-4 mb-6">
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.trackUsage || false}
                            onChange={(e) => handlePrivacyChange('trackUsage', e.target.checked)}
                            className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mt-0.5"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <ChartBarIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <strong className="text-secondary-900 dark:text-white">Usage Tracking</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Allow tracking of your usage patterns to improve recommendations
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.personalizedRecommendations || false}
                            onChange={(e) => handlePrivacyChange('personalizedRecommendations', e.target.checked)}
                            className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mt-0.5"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <LightBulbIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <strong className="text-secondary-900 dark:text-white">Personalized Recommendations</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Use your conversation history to provide personalized suggestions
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.retainConversations || false}
                            onChange={(e) => handlePrivacyChange('retainConversations', e.target.checked)}
                            className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mt-0.5"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <ServerIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <strong className="text-secondary-900 dark:text-white">Retain Conversations</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Store your conversation history for future reference
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.shareData || false}
                            onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
                            className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mt-0.5"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                                <strong className="text-secondary-900 dark:text-white">Data Sharing</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Allow anonymized data to be used for research and improvements
                            </p>
                        </div>
                    </label>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Save Privacy Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Data Export & Deletion */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowDownTrayIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                        Data Export & Deletion
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-primary-200/20 dark:border-primary-500/10 bg-primary-500/5 dark:bg-primary-500/10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowDownTrayIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <strong className="text-secondary-900 dark:text-white">Export Your Data</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Download all your data in JSON format (GDPR compliant)
                            </p>
                        </div>
                        <button
                            onClick={handleExportData}
                            className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Export Data</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-danger-500/5 dark:bg-danger-500/10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <TrashIcon className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                                <strong className="text-secondary-900 dark:text-white">Delete All Data</strong>
                            </div>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Permanently delete all your memory data. This cannot be undone!
                            </p>
                        </div>
                        <button
                            onClick={handleClearMemory}
                            disabled={saving}
                            className="btn-danger flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <TrashIcon className="w-5 h-5" />
                                    <span>Delete All Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Memory: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('insights');

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6 flex items-center justify-center">
                <div className="glass rounded-xl border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 text-center max-w-md">
                    <p className="text-danger-600 dark:text-danger-400 flex items-center justify-center gap-2">
                        <XCircleIcon className="w-5 h-5" />
                        Please log in to access your memory settings.
                    </p>
                </div>
            </div>
        );
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'insights':
                return <MemoryInsightsTab userId={user.id} />;
            case 'preferences':
                return <PreferencesTab userId={user.id} />;
            case 'conversations':
                return <ConversationsTab userId={user.id} />;
            case 'analytics':
                return <AnalyticsTab userId={user.id} />;
            case 'privacy':
                return <PrivacyTab userId={user.id} />;
            default:
                return <MemoryInsightsTab userId={user.id} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                            <h1 className="text-4xl font-display font-bold gradient-text-primary">
                                AI Memory & Personalization
                            </h1>
                        </div>
                        <p className="text-secondary-600 dark:text-secondary-300 text-lg">
                            Manage your AI assistant's memory, preferences, and personalization settings
                        </p>
                    </div>
                </div>

                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
};

export default Memory;
