import { apiClient } from '../config/api';
import {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
    ProjectDashboard,
    ProjectActivity,
    BudgetAlert,
    ProjectStats
} from '../types/project.types';

export class ProjectService {
    private static baseUrl = '/projects';

    /**
     * Create a new project
     */
    static async createProject(projectData: CreateProjectRequest): Promise<Project> {
        const response = await apiClient.post(this.baseUrl, projectData);
        return response.data.data;
    }

    /**
     * Get user's projects
     */
    static async getUserProjects(): Promise<Project[]> {
        const response = await apiClient.get(this.baseUrl);
        return response.data.data;
    }

    /**
     * Get a specific project
     */
    static async getProject(projectId: string): Promise<Project> {
        const response = await apiClient.get(`${this.baseUrl}/${projectId}`);
        return response.data.data;
    }

    /**
     * Update project
     */
    static async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<Project> {
        const response = await apiClient.put(`${this.baseUrl}/${projectId}`, updates);
        return response.data.data;
    }

    /**
     * Delete project
     */
    static async deleteProject(projectId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${projectId}`);
    }

    /**
     * Recalculate all user project spending
     */
    static async recalculateAllUserProjectSpending(): Promise<void> {
        await apiClient.post(`${this.baseUrl}/recalculate-all-spending`);
    }

    /**
     * Recalculate project spending from Usage data
     */
    static async recalculateProjectSpending(projectId: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${projectId}/recalculate-spending`);
    }

    /**
     * Get project analytics
     */
    static async getProjectAnalytics(projectId: string, period?: string): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/${projectId}/analytics`, {
            params: { period }
        });
        return response.data.data;
    }

    /**
     * Add member to project
     */
    static async addMember(projectId: string, email: string, role: string = 'member'): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${projectId}/members`, { email, role });
    }

    /**
     * Remove member from project
     */
    static async removeMember(projectId: string, userId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${projectId}/members/${userId}`);
    }

    /**
     * Update project members (bulk update)
     */
    static async updateProjectMembers(projectId: string, members: any[]): Promise<Project> {
        const response = await apiClient.put(`${this.baseUrl}/${projectId}/members`, { members });
        return response.data.data;
    }

    /**
     * Get cost allocation
     */
    static async getCostAllocation(projectId: string, options: {
        groupBy?: string;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/${projectId}/cost-allocation`, {
            params: options
        });
        return response.data.data;
    }

    /**
     * Export project data
     */
    static async exportProjectData(
        projectId: string,
        options: {
            format?: 'csv' | 'json' | 'excel';
            startDate?: string;
            endDate?: string;
        } = {}
    ): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/${projectId}/export`, {
            params: options,
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get approval requests
     */
    static async getApprovalRequests(projectId: string, status?: string): Promise<any[]> {
        const response = await apiClient.get(`${this.baseUrl}/${projectId}/approvals`, {
            params: { status }
        });
        return response.data.data;
    }

    /**
     * Handle approval request
     */
    static async handleApprovalRequest(
        requestId: string,
        action: 'approve' | 'reject',
        comments?: string
    ): Promise<void> {
        await apiClient.post(`${this.baseUrl}/approvals/${requestId}`, {
            action,
            comments
        });
    }

    // Legacy method for compatibility - use getUserProjects instead
    static async getProjects(): Promise<Project[]> {
        try {
            return await ProjectService.getUserProjects();
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    }

    // Additional helper methods that don't exist in backend but are used by frontend
    static async getProjectDashboard(projectId: string): Promise<ProjectDashboard> {
        // Use analytics endpoint for dashboard data
        const analytics = await this.getProjectAnalytics(projectId);

        // Transform analytics data to dashboard format
        return {
            project: await this.getProject(projectId),
            recentActivity: analytics.recentActivity || [],
            costTrends: analytics.timeline?.map((item: any) => ({
                date: item.date,
                amount: item.cost
            })) || [],
            memberActivity: [] // Would be populated from member usage data
        };
    }

    static async getProjectActivity(
        projectId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ activities: ProjectActivity[]; total: number; page: number; totalPages: number }> {
        // Use usage endpoint to get activity data
        try {
            const response = await apiClient.get('/usage', {
                params: {
                    projectId,
                    page,
                    limit,
                    sort: 'createdAt',
                    order: 'desc'
                }
            });

            const usageData = response.data.data;
            const activities: ProjectActivity[] = usageData.map((usage: any) => ({
                id: usage._id,
                type: 'api_request',
                description: `${usage.service} - ${usage.model}`,
                timestamp: usage.createdAt,
                cost: usage.cost,
                metadata: {
                    service: usage.service,
                    model: usage.model,
                    tokens: usage.totalTokens
                }
            }));

            return {
                activities,
                total: response.data.total || activities.length,
                page,
                totalPages: Math.ceil((response.data.total || activities.length) / limit)
            };
        } catch (error) {
            console.error('Error fetching project activity:', error);
            return {
                activities: [],
                total: 0,
                page,
                totalPages: 0
            };
        }
    }

    static async getProjectAlerts(projectId: string): Promise<BudgetAlert[]> {
        // Budget alerts would be part of project data or user alerts
        try {
            const project = await this.getProject(projectId);
            // Transform budget alerts from project data
            return project.budget?.alerts?.map((alert: any, index: number) => ({
                _id: `${projectId}-alert-${index}`,
                projectId: projectId,
                type: 'threshold_reached' as const,
                message: `Budget alert at ${alert.threshold}% threshold`,
                threshold: alert.threshold,
                currentSpending: project.spending?.current || 0,
                createdAt: new Date().toISOString(),
                acknowledged: false
            })) || [];
        } catch (error) {
            console.error('Error fetching project alerts:', error);
            return [];
        }
    }

    static async acknowledgeAlert(_projectId: string, _alertId: string): Promise<void> {
        // This would typically be handled by the alerts system
        console.warn('acknowledgeAlert not implemented - would use alerts endpoint');
    }

    static async updateMemberRole(projectId: string, userId: string, role: string): Promise<void> {
        // Get current members and update the specific user's role
        const project = await this.getProject(projectId);
        const updatedMembers = project.members.map(member =>
            member.userId === userId ? { ...member, role } : member
        );
        await this.updateProjectMembers(projectId, updatedMembers);
    }

    static async getProjectStats(): Promise<ProjectStats> {
        // Get all projects and calculate stats
        const projects = await this.getUserProjects();

        return {
            totalProjects: projects.length,
            totalBudget: projects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0),
            totalSpent: projects.reduce((sum, p) => sum + (p.spending?.current || 0), 0),
            averageSpending: projects.length > 0
                ? projects.reduce((sum, p) => sum + (p.spending?.current || 0), 0) / projects.length
                : 0,
            projectsOverBudget: projects.filter(p =>
                p.budget?.amount && p.spending?.current && p.spending.current > p.budget.amount
            ).length
        };
    }

    static async getProjectCostTrends(
        projectId: string,
        period: 'week' | 'month' | 'quarter' | 'year' = 'month'
    ): Promise<{ date: string; amount: number }[]> {
        const analytics = await this.getProjectAnalytics(projectId, period);
        return analytics.timeline?.map((item: any) => ({
            date: item.date,
            amount: item.cost
        })) || [];
    }

    static async searchProjects(query: string): Promise<Project[]> {
        const projects = await this.getUserProjects();
        return projects.filter(project =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description?.toLowerCase().includes(query.toLowerCase())
        );
    }

    static async getProjectUsage(
        projectId: string,
        _startDate?: string,
        _endDate?: string
    ): Promise<{
        totalCalls: number;
        totalTokens: number;
        totalCost: number;
        breakdown: {
            service: string;
            calls: number;
            tokens: number;
            cost: number;
        }[];
    }> {
        const analytics = await this.getProjectAnalytics(projectId);

        return {
            totalCalls: analytics.summary?.totalRequests || 0,
            totalTokens: analytics.summary?.totalTokens || 0,
            totalCost: analytics.summary?.totalCost || 0,
            breakdown: analytics.breakdown?.services?.map((service: any) => ({
                service: service.service,
                calls: service.requests,
                tokens: service.tokens,
                cost: service.cost
            })) || []
        };
    }

    static async updateBudget(
        projectId: string,
        budget: {
            amount: number;
            period: 'monthly' | 'yearly';
            alerts: {
                enabled: boolean;
                thresholds: number[];
            };
        }
    ): Promise<Project> {
        // Transform the budget structure to match the expected ProjectBudget type
        const transformedBudget = {
            amount: budget.amount,
            period: budget.period,
            alerts: budget.alerts.enabled ? budget.alerts.thresholds.map(threshold => ({
                threshold,
                type: 'email' as const,
                recipients: [],
                enabled: true
            })) : []
        };

        return await this.updateProject(projectId, { budget: transformedBudget });
    }

    static async getProjectTemplates(projectId: string): Promise<any[]> {
        // This would use the prompt templates endpoint
        try {
            const response = await apiClient.get('/prompt-templates', {
                params: { projectId }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching project templates:', error);
            return [];
        }
    }

    static async cloneProject(projectId: string, name: string): Promise<Project> {
        const originalProject = await this.getProject(projectId);

        // Transform the project data to match CreateProjectRequest structure
        const cloneData: CreateProjectRequest = {
            name,
            description: originalProject.description,
            budget: {
                amount: originalProject.budget.amount,
                // Convert unsupported periods to supported ones
                period: originalProject.budget.period === 'quarterly' || originalProject.budget.period === 'one-time'
                    ? 'monthly'
                    : originalProject.budget.period,
                alerts: {
                    enabled: originalProject.budget.alerts.length > 0,
                    thresholds: originalProject.budget.alerts.map(alert => alert.threshold)
                }
            },
            members: originalProject.members.map(member => member.email),
            tags: originalProject.tags,
            settings: {
                costOptimization: {
                    enabled: originalProject.settings.costOptimization.enabled,
                    autoApply: originalProject.settings.costOptimization.autoApply,
                    strategies: originalProject.settings.costOptimization.strategies
                },
                notifications: {
                    budgetAlerts: originalProject.settings.notifications.budgetAlerts,
                    weeklyReports: originalProject.settings.notifications.weeklyReports,
                    monthlyReports: originalProject.settings.notifications.monthlyReports
                }
            }
        };

        return await this.createProject(cloneData);
    }

    static async archiveProject(projectId: string): Promise<void> {
        await this.updateProject(projectId, {
            isActive: false,
            status: 'archived'
        });
    }

    static async restoreProject(projectId: string): Promise<void> {
        await this.updateProject(projectId, {
            isActive: true,
            status: 'active'
        });
    }
} 