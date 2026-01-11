import React, { useState } from 'react';
import {
    Github,
    ExternalLink,
    Copy,
    Check,
    Code2,
    GitBranch,
    Globe,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

interface GitHubRepoCardProps {
    repoUrl: string;
    repoName?: string;
    owner?: string;
    description?: string;
    className?: string;
}

export const GitHubRepoCard: React.FC<GitHubRepoCardProps> = ({
    repoUrl,
    repoName,
    owner,
    description,
    className = ''
}) => {
    const [copied, setCopied] = useState(false);

    // Extract repo info from URL if not provided
    const extractedInfo = React.useMemo(() => {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return {
                owner: owner || match[1],
                name: repoName || match[2]
            };
        }
        return {
            owner: owner || 'unknown',
            name: repoName || 'repository'
        };
    }, [repoUrl, repoName, owner]);

    const cloneCommand = `git clone ${repoUrl}.git`;

    const handleCopyClone = async () => {
        try {
            await navigator.clipboard.writeText(cloneCommand);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    const handleOpenInVSCode = () => {
        // Open in github.dev (VS Code in browser)
        // Convert github.com URL to github.dev URL
        const githubDevUrl = repoUrl.replace('github.com', 'github.dev');
        window.open(githubDevUrl, '_blank');
    };

    const handleOpenCodespace = () => {
        // Open in GitHub Codespaces
        // Extract owner and repo from URL
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            const [, owner, repo] = match;
            // Open Codespaces creation page for this repo
            const codespaceUrl = `https://github.com/codespaces/new?repo=${owner}/${repo}`;
            window.open(codespaceUrl, '_blank');
        }
    };

    return (
        <div className={`relative group ${className}`}>
            <div className="bg-gradient-to-br from-dark-panel/95 to-dark-bg-100/95 backdrop-blur-xl rounded-xl border border-primary-500/20 
                          shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all duration-300 overflow-hidden">
                {/* Header with GitHub branding - matching app theme */}
                <div className="bg-gradient-to-r from-primary-500/10 via-transparent to-highlight-500/10 p-4 border-b border-primary-500/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary-500/20 to-highlight-500/20 rounded-xl border border-primary-500/30">
                                <Github className="w-6 h-6 text-primary-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary-400 text-sm font-medium">{extractedInfo.owner}</span>
                                    <span className="text-primary-500/50">/</span>
                                    <span className="text-white font-bold">{extractedInfo.name}</span>
                                </div>
                                {description && (
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-primary-500/10 rounded-full border border-primary-500/30">
                            <GitBranch className="w-3 h-3 text-primary-500" />
                            <span className="text-xs text-primary-400 font-medium">main</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3 bg-dark-bg-100/50">
                    {/* Clone command - Terminal style */}
                    <div className="relative group/cmd">
                        <div className="flex items-center gap-2 p-3 bg-black rounded-lg border border-primary-500/20 
                                      font-mono text-xs text-gray-300 hover:border-primary-500/40 transition-all duration-200">
                            <span className="text-primary-500 select-none">$</span>
                            <span className="flex-1 truncate select-all">{cloneCommand}</span>
                            <button
                                onClick={handleCopyClone}
                                className="p-1.5 hover:bg-primary-500/10 rounded transition-all duration-200"
                                title="Copy clone command"
                            >
                                {copied ? (
                                    <Check size={14} className="text-primary-500" />
                                ) : (
                                    <Copy size={14} className="text-gray-400 hover:text-primary-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                     bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
                                     text-white font-medium rounded-lg transition-all duration-200 
                                     shadow-lg hover:shadow-primary-500/25"
                        >
                            <ExternalLink size={16} />
                            View on GitHub
                        </a>
                        <button
                            onClick={handleOpenInVSCode}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 
                                     bg-highlight-500/10 hover:bg-highlight-500/20 
                                     text-highlight-500 font-medium rounded-lg transition-all duration-200 
                                     border border-highlight-500/30 hover:border-highlight-500/50"
                            title="Open in github.dev (VS Code in browser)"
                        >
                            <Code2 size={16} />
                            <span className="hidden sm:inline">github.dev</span>
                            <span className="sm:hidden">Code</span>
                        </button>
                        <button
                            onClick={handleOpenCodespace}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 
                                     bg-accent-500/10 hover:bg-accent-500/20 
                                     text-accent-500 font-medium rounded-lg transition-all duration-200 
                                     border border-accent-500/30 hover:border-accent-500/50"
                            title="Open in GitHub Codespaces"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" />
                            </svg>
                            <span className="hidden sm:inline">Codespaces</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface VercelDeploymentCardProps {
    deploymentUrl: string;
    projectName?: string;
    teamName?: string;
    status?: 'ready' | 'building' | 'error' | 'queued';
    className?: string;
}

export const VercelDeploymentCard: React.FC<VercelDeploymentCardProps> = ({
    deploymentUrl,
    projectName,
    teamName,
    status = 'ready',
    className = ''
}) => {
    // Construct Vercel dashboard URL
    const vercelDashboardUrl = React.useMemo(() => {
        if (teamName && projectName) {
            return `https://vercel.com/${teamName}/${projectName}`;
        }
        // Fallback to generic Vercel dashboard
        return 'https://vercel.com/dashboard';
    }, [teamName, projectName]);

    const getStatusIcon = () => {
        switch (status) {
            case 'ready':
                return <CheckCircle className="w-4 h-4 text-success-500" />;
            case 'building':
                return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-danger-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'ready':
                return 'Live';
            case 'building':
                return 'Building...';
            case 'error':
                return 'Error';
            case 'queued':
                return 'Queued';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'ready':
                return 'text-success-500 bg-success-500/10 border-success-500/30';
            case 'building':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'error':
                return 'text-danger-500 bg-danger-500/10 border-danger-500/30';
            default:
                return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
        }
    };

    // Extract domain from URL
    const domain = React.useMemo(() => {
        try {
            const url = new URL(deploymentUrl);
            return url.hostname;
        } catch {
            return deploymentUrl;
        }
    }, [deploymentUrl]);

    return (
        <div className={`relative group ${className}`}>
            <div className="bg-gradient-to-br from-dark-panel/95 to-dark-bg-100/95 backdrop-blur-xl rounded-xl border border-primary-500/20 
                          shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all duration-300 overflow-hidden">
                {/* Header with Vercel branding - matching app theme */}
                <div className="bg-gradient-to-r from-primary-500/10 via-transparent to-highlight-500/10 p-4 border-b border-primary-500/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-white/90 to-gray-100 rounded-xl border border-primary-500/30">
                                {/* Vercel Logo Triangle */}
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                                    <path d="M12 2L2 19.5h20z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-bold">
                                    {projectName || 'Vercel Deployment'}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Globe className="w-3 h-3 text-primary-400" />
                                    <span className="text-primary-400 text-sm truncate max-w-xs" title={domain}>
                                        {domain}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm ${getStatusColor()}`}>
                            {getStatusIcon()}
                            <span className="text-xs font-medium">{getStatusText()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-dark-bg-100/50">
                    <div className="flex gap-2">
                        <a
                            href={deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                     bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
                                     text-white font-medium rounded-lg transition-all duration-200 
                                     shadow-lg hover:shadow-primary-500/25"
                        >
                            <ExternalLink size={16} />
                            Visit Site
                        </a>
                        <a
                            href={vercelDashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 
                                     bg-highlight-500/10 hover:bg-highlight-500/20 
                                     text-highlight-500 font-medium rounded-lg transition-all duration-200 
                                     border border-highlight-500/30 hover:border-highlight-500/50"
                            title={`View on Vercel${teamName ? ` (${teamName}/${projectName})` : ''}`}
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};