import api from '../config/api';

export interface AgentIdentity {
  _id: string;
  agentId: string;
  agentName: string;
  agentType: 'recommendation' | 'github' | 'multiagent' | 'custom' | 'workflow' | 'automation';
  tokenPrefix: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  sandboxRequired: boolean;
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  failureCount: number;
  lastUsedAt?: string;
  createdAt: string;
  allowedModels?: string[];
  allowedProviders?: string[];
  allowedActions?: string[];
  budgetCapPerRequest?: number;
  budgetCapPerDay?: number;
  budgetCapPerMonth?: number;
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  maxConcurrentExecutions?: number;
}

export interface AgentDecision {
  decisionId: string;
  agentId: string;
  decisionType: string;
  decision: string;
  reasoning: string;
  alternativesConsidered: any[];
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  executionContext: any;
}

export interface AgentExecution {
  executionId: string;
  agentId: string;
  status: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  actualCost?: number;
  errorMessage?: string;
}

export interface CreateAgentRequest {
  agentName: string;
  agentType: string;
  workspaceId?: string;
  organizationId?: string;
  allowedModels?: string[];
  allowedProviders?: string[];
  allowedActions?: string[];
  capabilities?: any[];
  budgetCapPerRequest?: number;
  budgetCapPerDay?: number;
  budgetCapPerMonth?: number;
  sandboxRequired?: boolean;
  sandboxConfig?: any;
  description?: string;
}

export interface UpdateAgentRequest {
  agentName?: string;
  allowedModels?: string[];
  allowedProviders?: string[];
  allowedActions?: string[];
  budgetCapPerRequest?: number;
  budgetCapPerDay?: number;
  budgetCapPerMonth?: number;
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  maxConcurrentExecutions?: number;
  sandboxRequired?: boolean;
  description?: string;
}

class AgentGovernanceService {
  /**
   * Create new agent identity
   */
  async createAgent(data: CreateAgentRequest) {
    const response = await api.post('/agent-governance/identities', data);
    return response.data;
  }

  /**
   * List all agents
   */
  async listAgents(params?: {
    workspaceId?: string;
    organizationId?: string;
    status?: string;
    agentType?: string;
  }) {
    const response = await api.get('/agent-governance/identities', { params });
    return response.data;
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string) {
    const response = await api.get(`/agent-governance/identities/${agentId}`);
    return response.data;
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, data: UpdateAgentRequest) {
    const response = await api.patch(`/agent-governance/identities/${agentId}`, data);
    return response.data;
  }

  /**
   * Revoke agent
   */
  async revokeAgent(agentId: string, reason?: string) {
    const response = await api.post(`/agent-governance/identities/${agentId}/revoke`, { reason });
    return response.data;
  }

  /**
   * Emergency kill-switch
   */
  async emergencyKillSwitch(agentId: string, reason?: string) {
    const response = await api.post(`/agent-governance/identities/${agentId}/emergency-kill`, { reason });
    return response.data;
  }

  /**
   * Get agent decisions
   */
  async getAgentDecisions(agentId: string, params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    decisionType?: string;
    riskLevel?: string;
  }) {
    const response = await api.get(`/agent-governance/identities/${agentId}/decisions`, { params });
    return response.data;
  }

  /**
   * Get agent executions
   */
  async getAgentExecutions(agentId: string, params?: {
    limit?: number;
    status?: string;
  }) {
    const response = await api.get(`/agent-governance/identities/${agentId}/executions`, { params });
    return response.data;
  }

  /**
   * Get agent rate limit status
   */
  async getAgentRateLimits(agentId: string) {
    const response = await api.get(`/agent-governance/identities/${agentId}/rate-limits`);
    return response.data;
  }

  /**
   * Get agent analytics
   */
  async getAgentAnalytics(agentId: string) {
    const response = await api.get(`/agent-governance/identities/${agentId}/analytics`);
    return response.data;
  }

  /**
   * Get governance status
   */
  async getGovernanceStatus() {
    const response = await api.get('/agent-governance/status');
    return response.data;
  }
}

export const agentGovernanceService = new AgentGovernanceService();

