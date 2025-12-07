import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShieldCheckIcon,
    ArrowLeftIcon,
    CpuChipIcon,
    ChartBarIcon,
    ClockIcon,
    DocumentTextIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    CogIcon,
} from '@heroicons/react/24/outline';
import {
    agentGovernanceService,
    AgentIdentity,
    AgentDecision,
    AgentExecution,
} from '../services/agentGovernance.service';
import { AgentDetailShimmer } from '../components/shimmer/AgentGovernanceShimmer';
import { useToast } from '../hooks/useToast';

type TabType = 'overview' | 'decisions' | 'executions' | 'rate-limits' | 'settings';

export const AgentDetail: React.FC = () => {
    const { agentId, tab } = useParams<{ agentId: string; tab?: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const activeTab = (tab as TabType) || 'overview';
    const [agent, setAgent] = useState<AgentIdentity | null>(null);
    const [decisions, setDecisions] = useState<AgentDecision[]>([]);
    const [executions, setExecutions] = useState<AgentExecution[]>([]);
    const [rateLimits, setRateLimits] = useState<Record<string, unknown> | null>(null);
    const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);

    const fetchAgentData = useCallback(async () => {
        if (!agentId) return;

        try {
            setLoading(true);

            // Fetch agent first (required)
            const agentRes = await agentGovernanceService.getAgent(agentId);

            // Extract agent data - handle different response structures
            const agentData = agentRes?.data?.identity || agentRes?.identity || agentRes?.data?.agent || agentRes?.agent || agentRes;

            if (!agentData || !agentData.agentId) {
                console.error('Invalid agent data:', agentRes);
                showToast('Agent not found', 'error');
                setLoading(false);
                return;
            }

            setAgent(agentData);

            // Fetch optional data in parallel (don't fail if these fail)
            try {
                const [decisionsRes, executionsRes, rateLimitsRes, analyticsRes] = await Promise.allSettled([
                    agentGovernanceService.getAgentDecisions(agentId, { limit: 50 }),
                    agentGovernanceService.getAgentExecutions(agentId, { limit: 50 }),
                    agentGovernanceService.getAgentRateLimits(agentId),
                    agentGovernanceService.getAgentAnalytics(agentId),
                ]);

                if (decisionsRes.status === 'fulfilled') {
                    const res = decisionsRes.value;
                    setDecisions(res?.data?.decisions || res?.decisions || []);
                }

                if (executionsRes.status === 'fulfilled') {
                    const res = executionsRes.value;
                    setExecutions(res?.data?.executions || res?.executions || []);
                }

                if (rateLimitsRes.status === 'fulfilled') {
                    const res = rateLimitsRes.value;
                    setRateLimits(res?.data?.rateLimits || res?.data || res || null);
                }

                if (analyticsRes.status === 'fulfilled') {
                    const res = analyticsRes.value;
                    setAnalytics(res?.data || res || null);
                }
            } catch (optionalError) {
                console.warn('Some optional data failed to load:', optionalError);
                // Continue anyway - we have the agent data
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching agent data:', error);
            showToast(`Failed to load agent details: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [agentId, showToast]);

    useEffect(() => {
        if (agentId) {
            fetchAgentData();
        }
    }, [agentId, fetchAgentData]);


    const handleRevoke = async () => {
        if (!agentId || !window.confirm('Are you sure you want to revoke this agent?')) return;

        try {
            await agentGovernanceService.revokeAgent(agentId, 'Revoked by user');
            showToast('Agent revoked successfully', 'success');
            navigate('/agent-governance');
        } catch (error) {
            showToast('Failed to revoke agent', 'error');
        }
    };

    const handleKillSwitch = async () => {
        if (
            !agentId ||
            !window.confirm(
                'EMERGENCY KILL SWITCH: This will immediately revoke the agent and terminate all its executions. Are you absolutely sure?'
            )
        )
            return;

        try {
            await agentGovernanceService.emergencyKillSwitch(agentId, 'Emergency kill-switch activated by user');
            showToast('Emergency kill-switch activated successfully', 'success');
            navigate('/agent-governance');
        } catch (error) {
            showToast('Failed to activate kill-switch', 'error');
        }
    };

    if (loading) {
        return <AgentDetailShimmer />;
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <button
                        onClick={() => navigate('/agent-governance')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Back to Agents</span>
                    </button>
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                        <ShieldCheckIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-2">
                            Agent Not Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The agent you're looking for doesn't exist or you don't have permission to view it.
                        </p>
                        <button
                            onClick={() => navigate('/agent-governance')}
                            className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300"
                        >
                            Back to Agents
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-gradient-success text-white';
            case 'suspended':
                return 'bg-gradient-accent text-white';
            case 'revoked':
            case 'expired':
                return 'bg-gradient-danger text-white';
            default:
                return 'bg-gradient-secondary text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon className="w-5 h-5" />;
            case 'suspended':
            case 'revoked':
            case 'expired':
                return <XCircleIcon className="w-5 h-5" />;
            default:
                return <ShieldCheckIcon className="w-5 h-5" />;
        }
    };

    const formatCost = (cost: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        }).format(cost);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'decisions', label: 'Decisions', icon: DocumentTextIcon },
        { id: 'executions', label: 'Executions', icon: BoltIcon },
        { id: 'rate-limits', label: 'Rate Limits', icon: ClockIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/agent-governance')}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Agents</span>
                </button>

                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
                                <CpuChipIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">
                                    {agent.agentName}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Agent ID: {agent.agentId}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                                    agent.status
                                )}`}
                            >
                                {getStatusIcon(agent.status)}
                                <span className="capitalize">{agent.status}</span>
                            </div>
                            {agent.status === 'active' && (
                                <>
                                    <button
                                        onClick={handleRevoke}
                                        className="btn btn-sm bg-gradient-secondary text-white hover:shadow-xl transition-all duration-300"
                                    >
                                        Revoke
                                    </button>
                                    <button
                                        onClick={handleKillSwitch}
                                        className="btn btn-sm bg-gradient-danger text-white hover:shadow-xl transition-all duration-300"
                                    >
                                        <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />
                                        Kill Switch
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                                {formatNumber(agent.totalRequests)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                                {formatCost(agent.totalCost)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                                {formatNumber(agent.totalTokens)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Failures</p>
                            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                                {formatNumber(agent.failureCount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(`/agent-governance/${agentId}/${tab.id}`)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-primary text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <OverviewTab agent={agent} analytics={analytics} />
                )}
                {activeTab === 'decisions' && (
                    <DecisionsTab decisions={decisions} />
                )}
                {activeTab === 'executions' && (
                    <ExecutionsTab executions={executions} />
                )}
                {activeTab === 'rate-limits' && (
                    <RateLimitsTab agent={agent} rateLimits={rateLimits} />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab agent={agent} onUpdate={fetchAgentData} />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab: React.FC<{ agent: AgentIdentity; analytics: Record<string, unknown> | null }> = ({ agent }) => {
    return (
        <div className="space-y-6">
            {/* Configuration */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                    Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agent Type</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{agent.agentType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Token Prefix</p>
                        <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{agent.tokenPrefix}...</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sandbox Required</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {agent.sandboxRequired ? (
                                <span className="text-green-600 dark:text-green-400">✓ Enabled</span>
                            ) : (
                                <span className="text-red-600 dark:text-red-400">✗ Disabled</span>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Used</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {agent.lastUsedAt ? new Date(agent.lastUsedAt).toLocaleString() : 'Never'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Limits */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                    Budget Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Per Request</p>
                        <p className="font-display font-bold text-xl text-gray-900 dark:text-white">
                            {agent.budgetCapPerRequest ? `$${agent.budgetCapPerRequest.toFixed(4)}` : 'Unlimited'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Per Day</p>
                        <p className="font-display font-bold text-xl text-gray-900 dark:text-white">
                            {agent.budgetCapPerDay ? `$${agent.budgetCapPerDay.toFixed(2)}` : 'Unlimited'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Per Month</p>
                        <p className="font-display font-bold text-xl text-gray-900 dark:text-white">
                            {agent.budgetCapPerMonth ? `$${agent.budgetCapPerMonth.toFixed(2)}` : 'Unlimited'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Allowed Models & Providers */}
            {(agent.allowedModels?.length || agent.allowedProviders?.length) && (
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                        Permissions
                    </h3>
                    <div className="space-y-4">
                        {agent.allowedModels && agent.allowedModels.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Allowed Models</p>
                                <div className="flex flex-wrap gap-2">
                                    {agent.allowedModels.map((model, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        >
                                            {model}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {agent.allowedProviders && agent.allowedProviders.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Allowed Providers</p>
                                <div className="flex flex-wrap gap-2">
                                    {agent.allowedProviders.map((provider, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                        >
                                            {provider}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {agent.allowedActions && agent.allowedActions.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Allowed Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {agent.allowedActions.map((action, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400"
                                        >
                                            {action}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Decisions Tab Component
const DecisionsTab: React.FC<{ decisions: AgentDecision[] }> = ({ decisions }) => {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'medium':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
            case 'high':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            case 'critical':
                return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    if (decisions.length === 0) {
        return (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-2">
                    No Decisions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    This agent hasn't made any decisions yet
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {decisions.map((decision) => (
                <div
                    key={decision.decisionId}
                    className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                {decision.decisionType}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(decision.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getRiskColor(decision.riskLevel)}`}>
                                {decision.riskLevel} risk
                            </span>
                            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {(decision.confidenceScore * 100).toFixed(0)}% confidence
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decision</p>
                            <p className="text-gray-900 dark:text-white">{decision.decision}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reasoning</p>
                            <p className="text-gray-600 dark:text-gray-400">{decision.reasoning}</p>
                        </div>
                        {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Alternatives Considered ({decision.alternativesConsidered.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {decision.alternativesConsidered.map((alt: unknown, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-gray-500/10 text-gray-600 dark:text-gray-400"
                                        >
                                            {typeof alt === 'string' ? alt : JSON.stringify(alt)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Executions Tab Component
const ExecutionsTab: React.FC<{ executions: AgentExecution[] }> = ({ executions }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'running':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'failed':
            case 'killed':
                return 'bg-red-500/10 text-red-600 dark:text-red-400';
            case 'timeout':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    if (executions.length === 0) {
        return (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                <BoltIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-2">
                    No Executions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    This agent hasn't executed any tasks yet
                </p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Execution ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Cost
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Started At
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                        {executions.map((execution) => (
                            <tr key={execution.executionId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                                        {execution.executionId.substring(0, 8)}...
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(execution.status)}`}>
                                        {execution.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {execution.executionTimeMs ? `${execution.executionTimeMs}ms` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {execution.actualCost ? `$${execution.actualCost.toFixed(4)}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                    {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Rate Limits Tab Component
const RateLimitsTab: React.FC<{ agent: AgentIdentity; rateLimits: Record<string, unknown> | null }> = ({ agent, rateLimits }) => {
    return (
        <div className="space-y-6">
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                    Rate Limit Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Requests per Minute</p>
                        <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                            {agent.maxRequestsPerMinute || 'Unlimited'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Requests per Hour</p>
                        <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                            {agent.maxRequestsPerHour || 'Unlimited'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Concurrent Executions</p>
                        <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                            {agent.maxConcurrentExecutions || 'Unlimited'}
                        </p>
                    </div>
                </div>
            </div>

            {rateLimits && (
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                        Current Usage
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Rate limit status and usage information will be displayed here
                    </p>
                </div>
            )}
        </div>
    );
};

// Settings Tab Component
const SettingsTab: React.FC<{ agent: AgentIdentity; onUpdate: () => void }> = ({ agent, onUpdate }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const { showToast } = useToast();
    const [formData, setFormData] = React.useState({
        agentName: agent.agentName,
        allowedModels: agent.allowedModels || [],
        allowedProviders: agent.allowedProviders || [],
        allowedActions: agent.allowedActions || [],
        budgetCapPerRequest: agent.budgetCapPerRequest || 0.1,
        budgetCapPerDay: agent.budgetCapPerDay || 1.0,
        budgetCapPerMonth: agent.budgetCapPerMonth || 10.0,
        maxRequestsPerMinute: agent.maxRequestsPerMinute,
        maxRequestsPerHour: agent.maxRequestsPerHour,
        maxConcurrentExecutions: agent.maxConcurrentExecutions,
        sandboxRequired: agent.sandboxRequired,
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            await agentGovernanceService.updateAgent(agent.agentId, formData);
            showToast('Agent configuration updated successfully', 'success');
            setIsEditing(false);
            onUpdate(); // Refresh data
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update agent';
            showToast(errorMessage, 'error');
            console.error('Error updating agent:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            agentName: agent.agentName,
            allowedModels: agent.allowedModels || [],
            allowedProviders: agent.allowedProviders || [],
            allowedActions: agent.allowedActions || [],
            budgetCapPerRequest: agent.budgetCapPerRequest || 0.1,
            budgetCapPerDay: agent.budgetCapPerDay || 1.0,
            budgetCapPerMonth: agent.budgetCapPerMonth || 10.0,
            maxRequestsPerMinute: agent.maxRequestsPerMinute,
            maxRequestsPerHour: agent.maxRequestsPerHour,
            maxConcurrentExecutions: agent.maxConcurrentExecutions,
            sandboxRequired: agent.sandboxRequired,
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                    Edit Agent Configuration
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Agent Name
                        </label>
                        <input
                            type="text"
                            value={formData.agentName}
                            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Budget Per Request ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.budgetCapPerRequest}
                                onChange={(e) => setFormData({ ...formData, budgetCapPerRequest: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Budget Per Day ($)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.budgetCapPerDay}
                                onChange={(e) => setFormData({ ...formData, budgetCapPerDay: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Budget Per Month ($)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={formData.budgetCapPerMonth}
                                onChange={(e) => setFormData({ ...formData, budgetCapPerMonth: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Requests per Minute
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.maxRequestsPerMinute || ''}
                                onChange={(e) => setFormData({ ...formData, maxRequestsPerMinute: parseInt(e.target.value) || undefined })}
                                placeholder="Unlimited"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Requests per Hour
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.maxRequestsPerHour || ''}
                                onChange={(e) => setFormData({ ...formData, maxRequestsPerHour: parseInt(e.target.value) || undefined })}
                                placeholder="Unlimited"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Concurrent Executions
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.maxConcurrentExecutions || ''}
                                onChange={(e) => setFormData({ ...formData, maxConcurrentExecutions: parseInt(e.target.value) || undefined })}
                                placeholder="Unlimited"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="sandboxRequired"
                            checked={formData.sandboxRequired}
                            onChange={(e) => setFormData({ ...formData, sandboxRequired: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                        />
                        <label htmlFor="sandboxRequired" className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Require Sandbox Execution</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Recommended: Isolates agent execution for enhanced security
                            </p>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex-1"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="btn bg-gradient-secondary text-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                Agent Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update agent configuration, permissions, and limits
            </p>
            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{agent.agentName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent ID:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{agent.agentId}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{agent.status}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sandbox Required:</span>
                    <span className={`text-sm ${agent.sandboxRequired ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {agent.sandboxRequired ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>
            <button
                className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 w-full"
                onClick={() => setIsEditing(true)}
            >
                <CogIcon className="w-5 h-5 mr-2" />
                Edit Configuration
            </button>
        </div>
    );
};

