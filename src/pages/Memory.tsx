import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryService, MemoryInsight, UserPreference, ConversationMemory, MemoryStats } from '@/services/memory.service';
import './Memory.css';

interface TabProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'insights', label: '🧠 Memory Insights', icon: '🧠' },
        { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
        { id: 'conversations', label: '💬 Conversations', icon: '💬' },
        { id: 'analytics', label: '📊 Analytics', icon: '📊' },
        { id: 'privacy', label: '🔒 Privacy', icon: '🔒' }
    ];

    return (
        <div className="memory-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`memory-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
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
            case 'preference': return '❤️';
            case 'pattern': return '🔄';
            case 'security': return '🚨';
            case 'context': return '💡';
            default: return '📝';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return '#10b981'; // green
        if (confidence >= 0.6) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    if (loading) return <div className="memory-loading">🧠 Loading memory insights...</div>;
    if (error) return <div className="memory-error">❌ Error: {error}</div>;

    return (
        <div className="memory-insights">
            <div className="insights-header">
                <h2>🧠 Memory Insights</h2>
                <p>AI-generated insights about your conversation patterns and preferences</p>
            </div>

            {insights.length === 0 ? (
                <div className="no-insights">
                    <div className="no-insights-icon">🤔</div>
                    <h3>No insights yet</h3>
                    <p>Start chatting with the AI to build your memory profile!</p>
                </div>
            ) : (
                <div className="insights-grid">
                    {insights.map((insight, index) => (
                        <div key={index} className="insight-card">
                            <div className="insight-header">
                                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                                <span className="insight-type">{insight.type}</span>
                                <div
                                    className="confidence-badge"
                                    style={{ backgroundColor: getConfidenceColor(insight.confidence) }}
                                >
                                    {Math.round(insight.confidence * 100)}%
                                </div>
                            </div>
                            <div className="insight-content">
                                {insight.content}
                            </div>
                            <div className="insight-footer">
                                <span className="insight-source">Source: {insight.source}</span>
                                <span className="insight-timestamp">
                                    {new Date(insight.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
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
            // Refresh data
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
                // Refresh data
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

    if (loading) return <div className="memory-loading">⚙️ Loading preferences...</div>;
    if (error) return <div className="memory-error">❌ Error: {error}</div>;

    return (
        <div className="memory-preferences">
            <div className="preferences-header">
                <h2>⚙️ Your Preferences</h2>
                <p>{summary}</p>
            </div>

            <div className="preferences-form">
                <div className="preference-section">
                    <h3>🤖 AI Model Preferences</h3>

                    <div className="form-group">
                        <label>Preferred Model:</label>
                        <select
                            value={preferences.preferredModel || ''}
                            onChange={(e) => handlePreferenceChange('preferredModel', e.target.value)}
                        >
                            <option value="">Auto-select</option>
                            <option value="amazon.nova-pro-v1:0">Amazon Nova Pro</option>
                            <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet</option>
                            <option value="anthropic.claude-3-5-haiku-20241022-v1:0">Claude 3.5 Haiku</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Chat Mode:</label>
                        <select
                            value={preferences.preferredChatMode || ''}
                            onChange={(e) => handlePreferenceChange('preferredChatMode', e.target.value)}
                        >
                            <option value="">Auto-select</option>
                            <option value="fastest">⚡ Fastest</option>
                            <option value="balanced">⚖️ Balanced</option>
                            <option value="cheapest">💰 Cheapest</option>
                        </select>
                    </div>
                </div>

                <div className="preference-section">
                    <h3>📝 Response Preferences</h3>

                    <div className="form-group">
                        <label>Response Length:</label>
                        <select
                            value={preferences.responseLength || ''}
                            onChange={(e) => handlePreferenceChange('responseLength', e.target.value)}
                        >
                            <option value="">Auto-select</option>
                            <option value="concise">📋 Concise</option>
                            <option value="detailed">📄 Detailed</option>
                            <option value="comprehensive">📚 Comprehensive</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Technical Level:</label>
                        <select
                            value={preferences.technicalLevel || ''}
                            onChange={(e) => handlePreferenceChange('technicalLevel', e.target.value)}
                        >
                            <option value="">Auto-detect</option>
                            <option value="beginner">🌱 Beginner</option>
                            <option value="intermediate">🌿 Intermediate</option>
                            <option value="expert">🌳 Expert</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Cost Preference:</label>
                        <select
                            value={preferences.costPreference || ''}
                            onChange={(e) => handlePreferenceChange('costPreference', e.target.value)}
                        >
                            <option value="">Balanced</option>
                            <option value="cheap">💰 Cost-effective</option>
                            <option value="balanced">⚖️ Balanced</option>
                            <option value="premium">💎 Premium</option>
                        </select>
                    </div>
                </div>

                <div className="preference-section">
                    <h3>🔔 Notification Preferences</h3>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.email || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    email: e.target.checked
                                })}
                            />
                            📧 Email notifications
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.weeklyDigest || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    weeklyDigest: e.target.checked
                                })}
                            />
                            📊 Weekly digest
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notificationPreferences?.costAlerts || false}
                                onChange={(e) => handlePreferenceChange('notificationPreferences', {
                                    ...preferences.notificationPreferences,
                                    costAlerts: e.target.checked
                                })}
                            />
                            💰 Cost alerts
                        </label>
                    </div>
                </div>

                <div className="preferences-actions">
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '💾 Saving...' : '💾 Save Preferences'}
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={handleReset}
                        disabled={saving}
                    >
                        🔄 Reset to Defaults
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
            // Refresh conversations
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
                // Refresh conversations
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

    if (loading) return <div className="memory-loading">💬 Loading conversations...</div>;
    if (error) return <div className="memory-error">❌ Error: {error}</div>;

    return (
        <div className="memory-conversations">
            <div className="conversations-header">
                <h2>💬 Conversation History</h2>
                <div className="conversations-controls">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={includeArchived}
                            onChange={(e) => {
                                setIncludeArchived(e.target.checked);
                                setPage(1);
                            }}
                        />
                        📦 Include archived
                    </label>
                </div>
            </div>

            {conversations.length === 0 ? (
                <div className="no-conversations">
                    <div className="no-conversations-icon">💭</div>
                    <h3>No conversations found</h3>
                    <p>Your conversation history will appear here as you chat with the AI.</p>
                </div>
            ) : (
                <>
                    <div className="conversations-list">
                        {conversations.map((conversation) => (
                            <div key={conversation._id} className={`conversation-card ${conversation.isArchived ? 'archived' : ''}`}>
                                <div className="conversation-header">
                                    <div className="conversation-meta">
                                        <span className="conversation-date">
                                            {new Date(conversation.createdAt).toLocaleDateString()}
                                        </span>
                                        {conversation.metadata.modelUsed && (
                                            <span className="conversation-model">
                                                🤖 {conversation.metadata.modelUsed}
                                            </span>
                                        )}
                                        {conversation.isArchived && (
                                            <span className="archived-badge">📦 Archived</span>
                                        )}
                                    </div>
                                    <div className="conversation-actions">
                                        {!conversation.isArchived && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleArchive(conversation._id)}
                                                title="Archive conversation"
                                            >
                                                📦
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDelete(conversation._id)}
                                            title="Delete conversation"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="conversation-content">
                                    <div className="conversation-query">
                                        <strong>You:</strong> {conversation.query.substring(0, 200)}
                                        {conversation.query.length > 200 && '...'}
                                    </div>
                                    <div className="conversation-response">
                                        <strong>AI:</strong> {conversation.response.substring(0, 300)}
                                        {conversation.response.length > 300 && '...'}
                                    </div>
                                </div>

                                {conversation.metadata.topics && conversation.metadata.topics.length > 0 && (
                                    <div className="conversation-topics">
                                        {conversation.metadata.topics.map((topic, index) => (
                                            <span key={index} className="topic-tag">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next →
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

    if (loading) return <div className="memory-loading">📊 Loading analytics...</div>;
    if (error) return <div className="memory-error">❌ Error: {error}</div>;
    if (!stats) return <div className="memory-error">❌ No analytics data available</div>;

    return (
        <div className="memory-analytics">
            <div className="analytics-header">
                <h2>📊 Memory Analytics</h2>
                <p>Insights into your AI assistant usage and memory storage</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.conversationCount}</div>
                        <div className="stat-label">Conversations</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🧠</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.memoryCount}</div>
                        <div className="stat-label">Memory Entries</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⚙️</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.hasPreferences ? 'Yes' : 'No'}</div>
                        <div className="stat-label">Preferences Set</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.vectorStorage.totalVectors}</div>
                        <div className="stat-label">Vector Embeddings</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💾</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.vectorStorage.memoryUsage}</div>
                        <div className="stat-label">Memory Usage</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.vectorStorage.cacheSize}</div>
                        <div className="stat-label">Cache Entries</div>
                    </div>
                </div>
            </div>

            <div className="analytics-footer">
                <p className="last-updated">
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
                // Refresh page or redirect
                window.location.reload();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) return <div className="memory-loading">🔒 Loading privacy settings...</div>;
    if (error) return <div className="memory-error">❌ Error: {error}</div>;

    return (
        <div className="memory-privacy">
            <div className="privacy-header">
                <h2>🔒 Privacy & Data Control</h2>
                <p>Manage how your data is used and stored</p>
            </div>

            <div className="privacy-section">
                <h3>🛡️ Privacy Settings</h3>

                <div className="privacy-controls">
                    <label className="privacy-control">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.trackUsage || false}
                            onChange={(e) => handlePrivacyChange('trackUsage', e.target.checked)}
                        />
                        <div className="control-info">
                            <strong>📊 Usage Tracking</strong>
                            <p>Allow tracking of your usage patterns to improve recommendations</p>
                        </div>
                    </label>

                    <label className="privacy-control">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.personalizedRecommendations || false}
                            onChange={(e) => handlePrivacyChange('personalizedRecommendations', e.target.checked)}
                        />
                        <div className="control-info">
                            <strong>🎯 Personalized Recommendations</strong>
                            <p>Use your conversation history to provide personalized suggestions</p>
                        </div>
                    </label>

                    <label className="privacy-control">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.retainConversations || false}
                            onChange={(e) => handlePrivacyChange('retainConversations', e.target.checked)}
                        />
                        <div className="control-info">
                            <strong>💾 Retain Conversations</strong>
                            <p>Store your conversation history for future reference</p>
                        </div>
                    </label>

                    <label className="privacy-control">
                        <input
                            type="checkbox"
                            checked={preferences.privacySettings?.shareData || false}
                            onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
                        />
                        <div className="control-info">
                            <strong>🤝 Data Sharing</strong>
                            <p>Allow anonymized data to be used for research and improvements</p>
                        </div>
                    </label>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '💾 Saving...' : '💾 Save Privacy Settings'}
                </button>
            </div>

            <div className="privacy-section">
                <h3>📥 Data Export & Deletion</h3>

                <div className="data-actions">
                    <div className="action-card">
                        <div className="action-info">
                            <strong>📤 Export Your Data</strong>
                            <p>Download all your data in JSON format (GDPR compliant)</p>
                        </div>
                        <button className="btn-secondary" onClick={handleExportData}>
                            📤 Export Data
                        </button>
                    </div>

                    <div className="action-card danger">
                        <div className="action-info">
                            <strong>🗑️ Delete All Data</strong>
                            <p>Permanently delete all your memory data. This cannot be undone!</p>
                        </div>
                        <button
                            className="btn-danger"
                            onClick={handleClearMemory}
                            disabled={saving}
                        >
                            {saving ? '🗑️ Deleting...' : '🗑️ Delete All Data'}
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
            <div className="memory-container">
                <div className="memory-error">
                    ❌ Please log in to access your memory settings.
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
        <div className="memory-container">
            <div className="memory-header">
                <h1>🧠 AI Memory & Personalization</h1>
                <p>Manage your AI assistant's memory, preferences, and personalization settings</p>
            </div>

            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="memory-content">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default Memory;