import { mixpanelService } from './mixpanel.service';

/**
 * Experiment Service for A/B testing and feature flags
 */
export class ExperimentService {
    private static experiments: Map<string, { control: number; variant_a: number; variant_b?: number }> = new Map([
        ['pricing_page_v2', { control: 50, variant_a: 50 }],
        ['onboarding_flow_v2', { control: 33, variant_a: 33, variant_b: 34 }],
        ['dashboard_layout_v2', { control: 50, variant_a: 50 }],
        ['feature_discovery_modal', { control: 50, variant_a: 50 }],
    ]);

    /**
     * Get variant for an experiment
     */
    static getVariant(
        experimentName: string,
        userId: string
    ): 'control' | 'variant_a' | 'variant_b' {
        // Check if variant is already assigned and stored
        const storageKey = `experiment_${experimentName}_${userId}`;
        const storedVariant = localStorage.getItem(storageKey);
        
        if (storedVariant) {
            return storedVariant as 'control' | 'variant_a' | 'variant_b';
        }

        // Assign new variant
        const variant = this.assignVariant(experimentName, userId);
        localStorage.setItem(storageKey, variant);
        
        return variant;
    }

    /**
     * Assign a variant based on experiment configuration
     */
    static assignVariant(
        experimentName: string,
        userId: string
    ): 'control' | 'variant_a' | 'variant_b' {
        const experiment = this.experiments.get(experimentName);
        
        if (!experiment) {
            console.warn(`Experiment ${experimentName} not found, defaulting to control`);
            return 'control';
        }

        // Use user ID to deterministically assign variant
        const hash = this.hashUserId(userId);
        const percentage = hash % 100;

        if (percentage < experiment.control) {
            return 'control';
        } else if (experiment.variant_b && percentage < experiment.control + experiment.variant_a) {
            return 'variant_a';
        } else if (experiment.variant_b) {
            return 'variant_b';
        } else {
            return 'variant_a';
        }
    }

    /**
     * Track when an experiment variant is viewed
     */
    static trackExperimentViewed(
        experimentName: string,
        variant: string,
        properties?: Record<string, any>
    ): void {
        mixpanelService.track('Experiment Viewed', {
            experiment_name: experimentName,
            experiment_variant: variant,
            ...properties,
            event_type: 'experiment',
            timestamp: new Date().toISOString()
        }, properties?.userId);

        console.debug('Experiment viewed:', experimentName, variant);
    }

    /**
     * Track when a user converts in an experiment
     */
    static trackExperimentConverted(
        experimentName: string,
        variant: string,
        conversionValue?: number,
        properties?: Record<string, any>
    ): void {
        mixpanelService.track('Experiment Converted', {
            experiment_name: experimentName,
            experiment_variant: variant,
            conversion_value: conversionValue,
            ...properties,
            event_type: 'experiment',
            timestamp: new Date().toISOString()
        }, properties?.userId);

        // Increment conversion counter in user profile
        if (properties?.userId) {
            mixpanelService.incrementUserProperty(
                properties.userId,
                `experiment_${experimentName}_conversions`,
                1
            );
        }

        console.debug('Experiment conversion tracked:', experimentName, variant, conversionValue);
    }

    /**
     * Check if a feature flag is enabled for a user
     */
    static isFeatureEnabled(
        featureName: string,
        userId: string,
        defaultValue: boolean = false
    ): boolean {
        // Check if feature flag is stored
        const storageKey = `feature_flag_${featureName}_${userId}`;
        const storedValue = localStorage.getItem(storageKey);
        
        if (storedValue !== null) {
            return storedValue === 'true';
        }

        // For now, use simple percentage-based rollout
        // In production, this could be connected to a feature flag service
        const featureRollouts: Record<string, number> = {
            'new_dashboard': 100, // 100% rollout
            'cortex_v2': 50, // 50% rollout
            'ai_recommendations': 25, // 25% rollout
            'advanced_analytics': 10, // 10% rollout
        };

        const rolloutPercentage = featureRollouts[featureName] ?? (defaultValue ? 100 : 0);
        const hash = this.hashUserId(userId);
        const enabled = (hash % 100) < rolloutPercentage;

        // Store the result
        localStorage.setItem(storageKey, enabled.toString());

        // Track feature flag evaluation
        this.trackFeatureFlagEvaluation(featureName, enabled, userId);

        return enabled;
    }

    /**
     * Track feature flag evaluation
     */
    static trackFeatureFlagEvaluation(
        featureName: string,
        enabled: boolean,
        userId?: string
    ): void {
        mixpanelService.track('Feature Flag Evaluated', {
            feature_name: featureName,
            feature_enabled: enabled,
            event_type: 'feature_flag',
            timestamp: new Date().toISOString()
        }, userId);

        console.debug('Feature flag evaluated:', featureName, enabled);
    }

    /**
     * Register a new experiment
     */
    static registerExperiment(
        experimentName: string,
        variants: { control: number; variant_a: number; variant_b?: number }
    ): void {
        this.experiments.set(experimentName, variants);
        console.debug('Experiment registered:', experimentName, variants);
    }

    /**
     * Clear experiment assignment for a user (useful for testing)
     */
    static clearExperimentAssignment(experimentName: string, userId: string): void {
        const storageKey = `experiment_${experimentName}_${userId}`;
        localStorage.removeItem(storageKey);
        console.debug('Experiment assignment cleared:', experimentName, userId);
    }

    /**
     * Clear feature flag assignment for a user (useful for testing)
     */
    static clearFeatureFlagAssignment(featureName: string, userId: string): void {
        const storageKey = `feature_flag_${featureName}_${userId}`;
        localStorage.removeItem(storageKey);
        console.debug('Feature flag assignment cleared:', featureName, userId);
    }

    /**
     * Hash user ID to get deterministic value
     */
    private static hashUserId(userId: string): number {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Track experiment goal completion
     */
    static trackExperimentGoal(
        experimentName: string,
        variant: string,
        goalName: string,
        properties?: Record<string, any>
    ): void {
        mixpanelService.track('Experiment Goal Completed', {
            experiment_name: experimentName,
            experiment_variant: variant,
            goal_name: goalName,
            ...properties,
            event_type: 'experiment',
            timestamp: new Date().toISOString()
        }, properties?.userId);

        console.debug('Experiment goal tracked:', experimentName, variant, goalName);
    }
}

// Export singleton-like interface
export const experimentService = ExperimentService;

