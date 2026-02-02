import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    CircleStackIcon,
    PlusIcon,
    LightBulbIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { MongoDBConnectionSelector } from './MongoDBConnectionSelector';
import { useNavigate } from 'react-router-dom';
import { mongodbService } from '../../services/mongodb.service';

interface MongoDBConnection {
    _id: string;
    alias: string;
    isActive: boolean;
    metadata?: {
        host?: string;
        database?: string;
    };
    createdAt: string;
}

interface MongoDBSuggestion {
    category: 'exploration' | 'analysis' | 'optimization' | 'schema';
    label: string;
    command: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface MongoDBIntegrationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCommand?: (command: string) => void;
}

export const MongoDBIntegrationPanel: React.FC<MongoDBIntegrationPanelProps> = ({
    isOpen,
    onClose,
    onSelectCommand,
}) => {
    const [connections, setConnections] = useState<MongoDBConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<MongoDBConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [connectionForm, setConnectionForm] = useState({
        alias: '',
        connectionString: '',
        database: '',
    });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            loadConnections();
        }
    }, [isOpen]);

    const loadConnections = async () => {
        try {
            setLoading(true);
            setError(null);
            const list = await mongodbService.listConnections();
            setConnections(list);

            // Auto-select first active connection
            const activeConnection = list.find((c: MongoDBConnection) => c.isActive);
            if (activeConnection) {
                setSelectedConnection(activeConnection);
            }
        } catch (err: unknown) {
            console.error('Failed to load MongoDB connections:', err);
            setError(err instanceof Error ? err.message : 'Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const staticSuggestions: MongoDBSuggestion[] = [
        {
            category: 'exploration',
            label: 'Show Collections',
            command: '@mongodb list all collections',
            description: 'View all collections in your database',
            icon: ClipboardDocumentListIcon,
        },
        {
            category: 'exploration',
            label: 'Database Stats',
            command: '@mongodb show database stats',
            description: 'Get database size and info',
            icon: ChartBarIcon,
        },
        {
            category: 'analysis',
            label: 'Help',
            command: '@mongodb help',
            description: 'See all available MongoDB commands',
            icon: QuestionMarkCircleIcon,
        },
    ];

    const handleSuggestionClick = (command: string) => {
        if (onSelectCommand) {
            // In chat context - directly set the message
            onSelectCommand(command);
            onClose();
        } else {
            // In IntegrationsPage context - navigate to dashboard/chat with command
            // Store command in sessionStorage so chat can pick it up
            sessionStorage.setItem('mongodb_command', command);
            navigate('/dashboard');
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'exploration':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
            case 'analysis':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
            case 'optimization':
                return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30';
            case 'schema':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30';
        }
    };

    const handleCreateConnection = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!connectionForm.alias || !connectionForm.connectionString) {
            setError('Alias and connection string are required');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await mongodbService.createConnection({
                alias: connectionForm.alias,
                connectionString: connectionForm.connectionString,
                database: connectionForm.database || undefined,
            });

            // Reload connections
            await loadConnections();

            // Reset form and close modal
            setConnectionForm({ alias: '', connectionString: '', database: '' });
            setShowConnectionModal(false);
        } catch (err: unknown) {
            console.error('Failed to create connection:', err);
            setError(err instanceof Error ? err.message : 'Failed to create connection');
        } finally {
            setSaving(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-6xl h-[85vh] glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                            <CircleStackIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold gradient-text-primary">
                                MongoDB Database
                            </h2>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Query your database with natural language
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-secondary-600 dark:text-secondary-400">
                                    Loading MongoDB connections...
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={loadConnections}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <CircleStackIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                                    No MongoDB Connections
                                </h3>
                                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                                    Connect your MongoDB database to start querying with natural language.
                                </p>
                                <button
                                    onClick={() => setShowConnectionModal(true)}
                                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Connect MongoDB
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-6 space-y-6">
                            {/* Connection Selector */}
                            <div className="glass rounded-xl p-4 border border-primary-200/30 dark:border-primary-500/20">
                                <MongoDBConnectionSelector
                                    connections={connections}
                                    selectedConnection={selectedConnection}
                                    onSelectConnection={setSelectedConnection}
                                />
                            </div>

                            {/* Suggested Commands */}
                            <div className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                                        Quick Commands
                                    </h3>
                                    <button
                                        onClick={() => setShowConnectionModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Add Connection
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {staticSuggestions.map((suggestion, index) => {
                                        const IconComponent = suggestion.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion.command)}
                                                className={`p-4 rounded-lg border text-left transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${getCategoryColor(suggestion.category)}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500/10 dark:bg-primary-500/20">
                                                        <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                                                                {suggestion.category}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-sm mb-1 truncate">
                                                            {suggestion.label}
                                                        </h4>
                                                        <p className="text-xs opacity-75 line-clamp-2">
                                                            {suggestion.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Context Display */}
                            {selectedConnection && (
                                <div className="glass rounded-xl p-4 border border-primary-200/30 dark:border-primary-500/20">
                                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">
                                        Active Context
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-secondary-600 dark:text-secondary-400">Connection:</span>
                                            <span className="font-medium text-secondary-900 dark:text-white">
                                                {selectedConnection.alias}
                                            </span>
                                        </div>
                                        {selectedConnection.metadata?.database && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-secondary-600 dark:text-secondary-400">Database:</span>
                                                <span className="font-medium text-secondary-900 dark:text-white">
                                                    {selectedConnection.metadata.database}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-primary-200/30 dark:border-primary-500/20 bg-secondary-50/50 dark:bg-secondary-900/20">
                    <div className="flex items-center justify-center gap-2 text-xs text-secondary-600 dark:text-secondary-400">
                        <LightBulbIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <p className="text-center">
                            Tip: Use <code className="px-2 py-1 bg-secondary-200/50 dark:bg-secondary-800/50 rounded">@mongodb</code> in chat to query your database with natural language
                        </p>
                    </div>
                </div>
            </div>

            {/* Connection Setup Modal */}
            {showConnectionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <CircleStackIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text-primary">
                                    Add MongoDB Connection
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowConnectionModal(false);
                                    setConnectionForm({ alias: '', connectionString: '', database: '' });
                                    setError(null);
                                }}
                                className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleCreateConnection} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                    Connection Alias *
                                </label>
                                <input
                                    type="text"
                                    value={connectionForm.alias}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, alias: e.target.value })}
                                    placeholder="e.g., Production DB"
                                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                    Connection String *
                                </label>
                                <input
                                    type="password"
                                    value={connectionForm.connectionString}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, connectionString: e.target.value })}
                                    placeholder="mongodb+srv://username:password@host/database"
                                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                    Your connection string will be encrypted and stored securely
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                    Database Name *
                                </label>
                                <input
                                    type="text"
                                    value={connectionForm.database}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, database: e.target.value })}
                                    placeholder="e.g., test (must match the database in your connection string: /test)"
                                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                    💡 This must match the database name in your connection string (e.g., if your URL ends with <code className="px-1 py-0.5 bg-secondary-100 dark:bg-secondary-700 rounded">/test</code>, enter "test")
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConnectionModal(false);
                                        setConnectionForm({ alias: '', connectionString: '', database: '' });
                                        setError(null);
                                    }}
                                    className="px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <PlusIcon className="w-4 h-4" />
                                            Add Connection
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
