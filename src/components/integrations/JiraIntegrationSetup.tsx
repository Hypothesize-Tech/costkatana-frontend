import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { jiraService } from '../../services/jira.service';
import { apiClient } from '@/config/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AlertType, AlertSeverity, JiraProject, Integration } from '../../types/integration.types';

interface JiraIntegrationSetupProps {
    onClose: () => void;
    onComplete: () => void;
}

export const JiraIntegrationSetup: React.FC<JiraIntegrationSetupProps> = ({
    onClose,
    onComplete,
}) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [selectedProjectKey, setSelectedProjectKey] = useState('');
    const [selectedIssueTypeId, setSelectedIssueTypeId] = useState('');
    const [selectedPriorityId, setSelectedPriorityId] = useState('');
    const [issueMode, setIssueMode] = useState<'comment' | 'issue'>('comment');
    const [issueKey, setIssueKey] = useState('');
    const [autoCreateIssues, setAutoCreateIssues] = useState(false);
    const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<AlertType>>(new Set());
    const [selectedSeverities, setSelectedSeverities] = useState<Set<AlertSeverity>>(
        new Set(['high', 'critical'])
    );
    const [integrationId, setIntegrationId] = useState<string | null>(null);
    const [projectsData, setProjectsData] = useState<{ projects: JiraProject[]; user?: { accountId: string; displayName: string; emailAddress?: string; active: boolean } } | null>(null);
    const [useOAuth, setUseOAuth] = useState(true);

    const { showNotification } = useNotifications();

    // OAuth flow initiation
    const initiateOAuthMutation = useMutation(
        async () => {
            const response = await apiClient.get('/integrations/jira/auth');
            return response.data.data;
        },
        {
            onSuccess: (data: { authUrl?: string }) => {
                if (data?.authUrl) {
                    window.location.href = data.authUrl;
                }
            },
            onError: (error: unknown) => {
                const errorMessage = error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data?.message || 'Failed to initiate JIRA OAuth'
                    : 'Failed to initiate JIRA OAuth';
                showNotification(errorMessage, 'error');
            }
        }
    );

    // Validate token and fetch projects when token is entered (for manual token entry)
    const validateTokenMutation = useMutation(
        async () => {
            if (!accessToken || !siteUrl) {
                throw new Error('Access token and site URL are required');
            }

            const result = await jiraService.validateToken(accessToken, siteUrl);

            // Set projects data immediately after getting response
            if (result && result.projects) {
                setProjectsData({ projects: result.projects, user: result.user });
            }

            return result;
        },
        {
            onSuccess: (data) => {
                // Ensure projects data is set
                if (data && data.projects && data.user) {
                    setProjectsData({ projects: data.projects, user: data.user });
                    if (data.projects.length > 0) {
                        showNotification(`Found ${data.projects.length} JIRA project(s)`, 'success');
                    } else {
                        showNotification('No projects found for this token', 'warning');
                    }
                }
            },
            onError: (error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : 'Failed to validate token';
                showNotification(errorMessage, 'error');
                setProjectsData(null);
            },
        }
    );

    // Test connection mutation
    const testConnectionMutation = useMutation(
        async () => {
            if (!accessToken || !selectedProjectKey || !siteUrl) {
                throw new Error('Access token, site URL, and project are required');
            }

            // Create a temporary integration to test
            const tempIntegrationResponse = await integrationService.createIntegration({
                type: 'jira_oauth',
                name: 'Test Connection',
                credentials: {
                    accessToken,
                    siteUrl,
                    projectKey: selectedProjectKey,
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
                showNotification('JIRA connection test successful!', 'success');
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

    // Create temp integration for manual token to fetch issue types and priorities
    useEffect(() => {
        if (!useOAuth && accessToken && siteUrl && selectedProjectKey && !integrationId) {
            const createTempIntegration = async () => {
                try {
                    const tempIntegrationResponse = await integrationService.createIntegration({
                        type: 'jira_oauth',
                        name: 'Temp for Config',
                        credentials: {
                            accessToken,
                            siteUrl,
                            projectKey: selectedProjectKey,
                        },
                    });

                    if (tempIntegrationResponse.data?.id) {
                        setIntegrationId(tempIntegrationResponse.data.id);
                    }
                } catch (error) {
                    console.error('Failed to create temp integration:', error);
                }
            };
            createTempIntegration();
        }
    }, [useOAuth, accessToken, siteUrl, selectedProjectKey, integrationId]);

    // Fetch issue types when project is selected
    const { data: issueTypes, isLoading: issueTypesLoading } = useQuery(
        ['jira-issue-types', integrationId, selectedProjectKey],
        () => {
            if (!integrationId || !selectedProjectKey) return [];
            return jiraService.getIssueTypes(integrationId, selectedProjectKey);
        },
        {
            enabled: !!integrationId && !!selectedProjectKey,
            retry: false,
        }
    );

    // Fetch priorities when integration is available
    const { data: priorities, isLoading: prioritiesLoading } = useQuery(
        ['jira-priorities', integrationId],
        () => {
            if (!integrationId) return [];
            return jiraService.getPriorities(integrationId);
        },
        {
            enabled: !!integrationId,
            retry: false,
        }
    );

    // Use projects from validation or create temp integration to fetch
    const projects = projectsData?.projects || [];
    const hasProjects = projectsData?.projects && projectsData.projects.length > 0;
    const projectsLoadingState = validateTokenMutation.isLoading && !hasProjects;

    // Fetch projects when integrationId exists (from OAuth flow)
    const { data: projectsFromIntegration } = useQuery(
        ['jira-projects', integrationId],
        () => {
            if (!integrationId) return [];
            return jiraService.getProjects(integrationId);
        },
        {
            enabled: !!integrationId && useOAuth,
            retry: false,
        }
    );

    // Update projects when fetched from OAuth integration
    useEffect(() => {
        if (projectsFromIntegration && projectsFromIntegration.length > 0) {
            setProjectsData({ projects: projectsFromIntegration });
            if (!selectedProjectKey && projectsFromIntegration.length > 0) {
                setSelectedProjectKey(projectsFromIntegration[0].key);
            }
        }
    }, [projectsFromIntegration, selectedProjectKey]);

    // If OAuth flow completed, we should have integrationId from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const integrationIdParam = urlParams.get('integrationId');
        if (integrationIdParam) {
            setIntegrationId(integrationIdParam);
            setUseOAuth(true);
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    // Fetch existing integration if OAuth flow created one
    const { data: existingIntegration } = useQuery(
        ['integration', integrationId],
        () => integrationService.getIntegration(integrationId!),
        {
            enabled: !!integrationId && useOAuth,
            retry: false,
        }
    );

    // Update form when existing integration loads
    useEffect(() => {
        if (existingIntegration?.data && useOAuth) {
            const integration = existingIntegration.data as Integration;
            if (!name) setName(integration.name || '');
            if (!description) setDescription(integration.description || '');
            if (!selectedProjectKey && integration.credentials?.projectKey) {
                setSelectedProjectKey(integration.credentials.projectKey);
            }
        }
    }, [existingIntegration, useOAuth, name, description, selectedProjectKey]);

    const createMutation = useMutation(
        async () => {
            // If OAuth flow created integration, update it; otherwise create new
            if (integrationId && useOAuth) {
                // Get current integration to merge credentials properly
                const currentIntegration = await integrationService.getIntegration(integrationId);
                const currentData = currentIntegration?.data as Integration;
                const currentCredentials = currentData?.credentials || {};

                // Update existing OAuth integration - merge with existing credentials
                const updatedCredentials: Record<string, unknown> = {
                    ...currentCredentials,
                    projectKey: selectedProjectKey,
                };

                if (issueMode === 'issue') {
                    updatedCredentials.issueTypeId = selectedIssueTypeId;
                    if (selectedPriorityId) {
                        updatedCredentials.priorityId = selectedPriorityId;
                    }
                    // Remove issueKey if switching from comment mode
                    delete updatedCredentials.issueKey;
                } else {
                    updatedCredentials.issueKey = issueKey;
                    // Remove issue creation fields if switching from issue mode
                    delete updatedCredentials.issueTypeId;
                    delete updatedCredentials.priorityId;
                }

                const updateData = {
                    name,
                    description,
                    credentials: updatedCredentials,
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
                        ...(currentData?.metadata ?? {}),
                        autoCreateIssues: issueMode === 'issue' ? autoCreateIssues : false,
                    },
                };

                // Update via PUT - backend controller handles metadata
                const response = await apiClient.put(`/integrations/${integrationId}`, updateData);
                return response.data;
            } else {
                // Create new integration
                return await integrationService.createIntegration({
                    type: 'jira_oauth',
                    name,
                    description,
                    credentials: {
                        accessToken,
                        siteUrl: siteUrl || undefined,
                        projectKey: selectedProjectKey,
                        issueTypeId: issueMode === 'issue' ? selectedIssueTypeId : undefined,
                        priorityId: selectedPriorityId || undefined,
                        issueKey: issueMode === 'comment' ? issueKey : undefined,
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
                });
            }
        },
        {
            onSuccess: () => {
                showNotification('JIRA integration created successfully!', 'success');
                onComplete();
            },
            onError: () => {
                showNotification('Failed to create JIRA integration', 'error');
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
                        <h2 className="mb-1 text-2xl font-bold font-display gradient-text-primary">
                            Connect JIRA
                        </h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Step {step} of 4
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Step 1: Connection Setup */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Integration Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Production Cost Alerts"
                                        required
                                        className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional description for this integration"
                                        rows={2}
                                        className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 resize-vertical"
                                    />
                                </div>

                                {/* OAuth vs Manual Token */}
                                <div className="space-y-3">
                                    <label className="flex gap-3 items-center p-4 rounded-xl border-2 transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                        <input
                                            type="radio"
                                            name="authMethod"
                                            value="oauth"
                                            checked={useOAuth}
                                            onChange={() => setUseOAuth(true)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                OAuth (Recommended)
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Connect using JIRA OAuth - secure and easy
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex gap-3 items-start p-4 rounded-xl border-2 transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                        <input
                                            type="radio"
                                            name="authMethod"
                                            value="token"
                                            checked={!useOAuth}
                                            onChange={() => setUseOAuth(false)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                API Token
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Use JIRA API token manually
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {useOAuth ? (
                                    <button
                                        type="button"
                                        onClick={() => initiateOAuthMutation.mutate()}
                                        disabled={initiateOAuthMutation.isLoading || !name}
                                        className="px-5 py-3 w-full text-sm font-semibold text-white rounded-lg shadow-lg transition-all bg-gradient-primary shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {initiateOAuthMutation.isLoading ? 'Connecting...' : 'Connect with JIRA'}
                                    </button>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                JIRA Site URL *
                                            </label>
                                            <input
                                                type="text"
                                                value={siteUrl}
                                                onChange={(e) => setSiteUrl(e.target.value)}
                                                placeholder="https://your-domain.atlassian.net"
                                                required={!useOAuth}
                                                className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                            />
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Your JIRA site URL is the base URL of your JIRA instance.
                                                <br />
                                                • For JIRA Cloud: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">https://your-domain.atlassian.net</code>
                                                <br />
                                                • You can find it in your browser's address bar when logged into JIRA
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                JIRA API Token *
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    value={accessToken}
                                                    onChange={(e) => setAccessToken(e.target.value)}
                                                    placeholder="Enter your JIRA API token"
                                                    required={!useOAuth}
                                                    className="flex-1 px-4 py-3 font-mono text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                                />
                                                {accessToken && siteUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => validateTokenMutation.mutate()}
                                                        disabled={validateTokenMutation.isLoading}
                                                        className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap rounded-lg shadow-lg transition-all bg-gradient-primary shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {validateTokenMutation.isLoading ? 'Validating...' : 'Validate'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-3 mt-2 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                                                <p className="mb-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                                                    How to get your JIRA API Token:
                                                </p>
                                                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-decimal list-inside">
                                                    <li>Go to{' '}
                                                        <a
                                                            href="https://id.atlassian.com/manage-profile/security/api-tokens"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            Atlassian Account Settings → API Tokens
                                                        </a>
                                                    </li>
                                                    <li>Click <strong>"Create API token"</strong></li>
                                                    <li>Give it a label (e.g., "CostKatana Integration")</li>
                                                    <li>Click <strong>"Create"</strong> and copy the token</li>
                                                    <li>Paste it here (you won't be able to see it again!)</li>
                                                </ol>
                                                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                                    <strong>Note:</strong> Use your JIRA account email and this API token for authentication.
                                                </p>
                                            </div>
                                        </div>

                                        {projectsLoadingState ? (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</div>
                                        ) : (projects && projects.length > 0) || (projectsFromIntegration && projectsFromIntegration.length > 0) ? (
                                            <>
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                        Project *
                                                    </label>
                                                    <select
                                                        value={selectedProjectKey}
                                                        onChange={(e) => {
                                                            setSelectedProjectKey(e.target.value);
                                                            setSelectedIssueTypeId('');
                                                        }}
                                                        required
                                                        className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                                    >
                                                        <option value="">Select a project</option>
                                                        {(projects.length > 0 ? projects : projectsFromIntegration || []).map((project) => (
                                                            <option key={project.id} value={project.key}>
                                                                {project.name} ({project.key})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {projectsData?.user && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Connected as: {projectsData.user.displayName} {projectsData.user.emailAddress && `(${projectsData.user.emailAddress})`}
                                                    </p>
                                                )}
                                            </>
                                        ) : validateTokenMutation.isError ? (
                                            <div className="text-sm text-red-500 dark:text-red-400">
                                                Invalid API token or site URL. Please check and try again.
                                            </div>
                                        ) : null}

                                        {accessToken && siteUrl && selectedProjectKey && (
                                            <button
                                                type="button"
                                                onClick={() => testConnectionMutation.mutate()}
                                                disabled={testConnectionMutation.isLoading}
                                                className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {testConnectionMutation.isLoading ? 'Testing...' : 'Test Connection'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 2: Issue Mode Selection */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Alert Delivery Mode *
                                    </label>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Choose how alerts should be delivered to JIRA
                                    </p>

                                    <div className="space-y-3">
                                        <label className="flex gap-3 items-start p-4 rounded-xl border-2 transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                            <input
                                                type="radio"
                                                name="issueMode"
                                                value="comment"
                                                checked={issueMode === 'comment'}
                                                onChange={(e) => setIssueMode(e.target.value as 'comment' | 'issue')}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                    Comment Mode
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Post alerts as comments on an existing JIRA issue
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex gap-3 items-start p-4 rounded-xl border-2 transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:border-primary-300/40 dark:hover:border-primary-400/50">
                                            <input
                                                type="radio"
                                                name="issueMode"
                                                value="issue"
                                                checked={issueMode === 'issue'}
                                                onChange={(e) => setIssueMode(e.target.value as 'comment' | 'issue')}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                    Issue Mode
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Automatically create new JIRA issues for alerts
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {issueMode === 'comment' && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            JIRA Issue Key *
                                        </label>
                                        <input
                                            type="text"
                                            value={issueKey}
                                            onChange={(e) => setIssueKey(e.target.value)}
                                            placeholder="e.g., PROJ-123"
                                            required
                                            className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                        />
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Enter the JIRA issue key where alerts should be posted as comments
                                        </p>
                                    </div>
                                )}

                                {issueMode === 'issue' && (
                                    <>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                Issue Type *
                                            </label>
                                            {issueTypesLoading ? (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Loading issue types...</div>
                                            ) : issueTypes && issueTypes.length > 0 ? (
                                                <select
                                                    value={selectedIssueTypeId}
                                                    onChange={(e) => setSelectedIssueTypeId(e.target.value)}
                                                    required
                                                    className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                                >
                                                    <option value="">Select an issue type</option>
                                                    {issueTypes.map((type) => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Select a project first to see issue types
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                Priority (Optional)
                                            </label>
                                            {prioritiesLoading ? (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Loading priorities...</div>
                                            ) : priorities && priorities.length > 0 ? (
                                                <select
                                                    value={selectedPriorityId}
                                                    onChange={(e) => setSelectedPriorityId(e.target.value)}
                                                    className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border shadow-sm transition-all border-primary-200/30 dark:border-primary-200/20 bg-white/90 dark:bg-gray-800/90 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                                                >
                                                    <option value="">No priority</option>
                                                    {priorities.map((priority) => (
                                                        <option key={priority.id} value={priority.id}>
                                                            {priority.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : null}
                                        </div>

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
                                                    Automatically create JIRA issues when alerts are triggered
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Alert Types */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Select Alert Types
                                    </label>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Choose which types of alerts should be sent to JIRA
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
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
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
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Select Severities
                                    </label>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
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
                                <div className="p-5 bg-gradient-to-br rounded-xl border glass border-primary-200/20 dark:border-primary-200/30 from-primary-50/30 to-primary-100/30 dark:from-primary-900/8 dark:to-primary-800/8">
                                    <h4 className="mb-4 text-base font-bold font-display gradient-text-primary">
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
                    <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-primary-200/20">
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
                                    (step === 1 && (!name || (useOAuth && !integrationId) || (!useOAuth && (!accessToken || !siteUrl || !selectedProjectKey)))) ||
                                    (step === 2 && issueMode === 'comment' && !issueKey) ||
                                    (step === 2 && issueMode === 'issue' && (!selectedIssueTypeId || !autoCreateIssues))
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

