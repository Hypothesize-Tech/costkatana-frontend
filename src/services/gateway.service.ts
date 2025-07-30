import { apiClient } from '../config/api';

export interface GatewayStats {
    cacheSize: number;
    uptime: number;
    memoryUsage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
    };
    timestamp: string;
}

export interface FirewallAnalytics {
    totalRequests: number;
    blockedRequests: number;
    costSaved: number;
    threatsByCategory: Record<string, number>;
    savingsByThreatType: Record<string, number>;
}

export interface GatewayAnalytics {
    summary: {
        totalRequests: number;
        totalCost: number;
        cacheHitRate: number;
        averageLatency: number;
        errorRate: number;
        cost_savings: number;
    };
    timeline: Array<{
        date: string;
        requests: number;
        cost: number;
        cacheHits: number;
        cacheMisses: number;
        errors: number;
        averageLatency: number;
    }>;
    providerBreakdown: Array<{
        provider: string;
        requests: number;
        cost: number;
        percentage: number;
        averageLatency: number;
        errorRate: number;
    }>;
    featuresUsage: Array<{
        feature: string;
        count: number;
        percentage: number;
        cost_impact: number;
    }>;
    topProperties: Array<{
        property: string;
        value: string;
        count: number;
        cost: number;
        percentage: number;
    }>;
    cacheMetrics: {
        hitRate: number;
        missRate: number;
        totalHits: number;
        totalMisses: number;
        savingsFromCache: number;
    };
    budgetUtilization: Array<{
        budgetId: string;
        budgetName: string;
        utilized: number;
        total: number;
        percentage: number;
    }>;
}

export class GatewayService {
    /**
     * Get gateway health status
     */
    static async getHealth(): Promise<{ status: string; service: string; timestamp: string; version: string; cacheSize: number }> {
        try {
            const response = await apiClient.get('/gateway/health');
            return response.data;
        } catch (error) {
            console.error('Error fetching gateway health:', error);
            // Return default health status instead of throwing to prevent logout
            return {
                status: 'offline',
                service: 'CostKATANA Gateway',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                cacheSize: 0
            };
        }
    }

    /**
     * Get gateway statistics
     */
    static async getStats(): Promise<{ success: boolean; data: GatewayStats }> {
        try {
            const response = await apiClient.get('/gateway/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching gateway stats:', error);
            // Return default stats instead of throwing to prevent logout
            return {
                success: false,
                data: {
                    cacheSize: 0,
                    uptime: 0,
                    memoryUsage: {
                        rss: 0,
                        heapTotal: 0,
                        heapUsed: 0,
                        external: 0,
                        arrayBuffers: 0
                    },
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Get firewall analytics data
     */
    static async getFirewallAnalytics(params?: {
        userId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<FirewallAnalytics> {
        try {
            const response = await apiClient.get('/gateway/firewall/analytics', {
                params
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching firewall analytics:', error);
            // Return default structure if error
            return {
                totalRequests: 0,
                blockedRequests: 0,
                costSaved: 0,
                threatsByCategory: {},
                savingsByThreatType: {}
            };
        }
    }

    /**
     * Get gateway analytics data
     */
    static async getAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        projectId?: string;
        provider?: string;
    }): Promise<GatewayAnalytics> {
        try {
            // Since gateway analytics are tracked through the regular usage tracking,
            // we'll query the analytics endpoint with gateway-specific filters
            const response = await apiClient.get('/analytics', {
                params: {
                    ...params,
                    source: 'gateway', // Filter for gateway requests
                    includeMetadata: true
                }
            });
            
            const data = response.data.data || response.data;
            
            // Transform regular analytics data to gateway-specific format
            return this.transformToGatewayAnalytics(data);
        } catch (error) {
            console.error('Error fetching gateway analytics:', error);
            // Return default structure if error
            return this.getDefaultGatewayAnalytics();
        }
    }

    /**
     * Transform regular analytics data to gateway-specific format
     */
    private static transformToGatewayAnalytics(data: any): GatewayAnalytics {
        
        // Use the actual data structure from the API response
        const summary = data.summary || {};
        const timeline = data.timeline || [];
        const breakdown = data.breakdown || {};
        const projectBreakdown = data.projectBreakdown || [];
        
        const totalRequests = summary.totalRequests || 0;
        const totalCost = summary.totalCost || 0;
        
        // Calculate cache metrics (estimate based on cost patterns)
        const cacheHitRate = 0; // We'll need to calculate this from actual cache data
        const averageLatency = 0; // We'll need to calculate this from actual latency data
        const errorRate = 0; // We'll need to calculate this from actual error data
        
        // Provider breakdown from actual data
        const providerBreakdown = (breakdown.services || []).map((service: any) => ({
            provider: service.service,
            requests: service.totalRequests || 0,
            cost: service.totalCost || 0,
            percentage: totalRequests > 0 ? ((service.totalRequests || 0) / totalRequests) * 100 : 0,
            averageLatency: 0, // Not available in current data
            errorRate: 0 // Not available in current data
        }));
        
        // Features usage (estimate based on available data)
        const featuresUsage = [
            {
                feature: 'AWS Bedrock',
                count: (breakdown.services || []).find((s: any) => s.service === 'aws-bedrock')?.totalRequests || 0,
                percentage: totalRequests > 0 ? 
                    ((breakdown.services || []).find((s: any) => s.service === 'aws-bedrock')?.totalRequests || 0) / totalRequests * 100 : 0,
                cost_impact: (breakdown.services || []).find((s: any) => s.service === 'aws-bedrock')?.totalCost || 0
            },
            {
                feature: 'OpenAI',
                count: (breakdown.services || []).find((s: any) => s.service === 'openai')?.totalRequests || 0,
                percentage: totalRequests > 0 ? 
                    ((breakdown.services || []).find((s: any) => s.service === 'openai')?.totalRequests || 0) / totalRequests * 100 : 0,
                cost_impact: (breakdown.services || []).find((s: any) => s.service === 'openai')?.totalCost || 0
            },
            {
                feature: 'Budget Control',
                count: projectBreakdown.length,
                percentage: totalRequests > 0 ? (projectBreakdown.length / totalRequests) * 100 : 0,
                cost_impact: projectBreakdown.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0)
            }
        ];
        
        // Timeline data
        const timelineData = timeline.map((item: any) => ({
            date: item.date,
            requests: item.calls || 0,
            cost: item.cost || 0,
            cacheHits: 0, // Not available in current data
            cacheMisses: 0, // Not available in current data
            errors: 0, // Not available in current data
            averageLatency: 0 // Not available in current data
        }));
        
        // Top properties (from project breakdown)
        const topProperties = projectBreakdown.map((project: any) => ({
            property: 'Project',
            value: project.projectName || project.projectId,
            count: project.totalRequests || 0,
            cost: project.totalCost || 0,
            percentage: totalRequests > 0 ? ((project.totalRequests || 0) / totalRequests) * 100 : 0
        }));
        
        return {
            summary: {
                totalRequests,
                totalCost,
                cacheHitRate,
                averageLatency,
                errorRate,
                cost_savings: 0 // We'll need to calculate this from actual cache data
            },
            timeline: timelineData,
            providerBreakdown,
            featuresUsage,
            topProperties,
            cacheMetrics: {
                hitRate: cacheHitRate,
                missRate: 100 - cacheHitRate,
                totalHits: 0,
                totalMisses: 0,
                savingsFromCache: 0
            },
            budgetUtilization: projectBreakdown.map((project: any) => ({
                budgetId: project.projectId,
                budgetName: project.projectName || project.projectId,
                utilized: project.totalCost || 0,
                total: 0, // We'll need to get this from project data
                percentage: 0 // We'll need to calculate this
            }))
        };
    }

    /**
     * Get default gateway analytics structure
     */
    private static getDefaultGatewayAnalytics(): GatewayAnalytics {
        return {
            summary: {
                totalRequests: 0,
                totalCost: 0,
                cacheHitRate: 0,
                averageLatency: 0,
                errorRate: 0,
                cost_savings: 0
            },
            timeline: [],
            providerBreakdown: [],
            featuresUsage: [
                { feature: 'Caching', count: 0, percentage: 0, cost_impact: 0 },
                { feature: 'Retry Logic', count: 0, percentage: 0, cost_impact: 0 },
                { feature: 'Budget Control', count: 0, percentage: 0, cost_impact: 0 }
            ],
            topProperties: [],
            cacheMetrics: {
                hitRate: 0,
                missRate: 0,
                totalHits: 0,
                totalMisses: 0,
                savingsFromCache: 0
            },
            budgetUtilization: []
        };
    }
}