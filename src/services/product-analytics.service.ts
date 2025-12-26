import { mixpanelService } from './mixpanel.service';

/**
 * Product Analytics Service for detailed product usage metrics
 */
export class ProductAnalyticsService {
    private static featureTimers: Map<string, number> = new Map();
    private static clickCounts: Map<string, number> = new Map();
    private static lastClickTime: Map<string, number> = new Map();

    /**
     * Track time spent in a feature
     */
    static startFeatureTimer(featureName: string, userId?: string): void {
        const key = `${featureName}_${userId || 'anonymous'}`;
        this.featureTimers.set(key, Date.now());
    }

    /**
     * Stop feature timer and track usage
     */
    static stopFeatureTimer(featureName: string, userId?: string, metadata?: Record<string, any>): void {
        const key = `${featureName}_${userId || 'anonymous'}`;
        const startTime = this.featureTimers.get(key);

        if (startTime) {
            const timeSpent = Date.now() - startTime;
            const timeSpentSeconds = Math.floor(timeSpent / 1000);

            mixpanelService.track('Feature Time Tracked', {
                feature_name: featureName,
                time_spent_ms: timeSpent,
                time_spent_seconds: timeSpentSeconds,
                time_category: this.getTimeCategory(timeSpentSeconds),
                ...metadata,
                event_type: 'product_analytics',
                timestamp: new Date().toISOString()
            }, userId);

            // Update user profile with cumulative time
            if (userId) {
                mixpanelService.incrementUserProperty(userId, `feature_${featureName}_time_seconds`, timeSpentSeconds);
            }

            this.featureTimers.delete(key);
        }
    }

    /**
     * Track feature usage frequency
     */
    static trackFeatureUsage(featureName: string, userId?: string, metadata?: Record<string, any>): void {
        mixpanelService.track('Feature Used', {
            feature_name: featureName,
            ...metadata,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        if (userId) {
            mixpanelService.incrementUserProperty(userId, `feature_${featureName}_usage_count`, 1);
        }
    }

    /**
     * Track feature combination patterns
     */
    static trackFeatureCombination(features: string[], userId?: string, metadata?: Record<string, any>): void {
        const featurePattern = features.sort().join(' + ');

        mixpanelService.track('Feature Combination', {
            feature_pattern: featurePattern,
            feature_count: features.length,
            features: features,
            ...metadata,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        if (userId) {
            mixpanelService.incrementUserProperty(userId, `feature_combination_${featurePattern}_count`, 1);
        }
    }

    /**
     * Track dead-end pages (pages with no subsequent action)
     */
    static trackDeadEndPage(pageName: string, timeOnPage: number, userId?: string, metadata?: Record<string, any>): void {
        mixpanelService.track('Dead End Page', {
            page_name: pageName,
            time_on_page_seconds: timeOnPage,
            ...metadata,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        console.debug('Dead end page tracked:', pageName, timeOnPage);
    }

    /**
     * Track rage clicks (multiple rapid clicks on same element)
     */
    static trackRageClick(elementId: string, clickCount: number, userId?: string, metadata?: Record<string, any>): void {
        if (clickCount >= 3) { // Only track if 3+ rapid clicks
            mixpanelService.track('Rage Click Detected', {
                element_id: elementId,
                click_count: clickCount,
                rage_severity: this.getRageSeverity(clickCount),
                ...metadata,
                event_type: 'product_analytics',
                timestamp: new Date().toISOString()
            }, userId);

            console.warn('Rage click detected:', elementId, clickCount);
        }
    }

    /**
     * Helper: Detect rage clicks
     */
    static handleClick(elementId: string, userId?: string, metadata?: Record<string, any>): void {
        const now = Date.now();
        const lastClick = this.lastClickTime.get(elementId);
        const clickCount = this.clickCounts.get(elementId) || 0;

        // If clicked within 1 second, increment count
        if (lastClick && (now - lastClick) < 1000) {
            const newCount = clickCount + 1;
            this.clickCounts.set(elementId, newCount);

            // Track if rage click threshold reached
            if (newCount >= 3) {
                this.trackRageClick(elementId, newCount, userId, metadata);
            }
        } else {
            // Reset count
            this.clickCounts.set(elementId, 1);
        }

        this.lastClickTime.set(elementId, now);
    }

    /**
     * Track predictive analytics properties
     */
    static updatePredictiveProperties(userId: string, properties: {
        churn_risk_score?: number; // 0-100
        expansion_likelihood?: number; // 0-100
        engagement_trend?: 'increasing' | 'stable' | 'decreasing';
        feature_request_frequency?: number;
        support_ticket_count?: number;
        health_score?: number; // 0-100
    }): void {
        mixpanelService.setUserProfile(userId, {
            ...properties,
            last_health_check: new Date().toISOString()
        });

        // Track the event
        mixpanelService.track('Predictive Properties Updated', {
            ...properties,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        console.debug('Predictive properties updated:', userId, properties);
    }

    /**
     * Calculate and track engagement score
     */
    static calculateEngagementScore(userId: string, metrics: {
        days_active_last_30?: number;
        features_used_last_30?: number;
        api_calls_last_30?: number;
        time_spent_last_30_minutes?: number;
    }): number {
        // Simple engagement score calculation (0-100)
        const daysScore = Math.min((metrics.days_active_last_30 || 0) / 30 * 100, 100);
        const featuresScore = Math.min((metrics.features_used_last_30 || 0) / 20 * 100, 100);
        const apiScore = Math.min((metrics.api_calls_last_30 || 0) / 1000 * 100, 100);
        const timeScore = Math.min((metrics.time_spent_last_30_minutes || 0) / 600 * 100, 100);

        const engagementScore = Math.round((daysScore + featuresScore + apiScore + timeScore) / 4);

        mixpanelService.setUserProfile(userId, {
            engagement_score: engagementScore,
            engagement_tier: this.getEngagementTier(engagementScore),
            last_engagement_calculation: new Date().toISOString()
        });

        return engagementScore;
    }

    /**
     * Track feature discovery
     */
    static trackFeatureDiscovery(featureName: string, discoveryMethod: 'search' | 'navigation' | 'tooltip' | 'recommendation', userId?: string): void {
        mixpanelService.track('Feature Discovered', {
            feature_name: featureName,
            discovery_method: discoveryMethod,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        if (userId) {
            mixpanelService.setUserProfile(userId, {
                [`feature_${featureName}_discovered`]: true,
                [`feature_${featureName}_discovery_date`]: new Date().toISOString()
            });
        }
    }

    /**
     * Track feature value realization
     */
    static trackFeatureValueRealized(featureName: string, valueMetric: string, value: number, userId?: string): void {
        mixpanelService.track('Feature Value Realized', {
            feature_name: featureName,
            value_metric: valueMetric,
            value: value,
            event_type: 'product_analytics',
            timestamp: new Date().toISOString()
        }, userId);

        if (userId) {
            mixpanelService.incrementUserProperty(userId, `feature_${featureName}_value_${valueMetric}`, value);
        }
    }

    /**
     * Helper: Get time category
     */
    private static getTimeCategory(seconds: number): string {
        if (seconds < 10) return 'very_short';
        if (seconds < 60) return 'short';
        if (seconds < 300) return 'medium';
        if (seconds < 900) return 'long';
        return 'very_long';
    }

    /**
     * Helper: Get rage severity
     */
    private static getRageSeverity(clicks: number): string {
        if (clicks < 5) return 'mild';
        if (clicks < 10) return 'moderate';
        return 'severe';
    }

    /**
     * Helper: Get engagement tier
     */
    private static getEngagementTier(score: number): string {
        if (score >= 80) return 'highly_engaged';
        if (score >= 60) return 'engaged';
        if (score >= 40) return 'moderately_engaged';
        if (score >= 20) return 'low_engagement';
        return 'at_risk';
    }
}

// Export singleton-like interface
export const productAnalyticsService = ProductAnalyticsService;

