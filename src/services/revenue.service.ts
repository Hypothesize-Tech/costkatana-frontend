import { mixpanelService } from './mixpanel.service';

/**
 * Revenue Service for tracking subscription lifecycle and monetary transactions
 */
export class RevenueService {
    /**
     * Track a purchase/subscription payment
     */
    static trackPurchase(
        userId: string,
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
    ): void {
        // Track the purchase event
        mixpanelService.track('Purchase Completed', {
            amount,
            plan: properties.plan,
            billing_cycle: properties.billing_cycle,
            payment_method: properties.payment_method,
            currency: properties.currency || 'USD',
            transaction_id: properties.transaction_id,
            is_trial: properties.is_trial || false,
            discount_code: properties.discount_code,
            discount_amount: properties.discount_amount || 0,
            final_amount: amount - (properties.discount_amount || 0),
            event_type: 'revenue',
            timestamp: new Date().toISOString()
        }, userId);

        // Update user profile with purchase info
        mixpanelService.setUserProfile(userId, {
            last_purchase_date: new Date().toISOString(),
            last_purchase_amount: amount,
            current_plan: properties.plan,
            billing_cycle: properties.billing_cycle,
            payment_method: properties.payment_method
        });

        // Increment total purchases counter
        mixpanelService.incrementUserProperty(userId, 'total_purchases', 1);
        mixpanelService.incrementUserProperty(userId, 'total_revenue', amount);

        console.debug('Purchase tracked:', userId, amount, properties);
    }

    /**
     * Track subscription start
     */
    static trackSubscriptionStart(
        userId: string,
        plan: string,
        amount: number,
        properties?: {
            billing_cycle?: 'monthly' | 'annual';
            trial_days?: number;
            currency?: string;
        }
    ): void {
        mixpanelService.track('Subscription Started', {
            plan,
            amount,
            billing_cycle: properties?.billing_cycle || 'monthly',
            trial_days: properties?.trial_days || 0,
            currency: properties?.currency || 'USD',
            is_trial: (properties?.trial_days || 0) > 0,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            current_plan: plan,
            billing_cycle: properties?.billing_cycle || 'monthly'
        });

        console.debug('Subscription start tracked:', userId, plan);
    }

    /**
     * Track subscription renewal
     */
    static trackSubscriptionRenewal(
        userId: string,
        amount: number,
        properties?: {
            plan?: string;
            billing_cycle?: 'monthly' | 'annual';
            renewal_number?: number;
        }
    ): void {
        mixpanelService.track('Subscription Renewed', {
            amount,
            plan: properties?.plan,
            billing_cycle: properties?.billing_cycle,
            renewal_number: properties?.renewal_number || 1,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            last_renewal_date: new Date().toISOString(),
            subscription_status: 'active'
        });

        mixpanelService.incrementUserProperty(userId, 'total_renewals', 1);
        mixpanelService.incrementUserProperty(userId, 'total_revenue', amount);

        console.debug('Subscription renewal tracked:', userId, amount);
    }

    /**
     * Track subscription upgrade
     */
    static trackSubscriptionUpgrade(
        userId: string,
        oldPlan: string,
        newPlan: string,
        additionalAmount: number,
        properties?: {
            billing_cycle?: 'monthly' | 'annual';
            proration_amount?: number;
        }
    ): void {
        mixpanelService.track('Subscription Upgraded', {
            old_plan: oldPlan,
            new_plan: newPlan,
            additional_amount: additionalAmount,
            billing_cycle: properties?.billing_cycle,
            proration_amount: properties?.proration_amount || 0,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            current_plan: newPlan,
            last_upgrade_date: new Date().toISOString(),
            previous_plan: oldPlan
        });

        mixpanelService.incrementUserProperty(userId, 'total_upgrades', 1);
        mixpanelService.incrementUserProperty(userId, 'total_revenue', additionalAmount);

        console.debug('Subscription upgrade tracked:', userId, oldPlan, newPlan);
    }

    /**
     * Track subscription downgrade
     */
    static trackSubscriptionDowngrade(
        userId: string,
        oldPlan: string,
        newPlan: string,
        reason?: string
    ): void {
        mixpanelService.track('Subscription Downgraded', {
            old_plan: oldPlan,
            new_plan: newPlan,
            downgrade_reason: reason,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            current_plan: newPlan,
            last_downgrade_date: new Date().toISOString(),
            previous_plan: oldPlan,
            downgrade_reason: reason
        });

        mixpanelService.incrementUserProperty(userId, 'total_downgrades', 1);

        console.debug('Subscription downgrade tracked:', userId, oldPlan, newPlan);
    }

    /**
     * Track subscription cancellation
     */
    static trackSubscriptionCancellation(
        userId: string,
        reason?: string,
        properties?: {
            plan?: string;
            cancellation_feedback?: string;
            will_return?: boolean;
        }
    ): void {
        mixpanelService.track('Subscription Cancelled', {
            cancellation_reason: reason,
            plan: properties?.plan,
            cancellation_feedback: properties?.cancellation_feedback,
            will_return: properties?.will_return,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            subscription_status: 'cancelled',
            cancellation_date: new Date().toISOString(),
            cancellation_reason: reason
        });

        mixpanelService.incrementUserProperty(userId, 'total_cancellations', 1);

        console.debug('Subscription cancellation tracked:', userId, reason);
    }

    /**
     * Track refund
     */
    static trackRefund(
        userId: string,
        amount: number,
        reason?: string,
        properties?: {
            transaction_id?: string;
            partial_refund?: boolean;
        }
    ): void {
        mixpanelService.track('Refund Issued', {
            amount,
            refund_reason: reason,
            transaction_id: properties?.transaction_id,
            partial_refund: properties?.partial_refund || false,
            event_type: 'revenue',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            last_refund_date: new Date().toISOString(),
            last_refund_amount: amount
        });

        mixpanelService.incrementUserProperty(userId, 'total_refunds', 1);
        mixpanelService.incrementUserProperty(userId, 'total_refund_amount', amount);
        // Subtract from revenue
        mixpanelService.incrementUserProperty(userId, 'total_revenue', -amount);

        console.debug('Refund tracked:', userId, amount);
    }

    /**
     * Update lifetime value
     */
    static updateLifetimeValue(userId: string, totalSpend: number): void {
        mixpanelService.setUserProfile(userId, {
            lifetime_value: totalSpend,
            spending_tier: this.getSpendingTier(totalSpend)
        });

        console.debug('Lifetime value updated:', userId, totalSpend);
    }

    /**
     * Track trial start
     */
    static trackTrialStart(
        userId: string,
        plan: string,
        trialDays: number
    ): void {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);

        mixpanelService.track('Trial Started', {
            plan,
            trial_days: trialDays,
            trial_end_date: trialEndDate.toISOString(),
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            subscription_status: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            trial_plan: plan
        });

        console.debug('Trial start tracked:', userId, plan, trialDays);
    }

    /**
     * Track trial conversion
     */
    static trackTrialConversion(
        userId: string,
        plan: string,
        amount: number
    ): void {
        mixpanelService.track('Trial Converted', {
            plan,
            amount,
            event_type: 'subscription',
            timestamp: new Date().toISOString()
        }, userId);

        mixpanelService.setUserProfile(userId, {
            subscription_status: 'active',
            trial_converted: true,
            trial_conversion_date: new Date().toISOString()
        });

        mixpanelService.incrementUserProperty(userId, 'total_trial_conversions', 1);

        console.debug('Trial conversion tracked:', userId, plan);
    }

    /**
     * Helper: Get spending tier based on total spend
     */
    private static getSpendingTier(totalSpend: number): string {
        if (totalSpend === 0) return 'free';
        if (totalSpend < 100) return 'low_value';
        if (totalSpend < 1000) return 'medium_value';
        return 'high_value';
    }
}

// Export singleton-like interface
export const revenueService = RevenueService;

