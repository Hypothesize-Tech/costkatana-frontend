import { apiClient } from '../config/api';

export interface WorkflowStep {
    step: string;
    sequence: number;
    cost: number;
    tokens: number;
    responseTime: number;
    model: string;
    service: string;
    timestamp: string;
}

export interface WorkflowSummary {
    workflowId: string;
    workflowName: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    averageCost: number;
    steps: WorkflowStep[];
    startTime: string;
    endTime: string;
    duration: number;
}

export interface WorkflowAnalytics {
    totalWorkflows: number;
    totalCost: number;
    averageWorkflowCost: number;
    topWorkflowTypes: Array<{
        workflowName: string;
        count: number;
        totalCost: number;
        averageCost: number;
    }>;
    costByStep: Array<{
        step: string;
        totalCost: number;
        count: number;
        averageCost: number;
    }>;
}

export interface WorkflowFilters {
    page?: number;
    limit?: number;
    workflowName?: string;
    startDate?: string;
    endDate?: string;
}

export class WorkflowService {
    /**
     * Get user workflows with pagination and filters
     */
    static async getUserWorkflows(filters: WorkflowFilters = {}): Promise<{
        success: boolean;
        data: WorkflowSummary[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }> {
        try {
            const params = new URLSearchParams();
            
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.workflowName) params.append('workflowName', filters.workflowName);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/workflows?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching workflows:', error);
            return {
                success: false,
                data: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 20
                }
            };
        }
    }

    /**
     * Get workflow analytics
     */
    static async getWorkflowAnalytics(filters: { startDate?: string; endDate?: string } = {}): Promise<{
        success: boolean;
        data: WorkflowAnalytics;
    }> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/workflows/analytics?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching workflow analytics:', error);
            return {
                success: false,
                data: {
                    totalWorkflows: 0,
                    totalCost: 0,
                    averageWorkflowCost: 0,
                    topWorkflowTypes: [],
                    costByStep: []
                }
            };
        }
    }

    /**
     * Get specific workflow details
     */
    static async getWorkflowDetails(workflowId: string): Promise<{
        success: boolean;
        data?: WorkflowSummary;
        message?: string;
    }> {
        try {
            const response = await apiClient.get(`/workflows/${workflowId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching workflow details:', error);
            return {
                success: false,
                message: 'Failed to fetch workflow details'
            };
        }
    }

    /**
     * Get workflow steps
     */
    static async getWorkflowSteps(workflowId: string): Promise<{
        success: boolean;
        data?: {
            workflowId: string;
            workflowName: string;
            steps: WorkflowStep[];
            totalCost: number;
            duration: number;
        };
        message?: string;
    }> {
        try {
            const response = await apiClient.get(`/workflows/${workflowId}/steps`);
            return response.data;
        } catch (error) {
            console.error('Error fetching workflow steps:', error);
            return {
                success: false,
                message: 'Failed to fetch workflow steps'
            };
        }
    }

    /**
     * Compare multiple workflows
     */
    static async compareWorkflows(workflowIds: string[]): Promise<{
        success: boolean;
        data: WorkflowSummary[];
        message?: string;
    }> {
        try {
            const response = await apiClient.post('/workflows/compare', { workflowIds });
            return response.data;
        } catch (error) {
            console.error('Error comparing workflows:', error);
            return {
                success: false,
                data: [],
                message: 'Failed to compare workflows'
            };
        }
    }

    /**
     * Format currency for display
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
        }).format(amount);
    }

    /**
     * Format duration for display
     */
    static formatDuration(milliseconds: number): string {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        } else if (milliseconds < 60000) {
            return `${(milliseconds / 1000).toFixed(1)}s`;
        } else if (milliseconds < 3600000) {
            return `${(milliseconds / 60000).toFixed(1)}m`;
        } else {
            return `${(milliseconds / 3600000).toFixed(1)}h`;
        }
    }

    /**
     * Format step path for display
     */
    static formatStepPath(step: string): string {
        if (!step) return 'Unknown Step';
        
        // Remove leading slash and replace slashes with arrows
        return step.replace(/^\//, '').replace(/\//g, ' → ');
    }

    /**
     * Get step depth for indentation
     */
    static getStepDepth(step: string): number {
        if (!step) return 0;
        return (step.match(/\//g) || []).length;
    }

    /**
     * Group workflows by name for analytics
     */
    static groupWorkflowsByName(workflows: WorkflowSummary[]): Record<string, WorkflowSummary[]> {
        return workflows.reduce((groups, workflow) => {
            const name = workflow.workflowName || 'Unknown';
            if (!groups[name]) {
                groups[name] = [];
            }
            groups[name].push(workflow);
            return groups;
        }, {} as Record<string, WorkflowSummary[]>);
    }

    /**
     * Calculate workflow efficiency metrics
     */
    static calculateEfficiencyMetrics(workflow: WorkflowSummary): {
        costPerToken: number;
        costPerStep: number;
        avgResponseTime: number;
        efficiency: 'High' | 'Medium' | 'Low';
    } {
        const costPerToken = workflow.totalTokens > 0 ? workflow.totalCost / workflow.totalTokens : 0;
        const costPerStep = workflow.requestCount > 0 ? workflow.totalCost / workflow.requestCount : 0;
        const avgResponseTime = workflow.steps.reduce((sum, step) => sum + step.responseTime, 0) / workflow.steps.length;
        
        // Simple efficiency calculation based on cost per token
        let efficiency: 'High' | 'Medium' | 'Low' = 'Medium';
        if (costPerToken < 0.00001) efficiency = 'High';
        else if (costPerToken > 0.0001) efficiency = 'Low';
        
        return {
            costPerToken,
            costPerStep,
            avgResponseTime,
            efficiency
        };
    }

    /**
     * Export workflows to CSV format
     */
    static exportToCSV(workflows: WorkflowSummary[]): string {
        const headers = [
            'Workflow ID',
            'Workflow Name', 
            'Start Time',
            'End Time',
            'Duration (ms)',
            'Total Cost ($)',
            'Total Tokens',
            'Request Count',
            'Average Cost per Request ($)',
            'Steps'
        ];

        const rows = workflows.map(workflow => [
            workflow.workflowId,
            workflow.workflowName,
            new Date(workflow.startTime).toISOString(),
            new Date(workflow.endTime).toISOString(),
            workflow.duration.toString(),
            workflow.totalCost.toFixed(6),
            workflow.totalTokens.toString(),
            workflow.requestCount.toString(),
            workflow.averageCost.toFixed(6),
            workflow.steps.map(step => `${step.step} (${step.cost.toFixed(6)}$)`).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }
}