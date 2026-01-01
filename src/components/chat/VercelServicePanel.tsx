import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    RocketLaunchIcon,
    ServerIcon,
} from '@heroicons/react/24/outline';
import vercelService, { VercelConnection, VercelProject } from '../../services/vercel.service';

interface VercelServicePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper function outside component to get status color
const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-600 dark:text-gray-400';

    switch (status.toUpperCase()) {
        case 'READY':
            return 'text-green-600 dark:text-green-400';
        case 'ERROR':
            return 'text-red-600 dark:text-red-400';
        case 'BUILDING':
            return 'text-blue-600 dark:text-blue-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

export const VercelServicePanel: React.FC<VercelServicePanelProps> = ({
    isOpen,
    onClose
}) => {
    const [connection, setConnection] = useState<VercelConnection | null>(null);
    const [projects, setProjects] = useState<VercelProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadConnectionAndProjects();
        }
    }, [isOpen]);

    const loadConnectionAndProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const connections = await vercelService.listConnections();
            if (connections.length > 0 && connections[0].isActive) {
                const conn = connections[0];
                setConnection(conn);

                // Load projects for this connection
                const projectsList = await vercelService.getProjects(conn._id);
                setProjects(projectsList);
            }
        } catch (err: unknown) {
            console.error('Failed to load Vercel data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load Vercel data');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl h-[80vh] glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 19.5h20L12 2z" />
                        </svg>
                        <h2 className="text-xl font-display font-bold gradient-text-primary">
                            Vercel Projects
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={loadConnectionAndProjects}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : !connection ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                                    No Vercel connection found
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Connection Info */}
                            <div className="glass rounded-xl p-4 border border-primary-200/30 dark:border-primary-500/20">
                                <div className="flex items-center gap-3">
                                    {connection.avatarUrl && (
                                        <img
                                            src={connection.avatarUrl}
                                            alt={connection.vercelUsername}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="font-semibold text-secondary-900 dark:text-white">
                                            {connection.vercelUsername}
                                        </p>
                                        {connection.team?.name && (
                                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                                Team: {connection.team.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Projects Grid */}
                            <div>
                                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                                    Projects ({projects.length})
                                </h3>
                                {projects.length === 0 ? (
                                    <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                                        No projects found
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {projects.map((project) => (
                                            <div
                                                key={project.id}
                                                className="glass rounded-xl p-4 border border-primary-200/30 dark:border-primary-500/20 hover:border-primary-400/50 dark:hover:border-primary-400/30 transition-all cursor-pointer group"
                                                onClick={() => window.open(`https://vercel.com/${connection.team?.slug || connection.vercelUsername}/${project.name}`, '_blank')}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                            {project.name}
                                                        </h4>
                                                        {project.framework && (
                                                            <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                                                {project.framework}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <RocketLaunchIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-secondary-600 dark:text-secondary-400">
                                                    <div className="flex items-center gap-1">
                                                        <ServerIcon className="w-4 h-4" />
                                                        <span>{project.targets?.production?.url || project.latestDeployment?.url || 'No domain'}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-primary-200/30 dark:border-primary-500/20">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-secondary-600 dark:text-secondary-400">
                                                            Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        {project.latestDeployment?.state && (
                                                            <span className={`font-medium ${getStatusColor(project.latestDeployment.state)}`}>
                                                                {project.latestDeployment.state}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
