import { mixpanelService } from './mixpanel.service';

/**
 * Funnel Service for tracking conversion funnels across different user journeys
 */
export class FunnelService {
    // Define critical funnels for Cost Katana
    static readonly FUNNELS = {
        signup: [
            'signup_start',
            'email_entered',
            'verification_complete',
            'profile_complete',
            'first_project_created'
        ],
        onboarding: [
            'onboarding_start',
            'api_key_added',
            'first_request_tracked',
            'dashboard_viewed',
            'optimization_enabled'
        ],
        activation: [
            'first_login',
            'project_created',
            'api_configured',
            'first_analysis',
            'cost_savings_achieved'
        ],
        monetization: [
            'pricing_viewed',
            'plan_selected',
            'payment_info_entered',
            'subscription_confirmed',
            'first_payment_success'
        ],
        feature_adoption: [
            'feature_discovered',
            'feature_clicked',
            'feature_used',
            'feature_value_realized',
            'feature_shared'
        ]
    };

    /**
     * Track a funnel step
     */
    static trackFunnelStep(
        funnelName: keyof typeof FunnelService.FUNNELS,
        stepName: string,
        properties?: Record<string, any>
    ): void {
        const funnel = FunnelService.FUNNELS[funnelName];
        const stepIndex = funnel.indexOf(stepName);
        const isValidStep = stepIndex !== -1;

        if (!isValidStep) {
            console.warn(`Invalid funnel step: ${stepName} for funnel: ${funnelName}`);
            return;
        }

        mixpanelService.track(`Funnel: ${funnelName}`, {
            funnel_name: funnelName,
            funnel_step: stepName,
            funnel_step_index: stepIndex,
            funnel_step_count: funnel.length,
            funnel_progress_percentage: ((stepIndex + 1) / funnel.length) * 100,
            ...properties,
            event_type: 'funnel_step',
            timestamp: new Date().toISOString()
        }, properties?.userId);

        // Store funnel progress in localStorage for tracking
        this.storeFunnelProgress(funnelName, stepName, properties?.userId);
    }

    /**
     * Get funnel progress for a user
     */
    static getFunnelProgress(userId: string, funnelName: keyof typeof FunnelService.FUNNELS): string[] {
        try {
            const storageKey = `funnel_progress_${userId}_${funnelName}`;
            const progress = localStorage.getItem(storageKey);
            return progress ? JSON.parse(progress) : [];
        } catch (error) {
            console.error('Error getting funnel progress:', error);
            return [];
        }
    }

    /**
     * Track funnel completion
     */
    static trackFunnelCompletion(
        funnelName: keyof typeof FunnelService.FUNNELS,
        properties?: Record<string, any>
    ): void {
        const funnel = FunnelService.FUNNELS[funnelName];
        
        mixpanelService.track(`Funnel Completed: ${funnelName}`, {
            funnel_name: funnelName,
            funnel_step_count: funnel.length,
            funnel_completion_time: properties?.completion_time_seconds,
            ...properties,
            event_type: 'funnel_completion',
            timestamp: new Date().toISOString()
        }, properties?.userId);

        // Increment funnel completion counter in user profile
        if (properties?.userId) {
            mixpanelService.incrementUserProperty(properties.userId, `funnel_${funnelName}_completions`, 1);
        }
    }

    /**
     * Track funnel dropoff
     */
    static trackFunnelDropoff(
        funnelName: keyof typeof FunnelService.FUNNELS,
        stepName: string,
        reason?: string,
        properties?: Record<string, any>
    ): void {
        const funnel = FunnelService.FUNNELS[funnelName];
        const stepIndex = funnel.indexOf(stepName);

        mixpanelService.track(`Funnel Dropoff: ${funnelName}`, {
            funnel_name: funnelName,
            dropoff_step: stepName,
            dropoff_step_index: stepIndex,
            dropoff_reason: reason,
            funnel_progress_percentage: ((stepIndex + 1) / funnel.length) * 100,
            ...properties,
            event_type: 'funnel_dropoff',
            timestamp: new Date().toISOString()
        }, properties?.userId);
    }

    /**
     * Store funnel progress in localStorage
     */
    private static storeFunnelProgress(
        funnelName: keyof typeof FunnelService.FUNNELS,
        stepName: string,
        userId?: string
    ): void {
        if (!userId) return;

        try {
            const storageKey = `funnel_progress_${userId}_${funnelName}`;
            const currentProgress = this.getFunnelProgress(userId, funnelName);
            
            if (!currentProgress.includes(stepName)) {
                currentProgress.push(stepName);
                localStorage.setItem(storageKey, JSON.stringify(currentProgress));
            }

            // Also store first step timestamp
            const firstStepKey = `funnel_start_${userId}_${funnelName}`;
            if (!localStorage.getItem(firstStepKey)) {
                localStorage.setItem(firstStepKey, new Date().toISOString());
            }
        } catch (error) {
            console.error('Error storing funnel progress:', error);
        }
    }

    /**
     * Clear funnel progress (useful after completion or reset)
     */
    static clearFunnelProgress(userId: string, funnelName: keyof typeof FunnelService.FUNNELS): void {
        try {
            const storageKey = `funnel_progress_${userId}_${funnelName}`;
            const firstStepKey = `funnel_start_${userId}_${funnelName}`;
            localStorage.removeItem(storageKey);
            localStorage.removeItem(firstStepKey);
        } catch (error) {
            console.error('Error clearing funnel progress:', error);
        }
    }

    /**
     * Get funnel completion time
     */
    static getFunnelCompletionTime(userId: string, funnelName: keyof typeof FunnelService.FUNNELS): number | null {
        try {
            const firstStepKey = `funnel_start_${userId}_${funnelName}`;
            const startTime = localStorage.getItem(firstStepKey);
            
            if (startTime) {
                const startDate = new Date(startTime);
                const now = new Date();
                return Math.floor((now.getTime() - startDate.getTime()) / 1000); // Return seconds
            }
            
            return null;
        } catch (error) {
            console.error('Error getting funnel completion time:', error);
            return null;
        }
    }
}

// Export singleton-like interface
export const funnelService = FunnelService;

