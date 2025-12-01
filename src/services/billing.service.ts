import { apiClient } from '../config/api';
import { Invoice, PaymentMethod } from '../types/subscription.types';

export class BillingService {
  /**
   * Get all invoices
   */
  static async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get('/billing/invoices', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get single invoice
   */
  static async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get(`/billing/invoices/${invoiceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Get upcoming invoice
   */
  static async getUpcomingInvoice(): Promise<Invoice | null> {
    try {
      const response = await apiClient.get('/billing/invoices/upcoming');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming invoice:', error);
      return null;
    }
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get('/billing/payment-methods');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Add payment method
   */
  static async addPaymentMethod(
    paymentGateway: string,
    paymentMethodToken: string,
    isDefault: boolean = false
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/billing/payment-methods', {
        paymentGateway,
        paymentMethodToken,
        isDefault,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    paymentMethodId: string,
    updates: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.put(`/billing/payment-methods/${paymentMethodId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Remove payment method
   */
  static async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Get payment gateway configuration (public keys)
   */
  static async getPaymentConfig(): Promise<{
    paypal?: {
      clientId: string;
      mode: string;
    };
    stripe?: {
      publishableKey: string;
      note?: string;
    };
    razorpay?: {
      keyId: string;
    };
  }> {
    try {
      // Add cache-busting query param to ensure we get fresh config
      const response = await apiClient.get('/billing/payment-config', {
        params: {
          _t: Date.now(), // Cache buster
        },
      });
      console.log('Payment config response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment config:', error);
      throw error;
    }
  }
}

