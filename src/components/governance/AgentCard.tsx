import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { AgentIdentity } from '../../services/agentGovernance.service';

interface AgentCardProps {
  agent: AgentIdentity;
  onRevoke?: (agentId: string) => void;
  onKillSwitch?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onRevoke, onKillSwitch }) => {
  const navigate = useNavigate();

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
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'suspended':
      case 'revoked':
      case 'expired':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShieldCheckIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      recommendation: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      github: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      multiagent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      custom: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
      workflow: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      automation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
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

  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:border-primary-300/40 dark:hover:border-primary-400/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(agent.agentType)}`}>
            <CpuChipIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
              {agent.agentName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {agent.tokenPrefix}...
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(agent.status)}`}>
          {getStatusIcon(agent.status)}
          <span className="capitalize">{agent.status}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Requests</p>
          <p className="font-display font-bold text-lg text-gray-900 dark:text-white">
            {formatNumber(agent.totalRequests)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
          <p className="font-display font-bold text-lg text-gray-900 dark:text-white">
            {formatCost(agent.totalCost)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Failures</p>
          <p className="font-display font-bold text-lg text-gray-900 dark:text-white">
            {formatNumber(agent.failureCount)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Used</p>
          <p className="font-display font-semibold text-sm text-gray-700 dark:text-gray-300">
            {formatDate(agent.lastUsedAt)}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(agent.agentType)}`}>
          {agent.agentType}
        </span>
        {agent.sandboxRequired && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Sandboxed
          </span>
        )}
        {agent.failureCount > 10 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            High Failures
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/agent-governance/${agent.agentId}`)}
          className="btn btn-sm flex-1 sm:flex-none bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <ChartBarIcon className="w-4 h-4 mr-1.5" />
          View Details
        </button>
        {agent.status === 'active' && (
          <>
            <button
              onClick={() => onRevoke?.(agent.agentId)}
              className="btn btn-sm bg-gradient-secondary text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ClockIcon className="w-4 h-4 mr-1.5" />
              Revoke
            </button>
            <button
              onClick={() => onKillSwitch?.(agent.agentId)}
              className="btn btn-sm bg-gradient-danger text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <XCircleIcon className="w-4 h-4 mr-1.5" />
              Kill Switch
            </button>
          </>
        )}
      </div>
    </div>
  );
};

