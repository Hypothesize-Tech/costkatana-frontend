// src/services/alert.service.ts
import api from '../config/api';
import { Alert, PaginatedResponse } from '../types';

class AlertService {
    async getAlerts(params?: {
        page?: number;
        limit?: number;
        type?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        read?: boolean;
        startDate?: string;
        endDate?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Alert>> {
        const response = await api.get('/users/alerts', { params });
        return response.data;
    }

    async getAlert(id: string): Promise<{
        success: boolean;
        data: Alert;
    }> {
        const response = await api.get(`/users/alerts/${id}`);
        return response.data;
    }

    async markAsRead(id: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.put(`/users/alerts/${id}/read`);
        return response.data;
    }

    async markAllAsRead(): Promise<{
        success: boolean;
        message: string;
        updated: number;
    }> {
        const response = await api.put('/users/alerts/read-all');
        return response.data;
    }

    async deleteAlert(id: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.delete(`/users/alerts/${id}`);
        return response.data;
    }

    async getAlertSettings(): Promise<{
        success: boolean;
        data: {
            email: {
                costAlerts: boolean;
                optimizationSuggestions: boolean;
                weeklyReports: boolean;
                monthlyReports: boolean;
                anomalyDetection: boolean;
            };
            push: {
                costAlerts: boolean;
                optimizationSuggestions: boolean;
                anomalyDetection: boolean;
            };
            thresholds: {
                dailyCostLimit: number;
                weeklyCostLimit: number;
                monthlyCostLimit: number;
                anomalyPercentage: number;
            };
        };
    }> {
        const response = await api.get('/users/alerts/settings');
        return response.data;
    }

    async updateAlertSettings(settings: any): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.put('/users/alerts/settings', settings);
        return response.data;
    }

    async testAlert(type: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.post('/users/alerts/test', { type });
        return response.data;
    }

    async getUnreadCount(): Promise<{
        success: boolean;
        data: {
            count: number;
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
    }> {
        const response = await api.get('/users/alerts/unread-count');
        return response.data;
    }

    async snoozeAlert(id: string, until: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.put(`/users/alerts/${id}/snooze`, { until });
        return response.data;
    }

    async getAlertHistory(params?: {
        page?: number;
        limit?: number;
        groupBy?: 'day' | 'week' | 'month';
    }): Promise<{
        success: boolean;
        data: {
            history: Array<{
                date: string;
                counts: {
                    total: number;
                    costAlerts: number;
                    optimizations: number;
                    anomalies: number;
                    system: number;
                };
                totalCostImpact: number;
            }>;
            summary: {
                totalAlerts: number;
                avgPerDay: number;
                mostCommonType: string;
                totalCostImpact: number;
            };
        };
    }> {
        const response = await api.get('/users/alerts/history', { params });
        return response.data;
    }
}

export const alertService = new AlertService();