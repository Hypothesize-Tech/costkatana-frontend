import React, { useState, useEffect } from 'react';
import { useMixpanel } from '../../hooks/useMixpanel';

/**
 * Example component demonstrating business, marketing, and sales analytics tracking
 * This shows how to track comprehensive business metrics for market research and analysis
 */
export const BusinessAnalyticsExample: React.FC = () => {
    const [sessionId] = useState(`session_${Date.now()}`);
    const [pageStartTime] = useState(Date.now());
    const [interactions, setInteractions] = useState(0);
    const [scrollDepth, setScrollDepth] = useState(0);
    const [buttonClicks, setButtonClicks] = useState<Record<string, number>>({});

    const {
        trackBusinessMetric,
        trackMarketingData,
        trackSalesData,
        trackPageAnalytics,
        trackButtonAnalytics,
        trackUserAction,
        trackFeatureUsage,
        isTrackingEnabled
    } = useMixpanel();

    // Track page analytics on component mount/unmount
    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            setScrollDepth(Math.max(scrollDepth, scrollPercent));
        };

        const handleInteraction = () => {
            setInteractions(prev => prev + 1);
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);

            // Track page analytics on unmount
            const timeOnPage = Date.now() - pageStartTime;
            trackPageAnalytics(
                '/business-analytics-example',
                'Business Analytics Example',
                timeOnPage,
                scrollDepth,
                interactions,
                timeOnPage < 10000, // Bounce if less than 10 seconds
                sessionId,
                { component: 'BusinessAnalyticsExample' }
            );
        };
    }, [trackPageAnalytics, pageStartTime, scrollDepth, interactions, sessionId]);

    // Track button clicks with analytics
    const handleButtonClick = (buttonId: string, buttonText: string, position: string) => {
        const clicks = (buttonClicks[buttonId] || 0) + 1;
        setButtonClicks(prev => ({ ...prev, [buttonId]: clicks }));

        // Track button analytics
        trackButtonAnalytics(
            buttonId,
            buttonText,
            '/business-analytics-example',
            'business_analytics_page',
            position,
            clicks,
            sessionId,
            { action: 'click', timestamp: new Date().toISOString() }
        );

        // Track user action
        trackUserAction(
            'click',
            '/business-analytics-example',
            'business_analytics_page',
            buttonId,
            { buttonText, position, clicks }
        );
    };

    // Business metrics tracking
    const handleRevenueTracking = () => {
        trackBusinessMetric(
            'revenue',
            50000,
            'monthly',
            '/business-analytics-example',
            'revenue_tracker',
            45000, // Previous month comparison
            { source: 'subscriptions', period: 'current_month' }
        );
    };

    const handleCostSavingsTracking = () => {
        trackBusinessMetric(
            'cost_savings',
            15000,
            'monthly',
            '/business-analytics-example',
            'cost_savings_tracker',
            12000, // Previous month comparison
            { source: 'optimization', savings_type: 'ai_costs' }
        );
    };

    const handleUserAcquisitionTracking = () => {
        trackBusinessMetric(
            'user_acquisition',
            250,
            'monthly',
            '/business-analytics-example',
            'acquisition_tracker',
            200, // Previous month comparison
            { source: 'organic', campaign: 'content_marketing' }
        );
    };

    const handleRetentionTracking = () => {
        trackBusinessMetric(
            'retention',
            85.5,
            'monthly',
            '/business-analytics-example',
            'retention_tracker',
            82.0, // Previous month comparison
            { cohort: 'monthly', segment: 'premium_users' }
        );
    };

    // Marketing data tracking
    const handleEmailCampaignTracking = () => {
        trackMarketingData(
            'email_newsletter_q1_2024',
            'email',
            'email',
            '/business-analytics-example',
            'marketing_tracker',
            'cost optimization',
            'newsletter_signup',
            { campaign_id: 'email_q1_2024', list: 'engaged_users' }
        );
    };

    const handleSocialMediaTracking = () => {
        trackMarketingData(
            'linkedin_thought_leadership',
            'linkedin',
            'social',
            '/business-analytics-example',
            'marketing_tracker',
            'AI cost optimization',
            'thought_leadership_post',
            { campaign_id: 'linkedin_q1_2024', audience: 'tech_leaders' }
        );
    };

    const handleSearchCampaignTracking = () => {
        trackMarketingData(
            'google_ads_cost_optimization',
            'google',
            'cpc',
            '/business-analytics-example',
            'marketing_tracker',
            'AI cost optimization tools',
            'search_ad',
            { campaign_id: 'google_q1_2024', ad_group: 'cost_optimization' }
        );
    };

    // Sales data tracking
    const handleLeadTracking = () => {
        trackSalesData(
            'lead',
            5000,
            0.3,
            '/business-analytics-example',
            'sales_tracker',
            { source: 'website', lead_score: 75, industry: 'technology' }
        );
    };

    const handleQualifiedLeadTracking = () => {
        trackSalesData(
            'qualified',
            15000,
            0.6,
            '/business-analytics-example',
            'sales_tracker',
            { source: 'demo_request', lead_score: 85, company_size: 'enterprise' }
        );
    };

    const handleProposalTracking = () => {
        trackSalesData(
            'proposal',
            50000,
            0.8,
            '/business-analytics-example',
            'sales_tracker',
            { proposal_type: 'enterprise', deal_size: 'large', competitor: 'none' }
        );
    };

    const handleClosedWonTracking = () => {
        trackSalesData(
            'closed_won',
            75000,
            1.0,
            '/business-analytics-example',
            'sales_tracker',
            { contract_length: '12_months', payment_terms: 'net_30', upsell_potential: 'high' }
        );
    };

    // Feature usage tracking
    const handleFeatureUsage = (feature: string, action: string) => {
        trackFeatureUsage(
            feature,
            action,
            '/business-analytics-example',
            'business_analytics_page',
            { sessionId, timestamp: new Date().toISOString() }
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Business Analytics Tracking Examples
                </h2>
                <p className="text-gray-600">
                    This component demonstrates comprehensive business, marketing, and sales analytics tracking for market research and analysis.
                    {isTrackingEnabled ? (
                        <span className="text-green-600 ml-2">✓ Tracking enabled</span>
                    ) : (
                        <span className="text-red-600 ml-2">✗ Tracking disabled</span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Business Metrics */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Business Metrics</h3>
                    <div className="space-y-2">
                        <button
                            onClick={handleRevenueTracking}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            Track Revenue
                        </button>
                        <button
                            onClick={handleCostSavingsTracking}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Track Cost Savings
                        </button>
                        <button
                            onClick={handleUserAcquisitionTracking}
                            className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        >
                            Track User Acquisition
                        </button>
                        <button
                            onClick={handleRetentionTracking}
                            className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                        >
                            Track Retention
                        </button>
                    </div>
                </div>

                {/* Marketing Data */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Marketing Data</h3>
                    <div className="space-y-2">
                        <button
                            onClick={handleEmailCampaignTracking}
                            className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                        >
                            Track Email Campaign
                        </button>
                        <button
                            onClick={handleSocialMediaTracking}
                            className="w-full px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
                        >
                            Track Social Media
                        </button>
                        <button
                            onClick={handleSearchCampaignTracking}
                            className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                        >
                            Track Search Campaign
                        </button>
                    </div>
                </div>

                {/* Sales Data */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Sales Pipeline</h3>
                    <div className="space-y-2">
                        <button
                            onClick={handleLeadTracking}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                            Track Lead
                        </button>
                        <button
                            onClick={handleQualifiedLeadTracking}
                            className="w-full px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                        >
                            Track Qualified Lead
                        </button>
                        <button
                            onClick={handleProposalTracking}
                            className="w-full px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
                        >
                            Track Proposal
                        </button>
                        <button
                            onClick={handleClosedWonTracking}
                            className="w-full px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                        >
                            Track Closed Won
                        </button>
                    </div>
                </div>

                {/* Feature Usage */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Feature Usage</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleFeatureUsage('optimization', 'applied')}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Track Optimization Usage
                        </button>
                        <button
                            onClick={() => handleFeatureUsage('analytics', 'viewed')}
                            className="w-full px-3 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 text-sm"
                        >
                            Track Analytics Usage
                        </button>
                        <button
                            onClick={() => handleFeatureUsage('export', 'requested')}
                            className="w-full px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
                        >
                            Track Export Usage
                        </button>
                    </div>
                </div>

                {/* Button Analytics */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Button Analytics</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleButtonClick('primary_cta', 'Get Started', 'header')}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Primary CTA (Header)
                        </button>
                        <button
                            onClick={() => handleButtonClick('secondary_cta', 'Learn More', 'sidebar')}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                            Secondary CTA (Sidebar)
                        </button>
                        <button
                            onClick={() => handleButtonClick('submit_button', 'Submit Form', 'modal')}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            Submit Button (Modal)
                        </button>
                    </div>
                </div>

                {/* Page Analytics */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Page Analytics</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• Time on Page: {Math.round((Date.now() - pageStartTime) / 1000)}s</p>
                        <p>• Interactions: {interactions}</p>
                        <p>• Scroll Depth: {scrollDepth}%</p>
                        <p>• Session ID: {sessionId}</p>
                        <p>• Button Clicks: {Object.values(buttonClicks).reduce((a, b) => a + b, 0)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Analytics Capabilities</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Business Metrics:</strong> Revenue, cost savings, user acquisition, retention, conversion, engagement, churn, lifetime value</p>
                    <p>• <strong>Marketing Data:</strong> Campaign tracking, source attribution, medium analysis, UTM parameters</p>
                    <p>• <strong>Sales Pipeline:</strong> Lead tracking, qualification, proposals, negotiations, closed deals</p>
                    <p>• <strong>Page Analytics:</strong> Time on page, scroll depth, interactions, bounce rate, session tracking</p>
                    <p>• <strong>Button Analytics:</strong> Click tracking, position analysis, engagement metrics, conversion tracking</p>
                    <p>• <strong>Feature Usage:</strong> Feature adoption, usage patterns, user behavior analysis</p>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Market Research Insights</h3>
                <div className="text-sm text-gray-600">
                    <p>This tracking enables comprehensive market research and analysis:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>User Journey Analysis:</strong> Track complete user paths and identify conversion points</li>
                        <li><strong>Feature Adoption:</strong> Understand which features drive user engagement and retention</li>
                        <li><strong>Marketing ROI:</strong> Measure campaign effectiveness and attribution</li>
                        <li><strong>Sales Performance:</strong> Track pipeline velocity and conversion rates</li>
                        <li><strong>UX Optimization:</strong> Identify high-performing pages and buttons</li>
                        <li><strong>Business Impact:</strong> Correlate user behavior with business metrics</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}; 