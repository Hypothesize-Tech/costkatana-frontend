export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'paused';
export type BillingInterval = 'monthly' | 'yearly';
export type PaymentGateway = 'stripe' | 'razorpay' | 'paypal' | 'none';

export interface SubscriptionLimits {
  tokensPerMonth: number;
  requestsPerMonth: number;
  logsPerMonth: number;
  projects: number;
  workflows: number;
  seats: number;
  cortexDailyUsage: number;
}

export interface SubscriptionUsage {
  tokensUsed: number;
  requestsUsed: number;
  logsUsed: number;
  projectsUsed: number;
  workflowsUsed: number;
  cortexDailyUsage: number;
  lastResetDate: string;
}

export interface SubscriptionBilling {
  amount: number;
  currency: string;
  interval: BillingInterval;
  nextBillingDate?: string;
  billingCycleAnchor?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  proratedAmount?: number;
}

export interface SubscriptionPaymentMethod {
  paymentGateway: PaymentGateway;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  paypalAgreementId?: string;
  paymentMethodId?: string;
  lastFour?: string;
  brand?: string;
  expiresAt?: string;
}

export interface SubscriptionDiscount {
  discountCode?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  appliedAt?: string;
  expiresAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  trialStart?: string;
  trialEnd?: string;
  isTrial: boolean;
  billing: SubscriptionBilling;
  paymentMethod?: SubscriptionPaymentMethod;
  discount?: SubscriptionDiscount;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  allowedModels: string[];
  features: string[];
  gracePeriodEnd?: string;
  gracePeriodReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStatus {
  paid: 'paid';
  pending: 'pending';
  failed: 'failed';
  refunded: 'refunded';
  voided: 'voided';
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'plan_fee' | 'overage' | 'discount' | 'proration' | 'tax';
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: keyof InvoiceStatus;
  amount: number;
  currency: string;
  tax: number;
  subtotal: number;
  total: number;
  lineItems: InvoiceLineItem[];
  paymentDate?: string;
  dueDate: string;
  paymentMethodUsed?: {
    paymentGateway: PaymentGateway;
    paymentMethodId: string;
    lastFour?: string;
    brand?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  paymentGateway: PaymentGateway;
  gatewayCustomerId: string;
  paymentMethodId: string;
  type: 'card' | 'paypal' | 'upi';
  cardDetails?: {
    brand: string;
    lastFour: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  id: string;
  userId: string;
  subscriptionId: string;
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate' | 'pause' | 'resume' | 'payment_method_update' | 'billing_cycle_update' | 'trial_started' | 'trial_ended' | 'plan_renewed' | 'payment_failed' | 'payment_succeeded' | 'discount_applied' | 'admin_change';
  oldPlan?: SubscriptionPlan;
  newPlan?: SubscriptionPlan;
  oldStatus?: SubscriptionStatus;
  newStatus?: SubscriptionStatus;
  changedBy: 'user' | 'admin' | 'system';
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UsageAnalytics {
  tokens: {
    used: number;
    limit: number;
    percentage: number;
    trend: number[];
    dates: string[];
  };
  requests: {
    used: number;
    limit: number;
    percentage: number;
    trend: number[];
    dates: string[];
  };
  logs: {
    used: number;
    limit: number;
    percentage: number;
    trend: number[];
    dates: string[];
  };
  workflows: {
    used: number;
    limit: number;
    percentage: number;
  };
  cortex: {
    used: number;
    limit: number;
    percentage: number;
    resetDate: string;
  };
  projectedUsage: {
    tokens: number;
    requests: number;
    logs: number;
  };
}

export interface UsageAlert {
  metric: 'tokens' | 'requests' | 'logs' | 'workflows' | 'cortex';
  threshold: number;
  currentUsage: number;
  limit: number;
  message: string;
  severity: 'warning' | 'critical';
}

export interface PlanDetails {
  name: SubscriptionPlan;
  displayName: string;
  price: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number;
  limits: SubscriptionLimits;
  allowedModels: string[];
  features: string[];
  overage?: {
    tokensPerMillion: number;
    seatsPerUser: number;
  };
  popular?: boolean;
}

export interface UpgradeRequest {
  plan: SubscriptionPlan;
  paymentGateway: PaymentGateway;
  paymentMethodToken?: string;
  billingInterval: BillingInterval;
  discountCode?: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
  feedback?: string;
  cancelAtPeriodEnd?: boolean;
}

