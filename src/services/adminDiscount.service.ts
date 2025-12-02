import { apiClient } from '../config/api';

export interface Discount {
    _id: string;
    code: string;
    type: 'percentage' | 'fixed';
    amount: number;
    validFrom: string;
    validUntil: string;
    maxUses: number;
    currentUses: number;
    applicablePlans: Array<'free' | 'plus' | 'pro' | 'enterprise'>;
    minAmount?: number;
    userId?: string;
    isActive: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
    usageStats?: {
        totalUses: number;
        uniqueUsers: number;
    };
}

export interface DiscountUsageStats {
    totalUses: number;
    uniqueUsers: number;
    totalDiscountAmount: number;
    averageDiscountAmount: number;
    usageByPlan: Record<string, number>;
    usageOverTime: Array<{
        date: string;
        count: number;
    }>;
    recentUsers: Array<{
        userId: string;
        userEmail: string;
        appliedAt: string;
        discountAmount: number;
        plan: string;
    }>;
}

export interface DiscountFilters {
    page?: number;
    limit?: number;
    isActive?: boolean;
    type?: 'percentage' | 'fixed';
    search?: string;
    plan?: string;
}

export interface DiscountsResponse {
    discounts: Discount[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    filters: Record<string, any>;
}

export interface CreateDiscountData {
    code: string;
    type: 'percentage' | 'fixed';
    amount: number;
    validFrom?: string;
    validUntil?: string;
    maxUses?: number;
    applicablePlans?: Array<'free' | 'plus' | 'pro' | 'enterprise'>;
    minAmount?: number;
    userId?: string;
    isActive?: boolean;
    description?: string;
}

export class AdminDiscountService {
    /**
     * Get all discounts with pagination and filters
     */
    static async getDiscounts(filters: DiscountFilters = {}): Promise<DiscountsResponse> {
        try {
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
            if (filters.plan) params.append('plan', filters.plan);

            const response = await apiClient.get(`/admin/discounts?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching discounts:', error);
            throw error;
        }
    }

    /**
     * Get single discount by ID
     */
    static async getDiscount(id: string): Promise<Discount> {
        try {
            const response = await apiClient.get(`/admin/discounts/${id}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching discount:', error);
            throw error;
        }
    }

    /**
     * Create new discount
     */
    static async createDiscount(data: CreateDiscountData): Promise<Discount> {
        try {
            const response = await apiClient.post('/admin/discounts', data);
            return response.data.data;
        } catch (error: any) {
            console.error('Error creating discount:', error);
            throw error;
        }
    }

    /**
     * Update existing discount
     */
    static async updateDiscount(id: string, data: Partial<CreateDiscountData>): Promise<Discount> {
        try {
            const response = await apiClient.put(`/admin/discounts/${id}`, data);
            return response.data.data;
        } catch (error: any) {
            console.error('Error updating discount:', error);
            throw error;
        }
    }

    /**
     * Delete discount
     */
    static async deleteDiscount(id: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/discounts/${id}`);
        } catch (error: any) {
            console.error('Error deleting discount:', error);
            throw error;
        }
    }

    /**
     * Get usage statistics for a discount
     */
    static async getDiscountUsage(id: string): Promise<DiscountUsageStats> {
        try {
            const response = await apiClient.get(`/admin/discounts/${id}/usage`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching discount usage:', error);
            throw error;
        }
    }

    /**
     * Bulk activate discounts
     */
    static async bulkActivate(ids: string[]): Promise<{ modifiedCount: number }> {
        try {
            const response = await apiClient.post('/admin/discounts/bulk-activate', { ids });
            return response.data.data;
        } catch (error: any) {
            console.error('Error bulk activating discounts:', error);
            throw error;
        }
    }

    /**
     * Bulk deactivate discounts
     */
    static async bulkDeactivate(ids: string[]): Promise<{ modifiedCount: number }> {
        try {
            const response = await apiClient.post('/admin/discounts/bulk-deactivate', { ids });
            return response.data.data;
        } catch (error: any) {
            console.error('Error bulk deactivating discounts:', error);
            throw error;
        }
    }

    /**
     * Bulk delete discounts
     */
    static async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
        try {
            const response = await apiClient.post('/admin/discounts/bulk-delete', { ids });
            return response.data.data;
        } catch (error: any) {
            console.error('Error bulk deleting discounts:', error);
            throw error;
        }
    }
}

