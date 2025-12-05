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
      // Convert page to offset for backend API
      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const offset = (page - 1) * limit;
      
      const queryParams: Record<string, string | number> = {
        limit,
        offset,
      };
      
      if (params?.status) {
        queryParams.status = params.status;
      }
      
      const response = await apiClient.get('/billing/invoices', { params: queryParams });
      
      // Transform response to match expected format
      const data = response.data.data;
      
      // Transform invoices to map _id to id and ensure all fields are present
      // Create clean objects without circular references to avoid Sentry sanitization issues
      const transformedInvoices = (data.invoices || []).map((invoice: Record<string, unknown>) => {
        const userIdObj = invoice.userId as { _id?: string } | string | undefined;
        const subscriptionIdObj = invoice.subscriptionId as { _id?: string } | string | undefined;
        const paymentMethodUsed = invoice.paymentMethodUsed as Record<string, unknown> | undefined;
        
        // Create a clean invoice object with only the fields we need
        // This avoids circular references from Mongoose documents
        const cleanInvoice: Record<string, unknown> = {
          id: (invoice._id as string) || (invoice.id as string) || '',
          userId: typeof userIdObj === 'object' && userIdObj?._id 
            ? userIdObj._id 
            : (userIdObj as string) || '',
          subscriptionId: typeof subscriptionIdObj === 'object' && subscriptionIdObj?._id 
            ? subscriptionIdObj._id 
            : (subscriptionIdObj as string) || '',
          invoiceNumber: invoice.invoiceNumber as string || '',
          status: invoice.status as string || 'pending',
          subtotal: invoice.subtotal as number || 0,
          tax: invoice.tax as number || 0,
          discount: invoice.discount as number || 0,
          total: (invoice.total as number) || (invoice.amount as number) || 0,
          amount: (invoice.total as number) || (invoice.amount as number) || 0,
          currency: invoice.currency as string || 'USD',
          lineItems: Array.isArray(invoice.lineItems) ? invoice.lineItems.map((item: Record<string, unknown>) => {
            // Handle both 'total' and 'amount' fields for line items
            const itemTotal = (item.total as number) || (item.amount as number) || 0;
            const itemQuantity = (item.quantity as number) || 1;
            const itemUnitPrice = (item.unitPrice as number) || 0;
            
            return {
              description: item.description as string || '',
              quantity: itemQuantity,
              unitPrice: itemUnitPrice,
              total: itemTotal || (itemQuantity * itemUnitPrice), // Calculate if missing
              amount: itemTotal || (itemQuantity * itemUnitPrice), // Also set amount for compatibility
              type: item.type as string || 'other',
              metadata: item.metadata || {},
            };
          }) : [],
          paymentDate: invoice.paymentDate ? (invoice.paymentDate as string) : undefined,
          dueDate: invoice.dueDate as string || new Date().toISOString(),
          paymentGateway: invoice.paymentGateway as string | null || null,
          gatewayTransactionId: invoice.gatewayTransactionId ? (invoice.gatewayTransactionId as string) : undefined,
          periodStart: invoice.periodStart ? (invoice.periodStart as string) : new Date().toISOString(),
          periodEnd: invoice.periodEnd ? (invoice.periodEnd as string) : new Date().toISOString(),
          createdAt: (invoice.createdAt as string) || new Date().toISOString(),
          updatedAt: (invoice.updatedAt as string) || new Date().toISOString(),
        };
        
        // Add paymentMethodUsed if it exists (clean it too)
        if (paymentMethodUsed) {
          cleanInvoice.paymentMethodUsed = {
            paymentGateway: paymentMethodUsed.paymentGateway as string || '',
            paymentMethodId: paymentMethodUsed.paymentMethodId as string || '',
            lastFour: paymentMethodUsed.lastFour as string | undefined,
            brand: paymentMethodUsed.brand as string | undefined,
          };
        }
        
        return cleanInvoice;
      });
      
      
      return {
        invoices: transformedInvoices,
        total: data.pagination?.total || 0,
        page: page,
        limit: limit,
      };
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
    updates: Partial<PaymentMethod> | { setAsDefault?: boolean }
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
   * Save Razorpay payment method after successful checkout
   */
  static async saveRazorpayPaymentMethod(
    paymentId: string,
    orderId: string,
    signature: string,
    setAsDefault: boolean = false
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/billing/payment-methods/razorpay/save', {
        paymentId,
        orderId,
        signature,
        setAsDefault,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error saving Razorpay payment method:', error);
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
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment config:', error);
      throw error;
    }
  }
}

