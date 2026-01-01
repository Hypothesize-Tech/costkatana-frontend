import React, { useState, useEffect } from 'react';
import { Loader, Search, ExternalLink, RefreshCw, Triangle } from 'lucide-react';
import vercelService, { VercelProject, VercelConnection } from '../../services/vercel.service';

interface VercelProjectSelectorProps {
    connectionId: string;
    onSelect: (project: VercelProject) => void;
    selectedProjectId?: string;
}

const VercelProjectSelector: React.FC<VercelProjectSelectorProps> = ({
    connectionId,
    onSelect,
    selectedProjectId
}) => {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<VercelProject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, [connectionId]);

    const loadProjects = async (refresh = false) => {
        try {
            setLoading(true);
            setError(null);
            const projectList = await vercelService.getProjects(connectionId, refresh);
            setProjects(projectList);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (state?: string) => {
        if (!state) return null;
        switch (state) {
            case 'READY':
                return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
            case 'BUILDING':
            case 'INITIALIZING':
            case 'QUEUED':
                return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400';
            default:
                return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400';
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Refresh */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-muted dark:text-dark-text-muted" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                </div>
                <button
                    onClick={() => loadProjects(true)}
                    disabled={loading}
                    className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                    title="Refresh projects"
                >
                    <RefreshCw className={`w-4 h-4 text-light-text-muted dark:text-dark-text-muted ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Project List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {loading && projects.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                        {searchQuery ? 'No projects match your search' : 'No projects found'}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => onSelect(project)}
                            className={`w-full p-3 border rounded-lg text-left transition-all ${
                                selectedProjectId === project.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-black dark:bg-white rounded">
                                        <Triangle className="w-3 h-3 text-white dark:text-black fill-current" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary">
                                                {project.name}
                                            </span>
                                            {project.latestDeployment && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadge(project.latestDeployment.state)}`}>
                                                    {project.latestDeployment.state}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {project.framework && (
                                                <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                                    {project.framework}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {project.targets?.production?.url && (
                                    <a
                                        href={`https://${project.targets.production.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
                                    </a>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default VercelProjectSelector;
