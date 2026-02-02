import mixpanel from 'mixpanel-browser';

interface MixpanelEvent {
    event: string;
    properties: Record<string, any>;
    userId?: string;
    userEmail?: string;
    userName?: string;
}

interface PageViewData {
    page: string;
    title: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    metadata?: Record<string, any>;
    referrer?: string;
    queryParams?: Record<string, any>;
    sessionId?: string;
}

interface UserActionData {
    userId?: string;
    userEmail?: string;
    userName?: string;
    action: string;
    page: string;
    component: string;
    element: string;
    metadata?: Record<string, any>;
    timestamp: string;
    sessionId?: string;
}

interface FeatureUsageData {
    userId?: string;
    feature: string;
    subFeature?: string;
    action: string;
    page: string;
    component: string;
    metadata?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
}

interface AnalyticsEventData {
    event: string;
    userId?: string;
    projectId?: string;
    filters?: Record<string, any>;
    metadata?: Record<string, any>;
    page: string;
    component: string;
}

interface ChartInteractionData {
    userId?: string;
    chartType: string;
    action: string;
    chartData?: any;
    metadata?: Record<string, any>;
    page: string;
    component: string;
}

interface OptimizationEventData {
    userId?: string;
    projectId?: string;
    optimizationType?: string;
    savings?: number;
    metadata?: Record<string, any>;
    page: string;
    component: string;
}

interface ExportEventData {
    userId?: string;
    projectId?: string;
    reportType?: string;
    metadata?: Record<string, any>;
    page: string;
    component: string;
    format: string;
}

interface ErrorEventData {
    userId?: string;
    errorCode?: string;
    page?: string;
    metadata?: Record<string, any>;
    component?: string;
    error: string;
}

interface PerformanceEventData {
    userId?: string;
    metric: string;
    value: number;
    unit?: string;
    context?: Record<string, any>;
    page?: string;
    component?: string;
}

interface SearchEventData {
    userId?: string;
    projectId?: string;
    searchType: string;
    resultsCount?: number;
    metadata?: Record<string, any>;
    page: string;
    component: string;
    query: string;
}

interface FilterEventData {
    userId?: string;
    projectId?: string;
    filterValue: any;
    metadata?: Record<string, any>;
    page: string;
    component: string;
    filterType: string;
}

interface ModalEventData {
    userId?: string;
    projectId?: string;
    metadata?: Record<string, any>;
    page: string;
    component: string;
    action: 'opened' | 'closed' | 'submitted';
    modalName: string;
}

interface NavigationEventData {
    userId?: string;
    navigationType?: 'push' | 'replace' | 'pop';
    metadata?: Record<string, any>;
    from: string;
    to: string;
}

interface BusinessMetricData {
    userId?: string;
    metric: 'revenue' | 'cost_savings' | 'user_acquisition' | 'retention' | 'conversion' | 'engagement' | 'churn' | 'lifetime_value';
    value: number;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    comparison?: number;
    page: string;
    component: string;
    metadata?: Record<string, any>;
}

interface MarketingData {
    userId?: string;
    campaign: string;
    source: string;
    medium: string;
    term?: string;
    content?: string;
    page: string;
    component: string;
    metadata?: Record<string, any>;
}

interface SalesData {
    userId?: string;
    stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    value: number;
    probability: number;
    page: string;
    component: string;
    metadata?: Record<string, any>;
}

interface PageAnalyticsData {
    userId?: string;
    page: string;
    pageTitle: string;
    timeOnPage: number;
    scrollDepth: number;
    interactions: number;
    bounces: boolean;
    sessionId: string;
    metadata?: Record<string, any>;
}

interface ButtonAnalyticsData {
    userId?: string;
    buttonId: string;
    buttonText: string;
    page: string;
    component: string;
    position: string;
    clicks: number;
    sessionId: string;
    metadata?: Record<string, any>;
}

export class MixpanelService {
    private static instance: MixpanelService;
    private isEnabled: boolean;
    private isInitialized: boolean = false;
    private isSessionRecordingEnabled: boolean = false;

    private constructor() {
        const token = import.meta.env.VITE_MIXPANEL_TOKEN;
        this.isEnabled = !!token && import.meta.env.NODE_ENV !== 'test';
        
        if (this.isEnabled && token) {
            try {
                mixpanel.init(token, {
                    debug: import.meta.env.NODE_ENV === 'development',
                    track_pageview: false, // We'll handle this manually
                    persistence: 'localStorage',
                    api_host: 'https://api.mixpanel.com',
                    record_sessions_percent: 1, // Records 1% of all sessions
                    record_idle_timeout_ms: 1800000, // End a replay capture after 30mins of inactivity
                    record_mask_text_selector: '*', // Mask all text elements by default
                    record_block_selector: 'img, video', // Block images and videos by default
                    autocapture: true,
                    autotrack: true,
                });
                this.isInitialized = true;
                this.isSessionRecordingEnabled = true;
                console.log('Mixpanel initialized successfully with Session Replay enabled');
            } catch (error) {
                console.error('Failed to initialize Mixpanel:', error);
                this.isEnabled = false;
            }
        } else {
            console.warn('Mixpanel not configured - analytics tracking disabled');
        }
    }

    public static getInstance(): MixpanelService {
        if (!MixpanelService.instance) {
            MixpanelService.instance = new MixpanelService();
        }
        return MixpanelService.instance;
    }

    /**
     * Track a custom event with detailed context
     */
    public track(event: string, properties: Record<string, any> = {}, userId?: string, userEmail?: string, userName?: string): void {
        if (!this.isEnabled || !this.isInitialized) {
            console.debug('Mixpanel tracking disabled, event:', event);
            return;
        }

        try {
            const eventData: MixpanelEvent = {
                event,
                properties: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    environment: import.meta.env.NODE_ENV || 'development',
                    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    user_email: userEmail,
                    user_name: userName
                },
                userId,
                userEmail,
                userName
            };

            if (userId) {
                mixpanel.identify(userId);
                if (userEmail) {
                    mixpanel.people.set('$email', userEmail);
                }
                if (userName) {
                    mixpanel.people.set('$name', userName);
                }
            }

            // Add session recording properties if available
            const sessionProps = this.getSessionRecordingProperties();
            if (sessionProps) {
                eventData.properties = {
                    ...eventData.properties,
                    ...sessionProps
                };
            }
            
            mixpanel.track(event, eventData.properties);
            console.debug('Mixpanel event tracked:', event, properties);
        } catch (error) {
            console.error('Error tracking Mixpanel event:', error);
        }
    }

    /**
     * Track page views with detailed context
     */
    public trackPageView(data: PageViewData): void {
        this.track('Page Viewed', {
            ...data,
            event_type: 'page_view',
            page_category: this.getPageCategory(data.page),
            referrer: data.referrer || document.referrer,
            title: data.title || document.title,
            path_depth: data.page.split('/').length - 1,
            is_homepage: data.page === '/' || data.page === '/dashboard',
            has_query_params: Object.keys(data.queryParams || {}).length > 0
        }, data.userId, data.userEmail, data.userName);
    }

    /**
     * Track specific user actions with detailed context
     */
    public trackUserAction(data: UserActionData): void {
        this.track('User Action', {
            ...data,
            event_type: 'user_action',
            action_category: this.getActionCategory(data.action),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component),
            element_category: this.getElementCategory(data.element)
        }, data.userId, data.userEmail, data.userName);
    }

    /**
     * Track feature usage with detailed context
     */
    public trackFeatureUsage(data: FeatureUsageData): void {
        this.track('Feature Used', {
            ...data,
            event_type: 'feature_usage',
            feature_category: this.getFeatureCategory(data.feature),
            action_category: this.getActionCategory(data.action),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component),
            success_category: data.success !== false ? 'success' : 'failure'
        }, data.userId);

        // Increment feature usage counter
        if (data.userId) {
            this.incrementUserProperty(data.userId, `feature_${data.feature}_usage`, 1);
        }
    }

    /**
     * Track analytics events with detailed context
     */
    public trackAnalyticsEvent(data: AnalyticsEventData): void {
        this.track('Analytics Event', {
            ...data,
            event_type: 'analytics',
            analytics_category: this.getAnalyticsCategory(data.event),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track business metrics for marketing and sales analysis
     */
    public trackBusinessMetric(data: BusinessMetricData): void {
        this.track('Business Metric', {
            ...data,
            event_type: 'business_metric',
            business_category: this.getBusinessCategory(data.metric),
            change_percentage: data.comparison 
                ? ((data.value - data.comparison) / data.comparison * 100).toFixed(2)
                : null,
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);

        // Track business-specific user properties
        if (data.userId) {
            this.incrementUserProperty(data.userId, `business_${data.metric}`, data.value);
        }
    }

    /**
     * Track marketing data for campaign analysis
     */
    public trackMarketingData(data: MarketingData): void {
        this.track('Marketing Event', {
            ...data,
            event_type: 'marketing',
            marketing_category: this.getMarketingCategory(data.campaign),
            source_category: this.getSourceCategory(data.source),
            medium_category: this.getMediumCategory(data.medium),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);

        // Track marketing-specific user properties
        if (data.userId) {
            this.setUserProfile(data.userId, {
                $campaign: data.campaign,
                $source: data.source,
                $medium: data.medium,
                $term: data.term,
                $content: data.content
            });
        }
    }

    /**
     * Track sales data for pipeline analysis
     */
    public trackSalesData(data: SalesData): void {
        this.track('Sales Event', {
            ...data,
            event_type: 'sales',
            sales_category: this.getSalesCategory(data.stage),
            stage_category: this.getStageCategory(data.stage),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);

        // Track sales-specific user properties
        if (data.userId) {
            this.incrementUserProperty(data.userId, `sales_${data.stage}_value`, data.value);
            this.setUserProfile(data.userId, {
                sales_stage: data.stage,
                sales_probability: data.probability
            });
        }
    }

    /**
     * Track detailed page analytics for UX analysis
     */
    public trackPageAnalytics(data: PageAnalyticsData): void {
        this.track('Page Analytics', {
            ...data,
            event_type: 'page_analytics',
            page_category: this.getPageCategory(data.page),
            engagement_category: this.getEngagementCategory(data.timeOnPage, data.interactions),
            bounce_category: data.bounces ? 'bounce' : 'engaged'
        }, data.userId);

        // Track page-specific metrics
        if (data.userId) {
            this.incrementUserProperty(data.userId, `page_${data.page.replace(/\//g, '_')}_views`, 1);
            this.incrementUserProperty(data.userId, `page_${data.page.replace(/\//g, '_')}_time`, data.timeOnPage);
        }
    }

    /**
     * Track detailed button analytics for UX analysis
     */
    public trackButtonAnalytics(data: ButtonAnalyticsData): void {
        this.track('Button Analytics', {
            ...data,
            event_type: 'button_analytics',
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component),
            button_category: this.getButtonCategory(data.buttonId),
            position_category: this.getPositionCategory(data.position)
        }, data.userId);

        // Track button-specific metrics
        if (data.userId) {
            this.incrementUserProperty(data.userId, `button_${data.buttonId}_clicks`, data.clicks);
        }
    }

    /**
     * Track user authentication events with detailed context
     */
    public trackAuthEvent(event: 'login' | 'logout' | 'register' | 'password_reset' | 'email_verification', data: {
        userId?: string;
        method: string;
        source: string;
        success: boolean;
        errorMessage?: string;
        metadata?: Record<string, any>;
    }): void {
        this.track(`Authentication ${event}`, {
            ...data,
            event_type: 'authentication',
            auth_method: data.method,
            auth_source: data.source,
            success_category: data.success ? 'success' : 'failure'
        }, data.userId);
    }

    /**
     * Track dashboard interactions with detailed context
     */
    public trackDashboardInteraction(interaction: string, data: {
        userId?: string;
        projectId?: string;
        dashboard: string;
        metadata?: Record<string, any>;
        page: string;
        component: string;
    }): void {
        this.track('Dashboard Interaction', {
            ...data,
            interaction,
            event_type: 'dashboard_interaction',
            interaction_category: this.getInteractionCategory(interaction),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track chart interactions with detailed context
     */
    public trackChartInteraction(data: ChartInteractionData): void {
        this.track('Chart Interaction', {
            ...data,
            event_type: 'chart_interaction',
            chart_category: this.getChartCategory(data.chartType),
            action_category: this.getActionCategory(data.action),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track optimization events with detailed context
     */
    public trackOptimizationEvent(data: OptimizationEventData): void {
        this.track('Optimization Event', {
            ...data,
            event_type: 'optimization',
            optimization_category: this.getOptimizationCategory(data.optimizationType),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track export events with detailed context
     */
    public trackExportEvent(data: ExportEventData): void {
        this.track('Export Requested', {
            ...data,
            event_type: 'export',
            export_category: this.getExportCategory(data.format),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track error events with detailed context
     */
    public trackError(data: ErrorEventData): void {
        this.track('Error Occurred', {
            ...data,
            event_type: 'error',
            error_category: this.getErrorCategory(data.error),
            page_category: data.page ? this.getPageCategory(data.page) : undefined,
            component_category: data.component ? this.getComponentCategory(data.component) : undefined,
            timestamp: new Date().toISOString()
        }, data.userId);
    }

    /**
     * Track performance metrics with detailed context
     */
    public trackPerformance(data: PerformanceEventData): void {
        this.track('Performance Metric', {
            ...data,
            event_type: 'performance',
            performance_category: this.getPerformanceCategory(data.value),
            page_category: data.page ? this.getPageCategory(data.page) : undefined,
            component_category: data.component ? this.getComponentCategory(data.component) : undefined
        }, data.userId);
    }

    /**
     * Track search events with detailed context
     */
    public trackSearch(data: SearchEventData): void {
        this.track('Search Performed', {
            ...data,
            event_type: 'search',
            search_category: this.getSearchCategory(data.searchType),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component),
            query_length: data.query.length,
            has_results: (data.resultsCount || 0) > 0
        }, data.userId);
    }

    /**
     * Track filter usage with detailed context
     */
    public trackFilterUsage(data: FilterEventData): void {
        this.track('Filter Applied', {
            ...data,
            event_type: 'filter_usage',
            filter_category: this.getFilterCategory(data.filterType),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track modal interactions with detailed context
     */
    public trackModalInteraction(data: ModalEventData): void {
        this.track('Modal Interaction', {
            ...data,
            event_type: 'modal_interaction',
            modal_category: this.getModalCategory(data.modalName),
            page_category: this.getPageCategory(data.page),
            component_category: this.getComponentCategory(data.component)
        }, data.userId);
    }

    /**
     * Track navigation events with detailed context
     */
    public trackNavigation(data: NavigationEventData): void {
        this.track('Navigation', {
            ...data,
            event_type: 'navigation',
            navigation_category: this.getNavigationCategory(data.navigationType),
            from_category: this.getPageCategory(data.from),
            to_category: this.getPageCategory(data.to),
            is_same_page: data.from === data.to
        }, data.userId);
    }

    /**
     * Set user profile properties with detailed context
     */
    public setUserProfile(userId: string, properties: Record<string, any>): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            mixpanel.people.set({
                ...properties,
                $last_seen: new Date().toISOString(),
                $updated: new Date().toISOString()
            });
            console.debug('Mixpanel user profile updated:', userId, properties);
        } catch (error) {
            console.error('Error updating Mixpanel user profile:', error);
        }
    }

    /**
     * Increment user profile properties
     */
    public incrementUserProperty(userId: string, property: string, value: number = 1): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            mixpanel.people.increment(property, value);
            console.debug('Mixpanel user property incremented:', userId, property, value);
        } catch (error) {
            console.error('Error incrementing Mixpanel user property:', error);
        }
    }

    /**
     * Set user identity
     */
    public identify(userId: string, properties?: Record<string, any>): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            if (properties) {
                mixpanel.people.set(properties);
            }
            console.debug('Mixpanel user identified:', userId);
        } catch (error) {
            console.error('Error identifying Mixpanel user:', error);
        }
    }

    /**
     * Reset user identity
     */
    public reset(): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.reset();
            console.debug('Mixpanel user reset');
        } catch (error) {
            console.error('Error resetting Mixpanel user:', error);
        }
    }

    /**
     * Helper functions for categorization
     */
    private getPageCategory(page: string): string {
        if (page.includes('/dashboard')) return 'dashboard';
        if (page.includes('/analytics')) return 'analytics';
        if (page.includes('/projects')) return 'projects';
        if (page.includes('/optimization')) return 'optimization';
        if (page.includes('/chat')) return 'chat';
        if (page.includes('/intelligence')) return 'intelligence';
        if (page.includes('/settings')) return 'settings';
        if (page.includes('/profile')) return 'profile';
        if (page.includes('/api-keys')) return 'api_keys';
        if (page.includes('/usage')) return 'usage';
        if (page.includes('/alerts')) return 'alerts';
        if (page.includes('/templates')) return 'templates';
        if (page.includes('/training')) return 'training';
        if (page.includes('/agent-trace') || page.includes('/workflows')) return 'agent_trace';
        return 'other';
    }

    private getComponentCategory(component: string): string {
        if (component.includes('chart')) return 'visualization';
        if (component.includes('table')) return 'data_table';
        if (component.includes('form')) return 'form';
        if (component.includes('modal')) return 'modal';
        if (component.includes('button')) return 'button';
        if (component.includes('card')) return 'card';
        if (component.includes('filter')) return 'filter';
        if (component.includes('search')) return 'search';
        if (component.includes('navigation')) return 'navigation';
        if (component.includes('sidebar')) return 'sidebar';
        if (component.includes('header')) return 'header';
        if (component.includes('footer')) return 'footer';
        if (component.includes('dropdown')) return 'dropdown';
        if (component.includes('tooltip')) return 'tooltip';
        return 'other';
    }

    private getActionCategory(action: string): string {
        if (action.includes('click')) return 'click';
        if (action.includes('submit')) return 'submit';
        if (action.includes('change')) return 'change';
        if (action.includes('scroll')) return 'scroll';
        if (action.includes('hover')) return 'hover';
        if (action.includes('focus')) return 'focus';
        if (action.includes('blur')) return 'blur';
        if (action.includes('load')) return 'load';
        if (action.includes('unload')) return 'unload';
        if (action.includes('drag')) return 'drag';
        if (action.includes('drop')) return 'drop';
        if (action.includes('keypress')) return 'keypress';
        if (action.includes('keydown')) return 'keydown';
        if (action.includes('keyup')) return 'keyup';
        return 'other';
    }

    private getElementCategory(element: string): string {
        if (element.includes('button')) return 'button';
        if (element.includes('input')) return 'input';
        if (element.includes('select')) return 'select';
        if (element.includes('link')) return 'link';
        if (element.includes('image')) return 'image';
        if (element.includes('video')) return 'video';
        if (element.includes('audio')) return 'audio';
        if (element.includes('canvas')) return 'canvas';
        if (element.includes('svg')) return 'svg';
        if (element.includes('div')) return 'div';
        if (element.includes('span')) return 'span';
        return 'other';
    }

    private getFeatureCategory(feature: string): string {
        if (feature.includes('optimization')) return 'optimization';
        if (feature.includes('analytics')) return 'analytics';
        if (feature.includes('chat')) return 'chat';
        if (feature.includes('export')) return 'export';
        if (feature.includes('import')) return 'import';
        if (feature.includes('filter')) return 'filter';
        if (feature.includes('search')) return 'search';
        if (feature.includes('chart')) return 'visualization';
        if (feature.includes('table')) return 'data_display';
        if (feature.includes('dashboard')) return 'dashboard';
        if (feature.includes('project')) return 'project';
        if (feature.includes('settings')) return 'settings';
        if (feature.includes('profile')) return 'profile';
        return 'other';
    }

    private getAnalyticsCategory(event: string): string {
        if (event.includes('dashboard')) return 'dashboard';
        if (event.includes('report')) return 'reporting';
        if (event.includes('export')) return 'export';
        if (event.includes('filter')) return 'filtering';
        if (event.includes('chart')) return 'visualization';
        if (event.includes('data')) return 'data_management';
        if (event.includes('refresh')) return 'refresh';
        if (event.includes('load')) return 'load';
        return 'other';
    }

    private getInteractionCategory(interaction: string): string {
        if (interaction.includes('click')) return 'click';
        if (interaction.includes('hover')) return 'hover';
        if (interaction.includes('scroll')) return 'scroll';
        if (interaction.includes('resize')) return 'resize';
        if (interaction.includes('refresh')) return 'refresh';
        if (interaction.includes('filter')) return 'filter';
        if (interaction.includes('sort')) return 'sort';
        if (interaction.includes('export')) return 'export';
        return 'other';
    }

    private getChartCategory(chartType: string): string {
        if (chartType.includes('line')) return 'line_chart';
        if (chartType.includes('bar')) return 'bar_chart';
        if (chartType.includes('pie')) return 'pie_chart';
        if (chartType.includes('area')) return 'area_chart';
        if (chartType.includes('scatter')) return 'scatter_plot';
        if (chartType.includes('heatmap')) return 'heatmap';
        if (chartType.includes('gauge')) return 'gauge';
        if (chartType.includes('funnel')) return 'funnel';
        return 'other';
    }

    private getOptimizationCategory(type?: string): string {
        if (!type) return 'unknown';
        if (type.includes('prompt')) return 'prompt_optimization';
        if (type.includes('model')) return 'model_optimization';
        if (type.includes('cost')) return 'cost_optimization';
        if (type.includes('usage')) return 'usage_optimization';
        return 'other';
    }

    private getExportCategory(format: string): string {
        if (format.includes('csv')) return 'csv';
        if (format.includes('excel')) return 'excel';
        if (format.includes('pdf')) return 'pdf';
        if (format.includes('json')) return 'json';
        if (format.includes('xml')) return 'xml';
        return 'other';
    }

    private getErrorCategory(error: string): string {
        if (error.toLowerCase().includes('network')) return 'network';
        if (error.toLowerCase().includes('timeout')) return 'timeout';
        if (error.toLowerCase().includes('validation')) return 'validation';
        if (error.toLowerCase().includes('authentication')) return 'authentication';
        if (error.toLowerCase().includes('authorization')) return 'authorization';
        if (error.toLowerCase().includes('not found')) return 'not_found';
        if (error.toLowerCase().includes('server')) return 'server';
        if (error.toLowerCase().includes('client')) return 'client';
        return 'other';
    }

    private getPerformanceCategory(value: number): string {
        if (value < 1000) return 'fast';
        if (value < 3000) return 'normal';
        if (value < 10000) return 'slow';
        return 'very_slow';
    }

    private getSearchCategory(searchType: string): string {
        if (searchType.includes('global')) return 'global';
        if (searchType.includes('local')) return 'local';
        if (searchType.includes('filter')) return 'filter';
        if (searchType.includes('autocomplete')) return 'autocomplete';
        return 'other';
    }

    private getFilterCategory(filterType: string): string {
        if (filterType.includes('date')) return 'date';
        if (filterType.includes('text')) return 'text';
        if (filterType.includes('select')) return 'select';
        if (filterType.includes('range')) return 'range';
        if (filterType.includes('boolean')) return 'boolean';
        return 'other';
    }

    private getModalCategory(modalName: string): string {
        if (modalName.includes('create')) return 'create';
        if (modalName.includes('edit')) return 'edit';
        if (modalName.includes('delete')) return 'delete';
        if (modalName.includes('confirm')) return 'confirm';
        if (modalName.includes('settings')) return 'settings';
        if (modalName.includes('help')) return 'help';
        return 'other';
    }

    private getNavigationCategory(type?: string): string {
        if (!type) return 'unknown';
        if (type === 'push') return 'push';
        if (type === 'replace') return 'replace';
        if (type === 'pop') return 'pop';
        return 'other';
    }

    private getBusinessCategory(metric: string): string {
        if (metric.includes('revenue')) return 'revenue';
        if (metric.includes('cost')) return 'cost_management';
        if (metric.includes('acquisition')) return 'user_acquisition';
        if (metric.includes('retention')) return 'retention';
        if (metric.includes('conversion')) return 'conversion';
        if (metric.includes('engagement')) return 'engagement';
        if (metric.includes('churn')) return 'churn';
        if (metric.includes('lifetime')) return 'lifetime_value';
        return 'other';
    }

    private getMarketingCategory(campaign: string): string {
        if (campaign.includes('email')) return 'email';
        if (campaign.includes('social')) return 'social';
        if (campaign.includes('search')) return 'search';
        if (campaign.includes('display')) return 'display';
        if (campaign.includes('content')) return 'content';
        return 'other';
    }

    private getSourceCategory(source: string): string {
        if (source.includes('google')) return 'google';
        if (source.includes('facebook')) return 'facebook';
        if (source.includes('twitter')) return 'twitter';
        if (source.includes('linkedin')) return 'linkedin';
        if (source.includes('direct')) return 'direct';
        return 'other';
    }

    private getMediumCategory(medium: string): string {
        if (medium.includes('cpc')) return 'paid_search';
        if (medium.includes('cpm')) return 'paid_social';
        if (medium.includes('email')) return 'email';
        if (medium.includes('organic')) return 'organic';
        if (medium.includes('referral')) return 'referral';
        return 'other';
    }

    private getSalesCategory(stage: string): string {
        if (stage.includes('lead')) return 'lead_generation';
        if (stage.includes('qualified')) return 'lead_qualification';
        if (stage.includes('proposal')) return 'proposal';
        if (stage.includes('negotiation')) return 'negotiation';
        if (stage.includes('closed')) return 'closed';
        return 'other';
    }

    private getStageCategory(stage: string): string {
        if (stage.includes('lead')) return 'early';
        if (stage.includes('qualified')) return 'early';
        if (stage.includes('proposal')) return 'middle';
        if (stage.includes('negotiation')) return 'late';
        if (stage.includes('closed')) return 'closed';
        return 'other';
    }

    private getEngagementCategory(timeOnPage: number, interactions: number): string {
        if (timeOnPage > 300 && interactions > 5) return 'high';
        if (timeOnPage > 60 && interactions > 2) return 'medium';
        return 'low';
    }

    private getButtonCategory(buttonId: string): string {
        if (buttonId.includes('primary')) return 'primary';
        if (buttonId.includes('secondary')) return 'secondary';
        if (buttonId.includes('cta')) return 'cta';
        if (buttonId.includes('submit')) return 'submit';
        return 'other';
    }

    private getPositionCategory(position: string): string {
        if (position.includes('header')) return 'header';
        if (position.includes('sidebar')) return 'sidebar';
        if (position.includes('footer')) return 'footer';
        if (position.includes('modal')) return 'modal';
        return 'content';
    }

    /**
     * Check if Mixpanel is enabled
     */
    public isTrackingEnabled(): boolean {
        return this.isEnabled && this.isInitialized;
    }

    /**
     * Get Mixpanel instance for advanced usage
     */
    public getMixpanelInstance(): typeof mixpanel | null {
        return this.isEnabled && this.isInitialized ? mixpanel : null;
    }

    /**
     * Start session recording manually
     */
    public startSessionRecording(): void {
        if (!this.isEnabled || !this.isInitialized) {
            console.debug('Mixpanel not initialized, cannot start session recording');
            return;
        }

        try {
            // The type definition may not include this method, but it exists in the latest Mixpanel SDK
            (mixpanel as any).start_session_recording();
            this.isSessionRecordingEnabled = true;
            console.debug('Mixpanel session recording started manually');
        } catch (error) {
            console.error('Error starting Mixpanel session recording:', error);
        }
    }

    /**
     * Stop session recording manually
     */
    public stopSessionRecording(): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            // The type definition may not include this method, but it exists in the latest Mixpanel SDK
            (mixpanel as any).stop_session_recording();
            this.isSessionRecordingEnabled = false;
            console.debug('Mixpanel session recording stopped manually');
        } catch (error) {
            console.error('Error stopping Mixpanel session recording:', error);
        }
    }

    /**
     * Get session recording properties (including replay ID)
     */
    public getSessionRecordingProperties(): Record<string, any> | null {
        if (!this.isEnabled || !this.isInitialized || !this.isSessionRecordingEnabled) {
            return null;
        }

        try {
            // The type definition may not include this method, but it exists in the latest Mixpanel SDK
            return (mixpanel as any).get_session_recording_properties() || null;
        } catch (error) {
            console.error('Error getting Mixpanel session recording properties:', error);
            return null;
        }
    }

    /**
     * Get session replay URL for the current session
     */
    public getSessionReplayUrl(): string | null {
        if (!this.isEnabled || !this.isInitialized || !this.isSessionRecordingEnabled) {
            return null;
        }

        try {
            // The type definition may not include this method, but it exists in the latest Mixpanel SDK
            return (mixpanel as any).get_session_replay_url() || null;
        } catch (error) {
            console.error('Error getting Mixpanel session replay URL:', error);
            return null;
        }
    }

    /**
     * Check if session recording is currently enabled
     */
    public isSessionRecordingActive(): boolean {
        return this.isEnabled && this.isInitialized && this.isSessionRecordingEnabled;
    }

    /**
     * ===== FOUNDATION ENHANCEMENTS =====
     */

    /**
     * Set comprehensive user profile with all critical properties
     */
    public setComprehensiveUserProfile(userId: string, profile: {
        name?: string;
        email?: string;
        company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501+';
        industry?: string;
        role?: string;
        signup_date?: Date | string;
        plan_type?: string;
        total_spend?: number;
        lifetime_cost_savings?: number;
        avatar_url?: string;
        phone?: string;
        company_name?: string;
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            const profileData: Record<string, any> = {
                $last_seen: new Date().toISOString(),
                $updated: new Date().toISOString()
            };

            if (profile.name) profileData.$name = profile.name;
            if (profile.email) profileData.$email = profile.email;
            if (profile.phone) profileData.$phone = profile.phone;
            if (profile.avatar_url) profileData.$avatar = profile.avatar_url;
            if (profile.company_size) profileData.company_size = profile.company_size;
            if (profile.industry) profileData.industry = profile.industry;
            if (profile.role) profileData.role = profile.role;
            if (profile.signup_date) profileData.signup_date = new Date(profile.signup_date).toISOString();
            if (profile.plan_type) profileData.plan_type = profile.plan_type;
            if (profile.total_spend !== undefined) profileData.total_spend = profile.total_spend;
            if (profile.lifetime_cost_savings !== undefined) profileData.lifetime_cost_savings = profile.lifetime_cost_savings;
            if (profile.company_name) profileData.company_name = profile.company_name;

            mixpanel.people.set(profileData);
            console.debug('Comprehensive user profile set:', userId);
        } catch (error) {
            console.error('Error setting comprehensive user profile:', error);
        }
    }

    /**
     * Track user lifecycle stage
     */
    public trackUserLifecycleStage(userId: string, stage: {
        onboarding_progress?: number; // 0-100
        feature_adoption_score?: number; // 0-100
        activation_status?: 'activated' | 'pending' | 'inactive';
        onboarding_complete?: boolean;
        first_project_created?: boolean;
        first_api_call_made?: boolean;
        first_optimization_applied?: boolean;
        days_since_signup?: number;
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            mixpanel.people.set(stage);
            console.debug('User lifecycle stage tracked:', userId, stage);
        } catch (error) {
            console.error('Error tracking user lifecycle stage:', error);
        }
    }

    /**
     * Calculate and track feature adoption score
     */
    public calculateFeatureAdoptionScore(userId: string, usedFeatures: string[], totalFeatures: number = 44): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            const adoptionScore = (usedFeatures.length / totalFeatures) * 100;
            mixpanel.identify(userId);
            mixpanel.people.set({
                feature_adoption_score: Math.round(adoptionScore),
                features_used_count: usedFeatures.length,
                features_used: usedFeatures,
                last_feature_used: usedFeatures[usedFeatures.length - 1] || null,
                feature_adoption_tier: this.getFeatureAdoptionTier(adoptionScore)
            });
            console.debug('Feature adoption score calculated:', userId, adoptionScore);
        } catch (error) {
            console.error('Error calculating feature adoption score:', error);
        }
    }

    /**
     * Update user spending metrics
     */
    public updateUserSpendingMetrics(userId: string, metrics: {
        total_spend?: number;
        average_transaction_value?: number;
        last_purchase_date?: Date | string;
        last_purchase_amount?: number;
        total_transactions?: number;
        lifetime_value?: number;
        spending_tier?: 'high_value' | 'medium_value' | 'low_value' | 'free';
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            const spendingData: Record<string, any> = {};
            
            if (metrics.total_spend !== undefined) spendingData.total_spend = metrics.total_spend;
            if (metrics.average_transaction_value !== undefined) spendingData.average_transaction_value = metrics.average_transaction_value;
            if (metrics.last_purchase_date) spendingData.last_purchase_date = new Date(metrics.last_purchase_date).toISOString();
            if (metrics.last_purchase_amount !== undefined) spendingData.last_purchase_amount = metrics.last_purchase_amount;
            if (metrics.total_transactions !== undefined) spendingData.total_transactions = metrics.total_transactions;
            if (metrics.lifetime_value !== undefined) spendingData.lifetime_value = metrics.lifetime_value;
            if (metrics.spending_tier) spendingData.spending_tier = metrics.spending_tier;

            mixpanel.people.set(spendingData);
            console.debug('User spending metrics updated:', userId);
        } catch (error) {
            console.error('Error updating user spending metrics:', error);
        }
    }

    /**
     * Register super properties that attach to every event
     */
    public registerSuperProperties(properties: {
        app_version?: string;
        user_tier?: string;
        active_project?: string;
        deployment_env?: string;
        [key: string]: any;
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.register(properties);
            console.debug('Super properties registered:', properties);
        } catch (error) {
            console.error('Error registering super properties:', error);
        }
    }

    /**
     * Register super properties once (won't overwrite if already set)
     */
    public registerOnceSuperProperties(properties: {
        initial_referrer?: string;
        signup_source?: string;
        first_touch_campaign?: string;
        initial_landing_page?: string;
        [key: string]: any;
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.register_once(properties);
            console.debug('Super properties registered once:', properties);
        } catch (error) {
            console.error('Error registering once super properties:', error);
        }
    }

    /**
     * Unregister a super property
     */
    public unregisterSuperProperty(propertyName: string): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.unregister(propertyName);
            console.debug('Super property unregistered:', propertyName);
        } catch (error) {
            console.error('Error unregistering super property:', error);
        }
    }

    /**
     * Conditional session replay - start recording for important sessions
     */
    public startConditionalRecording(reason: 'error' | 'conversion' | 'high_value_user' | 'support_request', metadata?: Record<string, any>): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            if (this.shouldRecordSession(reason)) {
                this.startSessionRecording();
                this.track('Session Recording Started', {
                    reason,
                    recording_strategy: 'conditional',
                    ...metadata
                });
                console.debug('Conditional session recording started:', reason);
            }
        } catch (error) {
            console.error('Error starting conditional recording:', error);
        }
    }

    /**
     * Determine if session should be recorded based on reason
     */
    private shouldRecordSession(reason: string): boolean {
        const recordingRules: Record<string, boolean> = {
            error: true, // Always record errors
            conversion: true, // Always record conversions
            high_value_user: true, // Always record high-value users
            support_request: true // Always record support requests
        };
        return recordingRules[reason] || false;
    }

    /**
     * Helper: Get feature adoption tier
     */
    private getFeatureAdoptionTier(score: number): string {
        if (score >= 75) return 'power_user';
        if (score >= 50) return 'engaged';
        if (score >= 25) return 'casual';
        return 'inactive';
    }

    /**
     * ===== COHORT ANALYSIS =====
     */

    /**
     * Set cohort properties for user segmentation
     */
    public setCohortProperties(userId: string, properties: {
        signup_date?: Date | string;
        acquisition_channel?: string;
        initial_plan?: string;
        initial_use_case?: string;
        user_segment?: string;
        signup_source?: string;
        first_touch_campaign?: string;
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            const cohortData: Record<string, any> = {};

            if (properties.signup_date) {
                const signupDate = new Date(properties.signup_date);
                cohortData.signup_date = signupDate.toISOString();
                cohortData.signup_week = this.getWeekOfYear(signupDate);
                cohortData.signup_month = this.getMonthYear(signupDate);
                cohortData.signup_year = signupDate.getFullYear();
                cohortData.days_since_signup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
            }

            if (properties.acquisition_channel) cohortData.acquisition_channel = properties.acquisition_channel;
            if (properties.initial_plan) cohortData.initial_plan = properties.initial_plan;
            if (properties.initial_use_case) cohortData.initial_use_case = properties.initial_use_case;
            if (properties.user_segment) cohortData.user_segment = properties.user_segment;
            if (properties.signup_source) cohortData.signup_source = properties.signup_source;
            if (properties.first_touch_campaign) cohortData.first_touch_campaign = properties.first_touch_campaign;

            mixpanel.people.set(cohortData);
            console.debug('Cohort properties set:', userId, cohortData);
        } catch (error) {
            console.error('Error setting cohort properties:', error);
        }
    }

    /**
     * Set behavioral cohort properties
     */
    public setBehavioralCohort(userId: string, properties: {
        activation_status?: 'activated' | 'pending' | 'inactive';
        engagement_score?: number; // 0-100
        usage_tier?: 'power_user' | 'regular' | 'casual' | 'inactive';
        feature_adoption_tier?: string;
        spending_tier?: 'high_value' | 'medium_value' | 'low_value' | 'free';
        churn_risk?: 'low' | 'medium' | 'high';
        health_score?: number; // 0-100
    }): void {
        if (!this.isEnabled || !this.isInitialized) {
            return;
        }

        try {
            mixpanel.identify(userId);
            mixpanel.people.set({
                ...properties,
                behavioral_cohort_updated: new Date().toISOString()
            });
            console.debug('Behavioral cohort set:', userId, properties);
        } catch (error) {
            console.error('Error setting behavioral cohort:', error);
        }
    }

    /**
     * Helper: Get week of year
     */
    private getWeekOfYear(date: Date): string {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    }

    /**
     * Helper: Get month-year
     */
    private getMonthYear(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${date.getFullYear()}-${month}`;
    }
}

// Export singleton instance
export const mixpanelService = MixpanelService.getInstance(); 