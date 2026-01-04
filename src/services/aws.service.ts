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
  allowedServices?: Array<{
    service: string;
    actions: string[];
    regions: string[];
  }>;
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

// EC2 Types
export interface EC2Instance {
  instanceId: string;
  instanceType: string;
  state: string;
  launchTime?: string;
  tags: Record<string, string>;
  privateIpAddress?: string;
  publicIpAddress?: string;
  vpcId?: string;
  subnetId?: string;
}

// S3 Types
export interface S3Bucket {
  name: string;
  creationDate?: string;
  region?: string;
  tags: Record<string, string>;
}

// RDS Types
export interface RDSInstance {
  dbInstanceId: string;
  dbInstanceClass: string;
  engine: string;
  engineVersion: string;
  status: string;
  allocatedStorage: number;
  multiAZ: boolean;
  endpoint?: { address: string; port: number };
  tags: Record<string, string>;
}

// Lambda Types
export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string;
  memorySize: number;
  timeout: number;
  codeSize: number;
  lastModified?: string;
  handler: string;
  description?: string;
  tags: Record<string, string>;
}

// Cost Explorer Types
export interface CostBreakdown {
  service: string;
  amount: number;
  percentage: number;
  currency: string;
}

export interface CostForecast {
  timePeriod: { start: string; end: string };
  meanValue: number;
  predictionIntervalLowerBound?: number;
  predictionIntervalUpperBound?: number;
  currency: string;
}

export interface CostAnomaly {
  anomalyId: string;
  anomalyStartDate?: string;
  anomalyEndDate?: string;
  dimensionValue?: string;
  rootCauses?: Array<{
    service?: string;
    region?: string;
    linkedAccount?: string;
    usageType?: string;
  }>;
  impact: {
    maxImpact: number;
    totalImpact: number;
  };
  feedback?: string;
}

export interface CostSummary {
  total: number;
  currency: string;
  topServices: CostBreakdown[];
  dailyAverage: number;
  projectedMonthEnd: number;
}

export interface OptimizationRecommendation {
  service: string;
  insight: string;
  potentialSavings?: number;
  priority: 'high' | 'medium' | 'low';
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
    externalId?: string;
    selectedPermissions?: Record<string, string[]>; // Granular permissions
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

  // ============================================================================
  // EC2 Resources
  // ============================================================================

  async listEC2Instances(connectionId: string, region?: string): Promise<{
    success: boolean;
    instances: EC2Instance[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/ec2/instances`, {
      params: { region },
    });
    return response.data;
  }

  async stopEC2Instances(connectionId: string, instanceIds: string[], region?: string): Promise<{
    success: boolean;
    stoppedInstances: string[];
    errors: Array<{ instanceId: string; error: string }>;
  }> {
    const response = await api.post(`${this.baseUrl}/connections/${connectionId}/ec2/stop`, {
      instanceIds,
      region,
    });
    return response.data;
  }

  async startEC2Instances(connectionId: string, instanceIds: string[], region?: string): Promise<{
    success: boolean;
    startedInstances: string[];
    errors: Array<{ instanceId: string; error: string }>;
  }> {
    const response = await api.post(`${this.baseUrl}/connections/${connectionId}/ec2/start`, {
      instanceIds,
      region,
    });
    return response.data;
  }

  // ============================================================================
  // S3 Resources
  // ============================================================================

  async listS3Buckets(connectionId: string): Promise<{
    success: boolean;
    buckets: S3Bucket[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/s3/buckets`);
    return response.data;
  }

  // ============================================================================
  // RDS Resources
  // ============================================================================

  async listRDSInstances(connectionId: string, region?: string): Promise<{
    success: boolean;
    instances: RDSInstance[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/rds/instances`, {
      params: { region },
    });
    return response.data;
  }

  // ============================================================================
  // Lambda Resources
  // ============================================================================

  async listLambdaFunctions(connectionId: string, region?: string): Promise<{
    success: boolean;
    functions: LambdaFunction[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/lambda/functions`, {
      params: { region },
    });
    return response.data;
  }

  // ============================================================================
  // Cost Explorer
  // ============================================================================

  async getCosts(connectionId: string): Promise<{
    success: boolean;
  } & CostSummary> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/costs`);
    return response.data;
  }

  async getCostBreakdown(connectionId: string, startDate?: string, endDate?: string): Promise<{
    success: boolean;
    breakdown: CostBreakdown[];
    period: { start: string; end: string };
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/costs/breakdown`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getCostForecast(connectionId: string, granularity?: 'DAILY' | 'MONTHLY'): Promise<{
    success: boolean;
    forecast: CostForecast[];
    period: { start: string; end: string };
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/costs/forecast`, {
      params: { granularity },
    });
    return response.data;
  }

  async getCostAnomalies(connectionId: string, startDate?: string, endDate?: string): Promise<{
    success: boolean;
    anomalies: CostAnomaly[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/costs/anomalies`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getOptimizationRecommendations(connectionId: string): Promise<{
    success: boolean;
    recommendations: OptimizationRecommendation[];
    count: number;
  }> {
    const response = await api.get(`${this.baseUrl}/connections/${connectionId}/costs/optimize`);
    return response.data;
  }
}

export const awsService = new AWSService();
