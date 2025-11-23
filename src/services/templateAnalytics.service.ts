import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api'|| 'http://localhost:8000/api';

export interface TemplateUsageFilters {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    context?: 'chat' | 'optimization' | 'visual-compliance' | 'workflow' | 'api';
    templateId?: string;
}

export interface TemplateUsageStats {
    totalTemplatesUsed: number;
    totalUsageCount: number;
    totalCostSaved: number;
    totalTokensSaved: number;
    averageTokenReduction: number;
    mostUsedTemplate: {
        id: string;
        name: string;
        usageCount: number;
    } | null;
    contextBreakdown: Array<{
        context: string;
        count: number;
        percentage: number;
    }>;
    categoryBreakdown: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
}

export interface TemplateBreakdown {
    templateId: string;
    templateName: string;
    templateCategory: string;
    usageCount: number;
    totalCost: number;
    totalTokens: number;
    averageCost: number;
    averageTokens: number;
    contextUsage: Array<{
        context: string;
        count: number;
    }>;
    recentUsages: Array<{
        date: Date;
        cost: number;
        tokens: number;
        context: string;
    }>;
    variablesUsage: Array<{
        variableName: string;
        usageCount: number;
        commonValues: string[];
    }>;
}

export interface TopTemplate {
    rank: number;
    templateId: string;
    templateName: string;
    templateCategory: string;
    usageCount: number;
    totalCost: number;
    totalTokens: number;
    averageCost: number;
    lastUsed: Date;
    costSavingsEstimate: number;
}

export interface CostSavingsReport {
    totalSavings: number;
    savingsByTemplate: Array<{
        templateId: string;
        templateName: string;
        savings: number;
        usageCount: number;
        averageSavingsPerUse: number;
    }>;
    savingsByContext: Array<{
        context: string;
        savings: number;
        percentage: number;
    }>;
    projectedMonthlySavings: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

class TemplateAnalyticsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    async getTemplateUsageOverview(filters?: TemplateUsageFilters): Promise<TemplateUsageStats> {
        try {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters?.category) params.append('category', filters.category);
            if (filters?.context) params.append('context', filters.context);
            if (filters?.templateId) params.append('templateId', filters.templateId);

            const response = await axios.get(
                `${API_BASE_URL}/templates/analytics/overview?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error fetching template usage overview:', error);
            throw error;
        }
    }

    async getTemplateBreakdown(
        templateId: string,
        filters?: Omit<TemplateUsageFilters, 'templateId'>
    ): Promise<TemplateBreakdown> {
        try {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters?.category) params.append('category', filters.category);
            if (filters?.context) params.append('context', filters.context);

            const response = await axios.get(
                `${API_BASE_URL}/templates/analytics/template/${templateId}?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error fetching template breakdown:', error);
            throw error;
        }
    }

    async getTopTemplates(
        period: '24h' | '7d' | '30d' | '90d' = '30d',
        limit: number = 10
    ): Promise<TopTemplate[]> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/templates/analytics/top?period=${period}&limit=${limit}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error fetching top templates:', error);
            throw error;
        }
    }

    async getCostSavingsReport(period: '24h' | '7d' | '30d' | '90d' = '30d'): Promise<CostSavingsReport> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/templates/analytics/cost-savings?period=${period}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error fetching cost savings report:', error);
            throw error;
        }
    }

    async getTemplatesByContext(
        context: 'chat' | 'optimization' | 'visual-compliance' | 'workflow' | 'api',
        filters?: Omit<TemplateUsageFilters, 'context'>
    ): Promise<Array<{
        templateId: string;
        templateName: string;
        templateCategory: string;
        usageCount: number;
        totalCost: number;
        averageCost: number;
    }>> {
        try {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters?.category) params.append('category', filters.category);

            const response = await axios.get(
                `${API_BASE_URL}/templates/analytics/context/${context}?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error fetching templates by context:', error);
            throw error;
        }
    }
}

export const templateAnalyticsService = new TemplateAnalyticsService();
export default templateAnalyticsService;

