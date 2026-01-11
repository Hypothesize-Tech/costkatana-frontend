import type React from 'react';

export enum AgentMode {
  SCOPE = 'SCOPE',
  CLARIFY = 'CLARIFY',
  PLAN = 'PLAN',
  BUILD = 'BUILD',
  VERIFY = 'VERIFY',
  DONE = 'DONE'
}

export type TaskType =
  | 'simple_query'
  | 'complex_query'
  | 'cross_integration'
  | 'coding'
  | 'research'
  | 'data_transformation';

export type TaskComplexity = 'low' | 'medium' | 'high';
export type TaskRiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface TaskClassification {
  type: TaskType;
  integrations: string[];
  complexity: TaskComplexity;
  riskLevel: TaskRiskLevel;
  requiresPlanning: boolean;
  route: 'DIRECT_EXECUTION' | 'GOVERNED_WORKFLOW';
  reasoning: string;
  estimatedDuration?: number;
}

export interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    relevance: number;
  }>;
  synthesis: string;
  keyFindings: string[];
}

export interface PlanStep {
  id: string;
  tool: string;
  action: string;
  params: Record<string, unknown>;
  description: string;
  estimatedDuration: number;
  dependencies?: string[];
}

export interface PlanPhase {
  name: string;
  approvalRequired: boolean;
  steps: PlanStep[];
  riskLevel: TaskRiskLevel;
}

export interface RiskAssessment {
  level: TaskRiskLevel;
  reasons: string[];
  requiresApproval: boolean;
  mitigationStrategies?: string[];
  estimatedImpact?: {
    cost?: number;
    dataRecords?: number;
    resourcesCreated?: number;
  };
}

export interface ExecutionPlan {
  phases: PlanPhase[];
  researchSources?: ResearchResult[];
  estimatedDuration: number;
  estimatedCost?: number;
  riskAssessment: RiskAssessment;
  rollbackPlan?: string;
}

export interface ScopeAnalysis {
  compatible: boolean;
  ambiguities: string[];
  requiredIntegrations: string[];
  estimatedComplexity: TaskComplexity;
  canProceed: boolean;
  clarificationNeeded?: string[];
}

export interface ExecutionProgress {
  currentPhase: number;
  currentStep?: string; // Changed to string to track step ID (or undefined when no step is executing)
  totalPhases: number;
  totalSteps: number;
  completedSteps: string[];
  failedSteps: Array<{
    stepId: string;
    error: string;
    timestamp: Date;
  }>;
  startTime: Date;
  estimatedCompletionTime?: Date;
}

export interface VerificationResult {
  success: boolean;
  deploymentUrls?: string[];
  healthChecks?: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, unknown>;
  }>;
  dataIntegrity?: {
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
  };
  rollbackInstructions?: string;
  recommendations?: string[];
}

export interface ExecutionResult {
  stepId: string;
  status: 'completed' | 'failed' | 'pending';
  success?: boolean;
  timestamp?: string;
  error?: string;
  output?: {
    message?: string | React.ReactNode;
    link?: string;
    data?: Record<string, unknown>;
    files?: Array<{
      path: string;
      content: string;
    }>;
  };
  result?: {
    success: boolean;
    output?: {
      message?: string | React.ReactNode;
      link?: string;
      data?: Record<string, unknown>;
      files?: Array<{
        path: string;
        content: string;
      }>;
    };
  };
}

export interface GovernedTask {
  id: string;
  userId: string;
  mode: AgentMode;
  userRequest: string;
  classification?: TaskClassification;
  scopeAnalysis?: ScopeAnalysis;
  plan?: ExecutionPlan;
  approvalToken?: string;
  approvedAt?: Date;
  executionProgress?: ExecutionProgress;
  executionResults?: ExecutionResult[];
  verification?: VerificationResult;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ProgressUpdate {
  step: number;
  total: number;
  status: 'running' | 'completed' | 'failed';
  action?: string;
  error?: string;
  result?: Record<string, unknown>;
  timestamp: Date;
}
