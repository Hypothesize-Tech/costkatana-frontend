import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mixpanelService } from '../services/mixpanel.service';
import { useAuth } from '../contexts/AuthContext';

export const useMixpanel = () => {
    const location = useLocation();
    const { user } = useAuth();
    const lastPageRef = useRef<string>('');

    // Track page views automatically
    useEffect(() => {
        const currentPage = location.pathname;
        
        // Only track if page has changed
        if (currentPage !== lastPageRef.current) {
            mixpanelService.trackPageView({
                page: currentPage,
                title: document.title,
                userId: user?.id,
                userEmail: user?.email,
                userName: user?.name,
                metadata: {
                    search: location.search,
                    hash: location.hash
                },
                referrer: document.referrer,
                queryParams: Object.fromEntries(new URLSearchParams(location.search))
            });

            // Track navigation if we have a previous page
            if (lastPageRef.current) {
                mixpanelService.trackNavigation({
                    from: lastPageRef.current,
                    to: currentPage,
                    navigationType: 'push',
                    userId: user?.id,
                    metadata: {
                        search: location.search,
                        hash: location.hash
                    }
                });
            }

            lastPageRef.current = currentPage;
        }
    }, [location, user?.id]);

    // Track user identification when user changes
    useEffect(() => {
        if (user?.id) {
            mixpanelService.identify(user.id, {
                email: user.email,
                name: user.name,
                role: user.role,
                $created: user.createdAt,
                $last_seen: new Date().toISOString()
            });
        } else {
            mixpanelService.reset();
        }
    }, [user]);

    const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
        mixpanelService.track(event, {
            ...properties,
            userId: user?.id
        }, user?.id);
    }, [user?.id]);

    const trackUserAction = useCallback((action: string, page: string, component: string, element: string, metadata?: Record<string, any>) => {
        mixpanelService.trackUserAction({
            userId: user?.id,
            userEmail: user?.email,
            userName: user?.name,
            action,
            page,
            component,
            element,
            metadata,
            timestamp: new Date().toISOString()
        });
    }, [user?.id]);

    const trackFeatureUsage = useCallback((feature: string, action: string, page: string, component: string, metadata?: Record<string, any>) => {
        mixpanelService.trackFeatureUsage({
            userId: user?.id,
            feature,
            action,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackAnalyticsEvent = useCallback((event: string, page: string, component: string, data?: Record<string, any>) => {
        mixpanelService.trackAnalyticsEvent({
            event,
            userId: user?.id,
            page,
            component,
            ...data
        });
    }, [user?.id]);

    const trackDashboardInteraction = useCallback((interaction: string, dashboard: string, page: string, component: string, metadata?: Record<string, any>) => {
        mixpanelService.trackDashboardInteraction(interaction, {
            userId: user?.id,
            dashboard,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackChartInteraction = useCallback((chartType: string, action: string, page: string, component: string, chartData?: any, metadata?: Record<string, any>) => {
        mixpanelService.trackChartInteraction({
            userId: user?.id,
            chartType,
            action,
            page,
            component,
            chartData,
            metadata
        });
    }, [user?.id]);

    const trackOptimizationEvent = useCallback((optimizationType: string, page: string, component: string, savings?: number, metadata?: Record<string, any>) => {
        mixpanelService.trackOptimizationEvent({
            userId: user?.id,
            optimizationType,
            savings,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackExportEvent = useCallback((format: string, page: string, component: string, reportType?: string, metadata?: Record<string, any>) => {
        mixpanelService.trackExportEvent({
            userId: user?.id,
            format,
            page,
            component,
            reportType,
            metadata
        });
    }, [user?.id]);

    const trackError = useCallback((error: string, errorCode?: string, page?: string, component?: string, metadata?: Record<string, any>) => {
        mixpanelService.trackError({
            userId: user?.id,
            error,
            errorCode,
            page: page || location.pathname,
            component,
            metadata
        });
    }, [user?.id, location.pathname]);

    const trackSearch = useCallback((query: string, searchType: string, page: string, component: string, resultsCount?: number, metadata?: Record<string, any>) => {
        mixpanelService.trackSearch({
            userId: user?.id,
            query,
            searchType,
            page,
            component,
            resultsCount,
            metadata
        });
    }, [user?.id]);

    const trackFilterUsage = useCallback((filterType: string, filterValue: any, page: string, component: string, metadata?: Record<string, any>) => {
        mixpanelService.trackFilterUsage({
            userId: user?.id,
            filterType,
            filterValue,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackModalInteraction = useCallback((action: 'opened' | 'closed' | 'submitted', modalName: string, page: string, component: string, metadata?: Record<string, any>) => {
        mixpanelService.trackModalInteraction({
            userId: user?.id,
            action,
            modalName,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackPerformance = useCallback((metric: string, value: number, unit?: string, page?: string, component?: string, context?: Record<string, any>) => {
        mixpanelService.trackPerformance({
            userId: user?.id,
            metric,
            value,
            unit,
            page: page || location.pathname,
            component,
            context
        });
    }, [user?.id, location.pathname]);

    const trackAuthEvent = useCallback((event: 'login' | 'logout' | 'register' | 'password_reset' | 'email_verification', data: {
        method: string;
        source: string;
        success: boolean;
        errorMessage?: string;
        metadata?: Record<string, any>;
    }) => {
        mixpanelService.trackAuthEvent(event, {
            userId: user?.id,
            ...data
        });
    }, [user?.id]);

    // Business, Marketing, and Sales tracking methods
    const trackBusinessMetric = useCallback((metric: 'revenue' | 'cost_savings' | 'user_acquisition' | 'retention' | 'conversion' | 'engagement' | 'churn' | 'lifetime_value', value: number, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly', page: string, component: string, comparison?: number, metadata?: Record<string, any>) => {
        mixpanelService.trackBusinessMetric({
            userId: user?.id,
            metric,
            value,
            period,
            comparison,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackMarketingData = useCallback((campaign: string, source: string, medium: string, page: string, component: string, term?: string, content?: string, metadata?: Record<string, any>) => {
        mixpanelService.trackMarketingData({
            userId: user?.id,
            campaign,
            source,
            medium,
            term,
            content,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackSalesData = useCallback((stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost', value: number, probability: number, page: string, component: string, metadata?: Record<string, any>) => {
        mixpanelService.trackSalesData({
            userId: user?.id,
            stage,
            value,
            probability,
            page,
            component,
            metadata
        });
    }, [user?.id]);

    const trackPageAnalytics = useCallback((page: string, pageTitle: string, timeOnPage: number, scrollDepth: number, interactions: number, bounces: boolean, sessionId: string, metadata?: Record<string, any>) => {
        mixpanelService.trackPageAnalytics({
            userId: user?.id,
            page,
            pageTitle,
            timeOnPage,
            scrollDepth,
            interactions,
            bounces,
            sessionId,
            metadata
        });
    }, [user?.id]);

    const trackButtonAnalytics = useCallback((buttonId: string, buttonText: string, page: string, component: string, position: string, clicks: number, sessionId: string, metadata?: Record<string, any>) => {
        mixpanelService.trackButtonAnalytics({
            userId: user?.id,
            buttonId,
            buttonText,
            page,
            component,
            position,
            clicks,
            sessionId,
            metadata
        });
    }, [user?.id]);

    const setUserProfile = useCallback((properties: Record<string, any>) => {
        if (user?.id) {
            mixpanelService.setUserProfile(user.id, properties);
        }
    }, [user?.id]);

    const incrementUserProperty = useCallback((property: string, value: number = 1) => {
        if (user?.id) {
            mixpanelService.incrementUserProperty(user.id, property, value);
        }
    }, [user?.id]);

    // Foundation Enhancement Methods
    const setComprehensiveUserProfile = useCallback((profile: Parameters<typeof mixpanelService.setComprehensiveUserProfile>[1]) => {
        if (user?.id) {
            mixpanelService.setComprehensiveUserProfile(user.id, profile);
        }
    }, [user?.id]);

    const trackUserLifecycleStage = useCallback((stage: Parameters<typeof mixpanelService.trackUserLifecycleStage>[1]) => {
        if (user?.id) {
            mixpanelService.trackUserLifecycleStage(user.id, stage);
        }
    }, [user?.id]);

    const calculateFeatureAdoptionScore = useCallback((usedFeatures: string[], totalFeatures?: number) => {
        if (user?.id) {
            mixpanelService.calculateFeatureAdoptionScore(user.id, usedFeatures, totalFeatures);
        }
    }, [user?.id]);

    const updateUserSpendingMetrics = useCallback((metrics: Parameters<typeof mixpanelService.updateUserSpendingMetrics>[1]) => {
        if (user?.id) {
            mixpanelService.updateUserSpendingMetrics(user.id, metrics);
        }
    }, [user?.id]);

    const registerSuperProperties = useCallback((properties: Parameters<typeof mixpanelService.registerSuperProperties>[0]) => {
        mixpanelService.registerSuperProperties(properties);
    }, []);

    const registerOnceSuperProperties = useCallback((properties: Parameters<typeof mixpanelService.registerOnceSuperProperties>[0]) => {
        mixpanelService.registerOnceSuperProperties(properties);
    }, []);

    const unregisterSuperProperty = useCallback((propertyName: string) => {
        mixpanelService.unregisterSuperProperty(propertyName);
    }, []);

    const startConditionalRecording = useCallback((reason: 'error' | 'conversion' | 'high_value_user' | 'support_request', metadata?: Record<string, any>) => {
        mixpanelService.startConditionalRecording(reason, metadata);
    }, []);

    // Session Replay methods
    const startSessionRecording = useCallback(() => {
        mixpanelService.startSessionRecording();
    }, []);

    const stopSessionRecording = useCallback(() => {
        mixpanelService.stopSessionRecording();
    }, []);

    const getSessionRecordingProperties = useCallback(() => {
        return mixpanelService.getSessionRecordingProperties();
    }, []);

    const getSessionReplayUrl = useCallback(() => {
        return mixpanelService.getSessionReplayUrl();
    }, []);

    return {
        trackEvent,
        trackUserAction,
        trackFeatureUsage,
        trackAnalyticsEvent,
        trackDashboardInteraction,
        trackChartInteraction,
        trackOptimizationEvent,
        trackExportEvent,
        trackError,
        trackSearch,
        trackFilterUsage,
        trackModalInteraction,
        trackPerformance,
        trackAuthEvent,
        trackBusinessMetric,
        trackMarketingData,
        trackSalesData,
        trackPageAnalytics,
        trackButtonAnalytics,
        setUserProfile,
        incrementUserProperty,
        // Foundation Enhancement Methods
        setComprehensiveUserProfile,
        trackUserLifecycleStage,
        calculateFeatureAdoptionScore,
        updateUserSpendingMetrics,
        registerSuperProperties,
        registerOnceSuperProperties,
        unregisterSuperProperty,
        startConditionalRecording,
        // Session Replay methods
        startSessionRecording,
        stopSessionRecording,
        getSessionRecordingProperties,
        getSessionReplayUrl,
        isSessionRecordingActive: mixpanelService.isSessionRecordingActive(),
        isTrackingEnabled: mixpanelService.isTrackingEnabled()
    };
}; 