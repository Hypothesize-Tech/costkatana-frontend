import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { agentGovernanceService, AgentIdentity } from '../services/agentGovernance.service';
import { AgentCard } from '../components/governance/AgentCard';
import { AgentGovernanceShimmer } from '../components/shimmer/AgentGovernanceShimmer';
import { useToast } from '../hooks/useToast';

export const AgentGovernance: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentIdentity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalRequests: 0,
    totalCost: 0,
  });

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, filterStatus, filterType]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentGovernanceService.listAgents();
      setAgents(response.data.agents || []);
    } catch (error: any) {
      showToast('Failed to load agents', 'error');
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await agentGovernanceService.getGovernanceStatus();
      if (response.data.statistics) {
        setStats({
          total: response.data.statistics.totalAgents || 0,
          active: response.data.statistics.activeAgents || 0,
          totalRequests: response.data.statistics.totalDecisions || 0,
          totalCost: 0, // Would come from backend
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (agent) =>
          agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.tokenPrefix.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((agent) => agent.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((agent) => agent.agentType === filterType);
    }

    setFilteredAgents(filtered);
  };

  const handleRevoke = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to revoke this agent?')) return;

    try {
      await agentGovernanceService.revokeAgent(agentId, 'Revoked by user');
      showToast('Agent revoked successfully', 'success');
      fetchAgents();
    } catch (error) {
      showToast('Failed to revoke agent', 'error');
      console.error('Error revoking agent:', error);
    }
  };

  const handleKillSwitch = async (agentId: string) => {
    if (
      !window.confirm(
        'EMERGENCY KILL SWITCH: This will immediately revoke the agent and terminate all its executions. Are you absolutely sure?'
      )
    )
      return;

    try {
      await agentGovernanceService.emergencyKillSwitch(agentId, 'Emergency kill-switch activated by user');
      showToast('Emergency kill-switch activated successfully', 'success');
      fetchAgents();
    } catch (error) {
      showToast('Failed to activate kill-switch', 'error');
      console.error('Error activating kill-switch:', error);
    }
  };

  if (loading) {
    return <AgentGovernanceShimmer />;
  }

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">
                  Agent Governance
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage and monitor your AI agents with enterprise-grade security
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/agent-governance/create')}
              className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Agent
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Agents</p>
            <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {stats.active} active
            </p>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Agents</p>
            <p className="font-display font-bold text-3xl text-green-600 dark:text-green-400">
              {stats.active}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Currently operational
            </p>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Decisions</p>
            <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">
              {stats.totalRequests.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Across all agents
            </p>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Governance</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <p className="font-display font-bold text-xl text-green-600 dark:text-green-400">
                Enabled
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              All systems operational
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="recommendation">Recommendation</option>
                <option value="github">GitHub</option>
                <option value="multiagent">Multi-Agent</option>
                <option value="custom">Custom</option>
                <option value="workflow">Workflow</option>
                <option value="automation">Automation</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredAgents.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{agents.length}</span> agents
            </p>
          </div>
        </div>

        {/* Agents List */}
        {filteredAgents.length === 0 ? (
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
            <ShieldCheckIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-2">
              No Agents Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first agent to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={() => navigate('/agent-governance/create')}
                className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.agentId}
                agent={agent}
                onRevoke={handleRevoke}
                onKillSwitch={handleKillSwitch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

