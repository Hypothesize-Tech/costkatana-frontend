import api from '../config/api';

// Types
export interface AWSConnection {
  id: string;
  connectionName: string;
  description?: string;
  environment: 'production' | 'staging' | 'development';
  roleArn: string;
  externalId?: string;
  permissionMode: 'read-only' | 'read-write' | 'custom';
  executionMode: 'simulation' | 'live';
  allowedRegions?: string[];
  status: 'active' | 'inactive' | 'error' | 'pending_verification';
  health?: {
    lastChecked: string;
    lastSuccessful?: string;
    consecutiveFailures: number;
    lastError?: string;
  };
  lastUsed?: string;
  totalExecutions: number;
  createdAt: string;
}

export interface ParsedIntent {
  originalRequest: string;
  interpretedAction: string;
  confidence: number;
  entities: {
    service?: string;
    action?: string;
    resources?: string[];
    parameters?: Record<string, any>;
    regions?: string[];
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction?: string;
  warnings: string[];
  blocked: boolean;
  blockReason?: string;
}

export interface ExecutionStep {
  stepId: string;
  order: number;
  service: string;
  action: string;
  description: string;
  resources: string[];
  impact: {
    resourceCount: number;
    costChange: number;
    reversible: boolean;
    downtime: boolean;
    dataLoss: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  status?: string;
}

export interface ExecutionPlan {
  planId: string;
  dslHash: string;
  dslVersion: string;
  steps: ExecutionStep[];
  summary: {
    totalSteps: number;
    estimatedDuration: number;
    estimatedCostImpact: number;
    riskScore: number;
    resourcesAffected: number;
    servicesAffected: string[];
    requiresApproval: boolean;
    reversible: boolean;
  };
  visualization?: string;
  createdAt: string;
  expiresAt: string;
}

export interface ExecutionResult {
  planId: string;
  status: 'completed' | 'partial' | 'failed' | 'rolled_back';
  steps: ExecutionStep[];
  startedAt: string;
  completedAt: string;
  duration: number;
  error?: string;
  rollbackExecuted?: boolean;
}

export interface SimulationResult {
  planId: string;
  status: 'simulated' | 'failed';
  permissionValidation: {
    valid: boolean;
    missingPermissions: string[];
  };
  costPrediction: {
    monthly: number;
    annual: number;
    confidence: 'high' | 'medium' | 'low';
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    factors: Array<{ factor: string; impact: string; description: string }>;
    mitigations: string[];
  };
  canPromoteToLive: boolean;
  promotionBlockers?: string[];
}

export interface AuditLogEntry {
  entryId: string;
  eventType: string;
  timestamp: string;
  result: 'success' | 'failure' | 'blocked' | 'pending';
  error?: string;
  action?: {
    service?: string;
    operation?: string;
    planId?: string;
  };
  impact?: {
    resourceCount?: number;
    costChange?: number;
  };
}

export interface AllowedAction {
  action: string;
  name: string;
  description: string;
  category: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
}

// API Service
class AWSService {
  private baseUrl = '/aws';

  // Connection Management
  async createConnection(data: {
    connectionName: string;
    description?: string;
    environment?: string;
    roleArn: string;
    permissionMode?: string;
    allowedRegions?: string[];
  }): Promise<{ connection: AWSConnection & { externalId: string } }> {
    const response = await api.post(`${this.baseUrl}/connections`, data);
    return response.data;
  }

  async listConnections(): Promise<{ connections: AWSConnection[] }> {
    const response = await api.get(`${this.baseUrl}/connections`);
    return response.data;
  }

  async deleteConnection(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/connections/${id}`);
  }

  async testConnection(id: string): Promise<{
    success: boolean;
    status: string;
    latencyMs?: number;
    error?: string;
  }> {
    const response = await api.post(`${this.baseUrl}/connections/${id}/test`);
    return response.data;
  }

  // Intent & Plan
  async parseIntent(request: string, connectionId?: string): Promise<{ intent: ParsedIntent }> {
    const response = await api.post(`${this.baseUrl}/intent`, { request, connectionId });
    return response.data;
  }

  async generatePlan(
    intent: ParsedIntent,
    connectionId: string,
    resources?: string[]
  ): Promise<{ plan: ExecutionPlan }> {
    const response = await api.post(`${this.baseUrl}/plan`, { intent, connectionId, resources });
    return response.data;
  }

  // Execution
  async approvePlan(planId: string, connectionId: string): Promise<{
    approvalToken: string;
    expiresAt: string;
  }> {
    const response = await api.post(`${this.baseUrl}/approve`, { planId, connectionId });
    return response.data;
  }

  async executePlan(
    plan: ExecutionPlan,
    connectionId: string,
    approvalToken: string
  ): Promise<{ result: ExecutionResult }> {
    const response = await api.post(`${this.baseUrl}/execute`, {
      plan,
      connectionId,
      approvalToken,
    });
    return response.data;
  }

  async simulatePlan(plan: ExecutionPlan, connectionId: string): Promise<{ simulation: SimulationResult }> {
    const response = await api.post(`${this.baseUrl}/simulate`, { plan, connectionId });
    return response.data;
  }

  // Audit
  async getAuditLogs(params?: {
    connectionId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditLogEntry[]; total: number; hasMore: boolean }> {
    const response = await api.get(`${this.baseUrl}/audit`, { params });
    return response.data;
  }

  async getAuditAnchor(): Promise<{
    latestAnchor: { anchorId: string; anchorHash: string; entryCount: number; createdAt: string } | null;
    rootOfTrust: { anchorId: string; hash: string; createdAt: string } | null;
    totalAnchors: number;
    chainPosition: number;
  }> {
    const response = await api.get(`${this.baseUrl}/audit/anchor`);
    return response.data;
  }

  async verifyAuditChain(startPosition?: number, endPosition?: number): Promise<{
    valid: boolean;
    brokenAt?: number;
    entriesChecked: number;
  }> {
    const response = await api.get(`${this.baseUrl}/audit/verify`, {
      params: { startPosition, endPosition },
    });
    return response.data.verification;
  }

  // Utilities
  async getAllowedActions(): Promise<{ actions: AllowedAction[] }> {
    const response = await api.get(`${this.baseUrl}/actions`);
    return response.data;
  }

  async getPermissionBoundaries(): Promise<{
    hardLimits: Record<string, any>;
    bannedActions: string[];
    allowedServices: string[];
  }> {
    const response = await api.get(`${this.baseUrl}/boundaries`);
    return response.data;
  }

  async getEmergencyStopInstructions(connectionId: string): Promise<{ instructions: string }> {
    const response = await api.get(`${this.baseUrl}/emergency-stop/${connectionId}`);
    return response.data;
  }

  // Kill Switch (Admin)
  async activateKillSwitch(scope: string, id?: string, reason?: string): Promise<void> {
    await api.post(`${this.baseUrl}/kill-switch`, { scope, id, reason });
  }

  async getKillSwitchState(): Promise<{
    global: boolean;
    readOnlyMode: boolean;
    customerSwitchCount: number;
    serviceSwitchCount: number;
    connectionSwitchCount: number;
  }> {
    const response = await api.get(`${this.baseUrl}/kill-switch`);
    return response.data.state;
  }
}

export const awsService = new AWSService();
