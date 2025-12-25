import { useCallback } from 'react';
import { revenueService } from '../services/revenue.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * React hook for tracking revenue and subscriptions
 */
export const useRevenue = () => {
    const { user } = useAuth();

    const trackPurchase = useCallback((
        amount: number,
        properties: {
            plan: string;
            billing_cycle: 'monthly' | 'annual';
            payment_method: string;
            currency?: string;
            transaction_id: string;
            is_trial?: boolean;
            discount_code?: string;
            discount_amount?: number;
        }
    ) => {
        if (user?.id) {
            revenueService.trackPurchase(user.id, amount, properties);
        }
    }, [user?.id]);

    const trackSubscriptionStart = useCallback((
        plan: string,
        amount: number,
        properties?: {
            billing_cycle?: 'monthly' | 'annual';
            trial_days?: number;
            currency?: string;
        }
    ) => {
        if (user?.id) {
            revenueService.trackSubscriptionStart(user.id, plan, amount, properties);
        }
    }, [user?.id]);

    const trackSubscriptionRenewal = useCallback((
        amount: number,
        properties?: {
            plan?: string;
            billing_cycle?: 'monthly' | 'annual';
            renewal_number?: number;
        }
    ) => {
        if (user?.id) {
            revenueService.trackSubscriptionRenewal(user.id, amount, properties);
        }
    }, [user?.id]);

    const trackSubscriptionUpgrade = useCallback((
        oldPlan: string,
        newPlan: string,
        additionalAmount: number,
        properties?: {
            billing_cycle?: 'monthly' | 'annual';
            proration_amount?: number;
        }
    ) => {
        if (user?.id) {
            revenueService.trackSubscriptionUpgrade(user.id, oldPlan, newPlan, additionalAmount, properties);
        }
    }, [user?.id]);

    const trackSubscriptionDowngrade = useCallback((
        oldPlan: string,
        newPlan: string,
        reason?: string
    ) => {
        if (user?.id) {
            revenueService.trackSubscriptionDowngrade(user.id, oldPlan, newPlan, reason);
        }
    }, [user?.id]);

    const trackSubscriptionCancellation = useCallback((
        reason?: string,
        properties?: {
            plan?: string;
            cancellation_feedback?: string;
            will_return?: boolean;
        }
    ) => {
        if (user?.id) {
            revenueService.trackSubscriptionCancellation(user.id, reason, properties);
        }
    }, [user?.id]);

    const trackRefund = useCallback((
        amount: number,
        reason?: string,
        properties?: {
            transaction_id?: string;
            partial_refund?: boolean;
        }
    ) => {
        if (user?.id) {
            revenueService.trackRefund(user.id, amount, reason, properties);
        }
    }, [user?.id]);

    const trackTrialStart = useCallback((
        plan: string,
        trialDays: number
    ) => {
        if (user?.id) {
            revenueService.trackTrialStart(user.id, plan, trialDays);
        }
    }, [user?.id]);

    const trackTrialConversion = useCallback((
        plan: string,
        amount: number
    ) => {
        if (user?.id) {
            revenueService.trackTrialConversion(user.id, plan, amount);
        }
    }, [user?.id]);

    const updateLifetimeValue = useCallback((
        totalSpend: number
    ) => {
        if (user?.id) {
            revenueService.updateLifetimeValue(user.id, totalSpend);
        }
    }, [user?.id]);

    return {
        trackPurchase,
        trackSubscriptionStart,
        trackSubscriptionRenewal,
        trackSubscriptionUpgrade,
        trackSubscriptionDowngrade,
        trackSubscriptionCancellation,
        trackRefund,
        trackTrialStart,
        trackTrialConversion,
        updateLifetimeValue
    };
};

export default useRevenue;

