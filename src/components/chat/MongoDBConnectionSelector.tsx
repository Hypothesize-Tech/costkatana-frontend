import React from 'react';
import { CheckIcon, CircleStackIcon } from '@heroicons/react/24/outline';

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

interface MongoDBConnectionSelectorProps {
    connections: MongoDBConnection[];
    selectedConnection: MongoDBConnection | null;
    onSelectConnection: (connection: MongoDBConnection) => void;
}

export const MongoDBConnectionSelector: React.FC<MongoDBConnectionSelectorProps> = ({
    connections,
    selectedConnection,
    onSelectConnection,
}) => {
    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-secondary-900 dark:text-white text-sm">
                Select MongoDB Connection
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connections.map((connection) => (
                    <button
                        key={connection._id}
                        onClick={() => onSelectConnection(connection)}
                        className={`relative p-4 rounded-lg border-2 text-left transition-all ${selectedConnection?._id === connection._id
                                ? 'border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/20'
                                : 'border-primary-200/30 dark:border-primary-500/20 hover:border-primary-400 dark:hover:border-primary-500 bg-white/50 dark:bg-secondary-800/30'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connection.isActive
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                    : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                                }`}>
                                <CircleStackIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-secondary-900 dark:text-white truncate">
                                        {connection.alias}
                                    </h5>
                                    {selectedConnection?._id === connection._id && (
                                        <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                    )}
                                </div>

                                {connection.metadata?.database && (
                                    <p className="text-xs text-secondary-600 dark:text-secondary-400 truncate mb-1">
                                        Database: {connection.metadata.database}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${connection.isActive
                                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${connection.isActive ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />
                                        {connection.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {connections.length === 0 && (
                <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                    No connections available
                </div>
            )}
        </div>
    );
};
