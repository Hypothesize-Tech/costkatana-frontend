import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { linearService } from '../../services/linear.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AlertType, AlertSeverity, LinearTeam, LinearProject } from '../../types/integration.types';

interface LinearIntegrationSetupProps {
    onClose: () => void;
    onComplete: () => void;
}

export const LinearIntegrationSetup: React.FC<LinearIntegrationSetupProps> = ({
    onClose,
    onComplete,
}) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [issueMode, setIssueMode] = useState<'comment' | 'issue'>('comment');
    const [issueId, setIssueId] = useState('');
    const [autoCreateIssues, setAutoCreateIssues] = useState(false);
    const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<AlertType>>(new Set());
    const [selectedSeverities, setSelectedSeverities] = useState<Set<AlertSeverity>>(
        new Set(['high', 'critical'])
    );
    const [integrationId, setIntegrationId] = useState<string | null>(null);
    const [teamsData, setTeamsData] = useState<{ teams: LinearTeam[]; user?: { id: string; name: string; email?: string; active: boolean } } | null>(null);

    const { showNotification } = useNotifications();

    // Validate token and fetch teams when token is entered
    const validateTokenMutation = useMutation(
        async () => {
            if (!accessToken) {
                throw new Error('API token is required');
            }

            const result = await linearService.validateToken(accessToken);

            // Set teams data immediately after getting response
            if (result && result.teams) {
                setTeamsData({ teams: result.teams, user: result.user });
            }

            return result;
        },
        {
            onSuccess: (data) => {
                // Ensure teams data is set
                if (data && data.teams && data.user) {
                    setTeamsData({ teams: data.teams, user: data.user });
                    if (data.teams.length > 0) {
                        showNotification(`Found ${data.teams.length} Linear team(s)`, 'success');
                    } else {
                        showNotification('No teams found for this token', 'warning');
                    }
                }
            },
            onError: (error: Error | { message?: string }) => {
                showNotification((error as Error).message || 'Failed to validate token', 'error');
                setTeamsData(null);
            },
        }
    );

    // Test connection mutation
    const testConnectionMutation = useMutation(
        async () => {
            if (!accessToken || !selectedTeamId) {
                throw new Error('API token and team are required');
            }

            // Create a temporary integration to test
            const tempIntegrationResponse = await integrationService.createIntegration({
                type: 'linear_oauth',
                name: 'Test Connection',
                credentials: {
                    accessToken,
                    teamId: selectedTeamId,
                },
            });

            if (!tempIntegrationResponse.data?.id) {
                throw new Error('Failed to create temporary integration');
            }

            const tempIntegrationId = tempIntegrationResponse.data.id;
            setIntegrationId(tempIntegrationId);

            const result = await integrationService.testIntegration(tempIntegrationId);

            if (!result.success) {
                throw new Error(result.message || 'Connection test failed');
            }

            // Delete temporary integration
            await integrationService.deleteIntegration(tempIntegrationId);
            setIntegrationId(null);

            return result;
        },
        {
            onSuccess: () => {
                showNotification('Linear connection test successful!', 'success');
                setStep(2);
            },
            onError: (error: Error | { message?: string }) => {
                showNotification((error as Error).message || 'Connection test failed', 'error');
                if (integrationId) {
                    integrationService.deleteIntegration(integrationId).catch(console.error);
                    setIntegrationId(null);
                }
            },
        }
    );

    // Fetch teams from existing integration (if integrationId exists)
    const { data: teamsFromIntegration, isLoading: teamsLoading } = useQuery(
        ['linear-teams', integrationId],
        () => {
            if (!integrationId) return [];
            return linearService.getTeams(integrationId);
        },
        {
            enabled: !!integrationId && !!accessToken,
            retry: false,
        }
    );

    // Use teams from validation or from integration
    const teams = teamsData?.teams || teamsFromIntegration || [];
    // Only show loading if we're actively fetching and don't have teams yet
    // Don't show loading if we already have teamsData set (even if mutation is still "loading" due to async state)
    const hasTeams = teamsData?.teams && teamsData.teams.length > 0;
    const teamsLoadingState = (validateTokenMutation.isLoading || teamsLoading) && !hasTeams;

    // Fetch projects when team is selected
    // We need to create a temp integration or fetch directly with token
    const [projects, setProjects] = useState<LinearProject[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    // Fetch projects when team is selected
    useEffect(() => {
        if (selectedTeamId && accessToken && teamsData) {
            setProjectsLoading(true);
            // Create temp integration to fetch projects via API
            const fetchProjects = async () => {
                try {
                    const tempIntegrationResponse = await integrationService.createIntegration({
                        type: 'linear_oauth',
                        name: 'Temp for Projects',
                        credentials: {
                            accessToken,
                            teamId: selectedTeamId,
                        },
                    });

                    if (tempIntegrationResponse.data?.id) {
                        const tempId = tempIntegrationResponse.data.id;
                        const projectsList = await linearService.getProjects(tempId, selectedTeamId);
                        setProjects(projectsList);
                        await integrationService.deleteIntegration(tempId).catch(console.error);
                    }
                } catch (error) {
                    console.error('Failed to fetch projects:', error);
                    setProjects([]);
                } finally {
                    setProjectsLoading(false);
                }
            };
            fetchProjects();
        } else {
            setProjects([]);
        }
    }, [selectedTeamId, accessToken, teamsData]);

    const createMutation = useMutation(
        () =>
            integrationService.createIntegration({
                type: 'linear_oauth',
                name,
                description,
                credentials: {
                    accessToken,
                    teamId: selectedTeamId,
                    projectId: selectedProjectId || undefined,
                    issueId: issueMode === 'comment' ? issueId : undefined,
                },
                alertRouting: Object.fromEntries(
                    Array.from(selectedAlertTypes).map((type) => [
                        type,
                        {
                            enabled: true,
                            severities: Array.from(selectedSeverities),
                        },
                    ])
                ),
                metadata: {
                    autoCreateIssues: issueMode === 'issue' ? autoCreateIssues : false,
                },
            }),
        {
            onSuccess: () => {
                showNotification('Linear integration created successfully!', 'success');
                onComplete();
            },
            onError: () => {
                showNotification('Failed to create Linear integration', 'error');
            },
        }
    );

    const alertTypes: { value: AlertType; label: string }[] = [
        { value: 'cost_threshold', label: 'Cost Threshold Alerts' },
        { value: 'usage_spike', label: 'Usage Spike Alerts' },
        { value: 'optimization_available', label: 'Optimization Opportunities' },
        { value: 'anomaly', label: 'Anomaly Detection' },
        { value: 'system', label: 'System Notifications' },
        { value: 'weekly_summary', label: 'Weekly Summaries' },
        { value: 'monthly_summary', label: 'Monthly Summaries' },
    ];

    const severities: { value: AlertSeverity; label: string; color: string }[] = [
        { value: 'low', label: 'Low', color: '#10B981' },
        { value: 'medium', label: 'Medium', color: '#F59E0B' },
        { value: 'high', label: 'High', color: '#EF4444' },
        { value: 'critical', label: 'Critical', color: '#DC2626' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const toggleAlertType = (type: AlertType) => {
        const newSet = new Set(selectedAlertTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        setSelectedAlertTypes(newSet);
    };

    const toggleSeverity = (severity: AlertSeverity) => {
        const newSet = new Set(selectedSeverities);
        if (newSet.has(severity)) {
            newSet.delete(severity);
        } else {
            newSet.add(severity);
        }
        setSelectedSeverities(newSet);
    };

    // Auto-validate token when it's entered (debounced)
    useEffect(() => {
        if (accessToken && accessToken.length > 20 && step === 1 && !validateTokenMutation.isLoading && !teamsData) {
            const timeoutId = setTimeout(() => {
                validateTokenMutation.mutate();
            }, 1000); // Debounce for 1 second after user stops typing/pasting

            return () => clearTimeout(timeoutId);
        } else if (!accessToken || accessToken.length <= 20) {
            setTeamsData(null);
            setSelectedTeamId('');
            setSelectedProjectId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, step]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (integrationId) {
                integrationService.deleteIntegration(integrationId).catch(console.error);
            }
        };
    }, [integrationId]);

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-5"
            onClick={onClose}
        >
            <div
                className="glass rounded-xl border border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-[700px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-primary-200/20">
                    <div>
                        <h2 className="text-2xl font-display font-bold gradient-text-primary mb-1">
                            Connect Linear
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Step {step} of 4
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Step 1: API Token & Team Setup */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Integration Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Production Cost Alerts"
                                        required
                                        className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional description for this integration"
                                        rows={2}
                                        className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm resize-vertical"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Linear API Token *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={accessToken}
                                            onChange={(e) => setAccessToken(e.target.value)}
                                            onPaste={(e) => {
                                                // Trigger validation immediately on paste
                                                setTimeout(() => {
                                                    const pastedValue = e.clipboardData.getData('text');
                                                    if (pastedValue && pastedValue.length > 20) {
                                                        validateTokenMutation.mutate();
                                                    }
                                                }, 100);
                                            }}
                                            placeholder="lin_api_..."
                                            required
                                            className="flex-1 px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm font-mono"
                                        />
                                        {accessToken && accessToken.length > 10 && (
                                            <button
                                                type="button"
                                                onClick={() => validateTokenMutation.mutate()}
                                                disabled={validateTokenMutation.isLoading}
                                                className="px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                                {validateTokenMutation.isLoading ? 'Validating...' : 'Validate'}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Get your Linear API token from{' '}
                                        <a
                                            href="https://linear.app/settings/api"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                            Linear Settings → API
                                        </a>
                                    </p>
                                    {validateTokenMutation.isError && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded text-sm text-red-700 dark:text-red-300">
                                            {(validateTokenMutation.error as Error)?.message || 'Failed to validate token'}
                                        </div>
                                    )}
                                </div>

                                {accessToken && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Team *
                                        </label>
                                        {teamsLoadingState ? (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading teams...</div>
                                        ) : teams && Array.isArray(teams) && teams.length > 0 ? (
                                            <>
                                                <select
                                                    value={selectedTeamId}
                                                    onChange={(e) => {
                                                        setSelectedTeamId(e.target.value);
                                                        setSelectedProjectId('');
                                                    }}
                                                    required
                                                    className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                                                >
                                                    <option value="">Select a team</option>
                                                    {teams.map((team) => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.name} ({team.key})
                                                        </option>
                                                    ))}
                                                </select>
                                                {teamsData?.user && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        Connected as: {teamsData.user.name} {teamsData.user.email && `(${teamsData.user.email})`}
                                                    </p>
                                                )}
                                            </>
                                        ) : validateTokenMutation.isError ? (
                                            <div className="text-sm text-red-500 dark:text-red-400">
                                                Invalid API token. Please check your token and try again.
                                            </div>
                                        ) : teamsData && teamsData.teams && teamsData.teams.length === 0 ? (
                                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                                No teams found for this token.
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Enter a valid Linear API token to see teams.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTeamId && accessToken && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Project (Optional)
                                        </label>
                                        {projectsLoading ? (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</div>
                                        ) : projects && projects.length > 0 ? (
                                            <select
                                                value={selectedProjectId}
                                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                                className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                                            >
                                                <option value="">No project</option>
                                                {projects.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                No projects found for this team.
                                            </div>
                                        )}
                                    </div>
                                )}


                                {accessToken && selectedTeamId && (
                                    <button
                                        type="button"
                                        onClick={() => testConnectionMutation.mutate()}
                                        disabled={testConnectionMutation.isLoading}
                                        className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {testConnectionMutation.isLoading ? 'Testing...' : 'Test Connection'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Step 2: Issue Mode Selection */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Alert Delivery Mode *
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Choose how alerts should be delivered to Linear
                                    </p>

                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                            <input
                                                type="radio"
                                                name="issueMode"
                                                value="comment"
                                                checked={issueMode === 'comment'}
                                                onChange={(e) => setIssueMode(e.target.value as 'comment' | 'issue')}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    Comment Mode
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Post alerts as comments on an existing Linear issue
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                            <input
                                                type="radio"
                                                name="issueMode"
                                                value="issue"
                                                checked={issueMode === 'issue'}
                                                onChange={(e) => setIssueMode(e.target.value as 'comment' | 'issue')}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    Issue Mode
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Automatically create new Linear issues for alerts
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {issueMode === 'comment' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Linear Issue ID *
                                        </label>
                                        <input
                                            type="text"
                                            value={issueId}
                                            onChange={(e) => setIssueId(e.target.value)}
                                            placeholder="e.g., abc-123 or issue-id"
                                            required
                                            className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Enter the Linear issue ID where alerts should be posted as comments
                                        </p>
                                    </div>
                                )}

                                {issueMode === 'issue' && (
                                    <div className="flex items-center gap-3 p-3.5 border border-primary-200/20 dark:border-primary-200/30 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                        <input
                                            type="checkbox"
                                            checked={autoCreateIssues}
                                            onChange={(e) => setAutoCreateIssues(e.target.checked)}
                                            className="w-[18px] h-[18px] rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                Auto-create issues for alerts
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Automatically create Linear issues when alerts are triggered
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Alert Types */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Select Alert Types
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Choose which types of alerts should be sent to Linear
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {alertTypes.map((type) => (
                                        <label
                                            key={type.value}
                                            className="flex items-center gap-3 p-3.5 border border-primary-200/20 dark:border-primary-200/30 rounded-lg cursor-pointer transition-all bg-white/50 dark:bg-gray-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:border-primary-300/40 dark:hover:border-primary-400/50 hover:shadow-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAlertTypes.has(type.value)}
                                                onChange={() => toggleAlertType(type.value)}
                                                className="w-[18px] h-[18px] rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                {type.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Severities & Summary */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Select Severities
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Choose which severity levels should trigger notifications
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {severities.map((severity) => (
                                            <label
                                                key={severity.value}
                                                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedSeverities.has(severity.value)
                                                    ? 'border-primary-500 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/15 dark:to-primary-800/15 shadow-md shadow-primary-500/20'
                                                    : 'border-primary-200/20 dark:border-primary-200/30 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50 hover:shadow-sm'
                                                    } hover:-translate-y-0.5`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSeverities.has(severity.value)}
                                                    onChange={() => toggleSeverity(severity.value)}
                                                    className="hidden"
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: severity.color }}
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {severity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="glass rounded-xl border border-primary-200/20 dark:border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/8 dark:to-primary-800/8 p-5">
                                    <h4 className="text-base font-display font-bold gradient-text-primary mb-4">
                                        Configuration Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {issueMode === 'comment' ? 'Comment Mode' : 'Issue Mode'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Alert Types:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {selectedAlertTypes.size || 'None selected'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Severities:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {Array.from(selectedSeverities).join(', ') || 'None selected'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-primary-200/20">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/80 dark:bg-gray-800/80 text-primary-600 dark:text-primary-400 border border-primary-200/30 dark:border-primary-200/40 hover:bg-primary-50/90 dark:hover:bg-primary-900/30 hover:border-primary-300/50 dark:hover:border-primary-400/60 transition-all"
                            >
                                Back
                            </button>
                        )}
                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    (step === 1 && (!name || !accessToken || !selectedTeamId)) ||
                                    (step === 2 && issueMode === 'comment' && !issueId) ||
                                    (step === 2 && issueMode === 'issue' && !autoCreateIssues)
                                }
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={createMutation.isLoading || selectedAlertTypes.size === 0}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                            >
                                {createMutation.isLoading ? 'Creating...' : 'Create Integration'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

