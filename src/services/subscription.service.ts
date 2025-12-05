import { apiClient } from '../config/api';
import {
  Subscription,
  UpgradeRequest,
  CancelSubscriptionRequest,
  UsageAnalytics,
  SubscriptionHistory,
  PlanDetails,
} from '../types/subscription.types';

export class SubscriptionService {
  /**
   * Get current subscription
   */
  static async getSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.get('/user/subscription');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Upgrade subscription
   */
  static async upgradeSubscription(request: UpgradeRequest): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/upgrade', request);
      return response.data.data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Downgrade subscription
   */
  static async downgradeSubscription(
    plan: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/downgrade', {
        plan,
        cancelAtPeriodEnd,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(request: CancelSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/cancel', request);
      return response.data.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/reactivate');
      return response.data.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/pause');
      return response.data.data;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  /**
   * Resume subscription
   */
  static async resumeSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/resume');
      return response.data.data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    paymentGateway: string,
    paymentMethodToken: string
  ): Promise<Subscription> {
    try {
      const response = await apiClient.put('/user/subscription/payment-method', {
        paymentGateway,
        paymentMethodToken,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Update billing cycle
   */
  static async updateBillingCycle(interval: 'monthly' | 'yearly'): Promise<Subscription> {
    try {
      const response = await apiClient.put('/user/subscription/billing-cycle', {
        interval,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating billing cycle:', error);
      throw error;
    }
  }

  /**
   * Validate discount code (for checkout preview)
   */
  static async validateDiscountCode(
    discountCode: string,
    plan: string,
    amount: number
  ): Promise<{ code: string; type: 'percentage' | 'fixed'; amount: number; discountAmount: number; finalAmount: number }> {
    try {
      const response = await apiClient.post('/user/subscription/validate-discount', {
        code: discountCode,
        plan: plan.toLowerCase(), // Normalize to lowercase
        amount,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error validating discount code:', error);
      throw error;
    }
  }

  /**
   * Apply discount code
   */
  static async applyDiscountCode(discountCode: string): Promise<Subscription> {
    try {
      const response = await apiClient.post('/user/subscription/discount', {
        discountCode,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error applying discount code:', error);
      throw error;
    }
  }

  /**
   * Get available plans
   */
  static async getAvailablePlans(): Promise<PlanDetails[]> {
    try {
      const response = await apiClient.get('/user/subscription/plans');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available plans:', error);
      throw error;
    }
  }

  /**
   * Get usage analytics
   */
  static async getUsageAnalytics(): Promise<UsageAnalytics> {
    try {
      const response = await apiClient.get('/user/subscription/usage');
      const data = response.data.data;
      
      // Ensure the response has the expected structure with safe defaults
      return {
        tokens: {
          used: data.tokens?.used || 0,
          limit: data.tokens?.limit ?? -1,
          percentage: data.tokens?.percentage || 0,
          dates: data.tokens?.dates || [],
          trend: data.tokens?.trend || [],
        },
        requests: {
          used: data.requests?.used || 0,
          limit: data.requests?.limit ?? -1,
          percentage: data.requests?.percentage || 0,
          dates: data.requests?.dates || [],
          trend: data.requests?.trend || [],
        },
        logs: {
          used: data.logs?.used || 0,
          limit: data.logs?.limit ?? -1,
          percentage: data.logs?.percentage || 0,
          dates: data.logs?.dates || [],
          trend: data.logs?.trend || [],
        },
        workflows: {
          used: data.workflows?.used || 0,
          limit: data.workflows?.limit ?? -1,
          percentage: data.workflows?.percentage || 0,
        },
        cortex: {
          used: data.cortex?.used || 0,
          limit: data.cortex?.limit ?? -1,
          percentage: data.cortex?.percentage || 0,
          resetDate: data.cortex?.resetDate || new Date().toISOString(),
        },
        projectedUsage: data.projectedUsage || {
          tokens: 0,
          requests: 0,
          logs: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   */
  static async getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
    try {
      const response = await apiClient.get('/user/subscription/history');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }

  /**
   * Get current user's spending summary
   */
  static async getUserSpendingSummary(params?: {
    startDate?: string;
    endDate?: string;
    service?: string;
    model?: string;
    projectId?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.service) queryParams.append('service', params.service);
      if (params?.model) queryParams.append('model', params.model);
      if (params?.projectId) queryParams.append('projectId', params.projectId);

      const response = await apiClient.get(`/user/spending?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user spending summary:', error);
      throw error;
    }
  }
}

