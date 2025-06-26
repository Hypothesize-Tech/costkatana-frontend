import { useQuery } from '@tanstack/react-query';
import {
    CurrencyDollarIcon,
    ChartBarIcon,
    LightBulbIcon,
    CircleStackIcon
} from '@heroicons/react/24/outline';
import { analyticsService } from '@/services/analytics.service';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CostChart } from '@/components/dashboard/CostChart';
import { ServiceBreakdown } from '@/components/dashboard/ServiceBreakdown';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks';
import { useEffect, useState } from 'react';
import { TokenDisplayCard } from '@/components/dashboard/TokenDisplayCard';

export default function Dashboard() {
    const { user, accessToken } = useAuth();
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        const shouldShow = sessionStorage.getItem('showTokenOnLoad') === 'true';
        if (shouldShow) {
            setShowToken(true);
            sessionStorage.removeItem('showTokenOnLoad');
        }
    }, []);

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => analyticsService.getDashboardData(),
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const overview = dashboardData?.data.overview;
    const charts = dashboardData?.data.charts;
    const insights = dashboardData?.data.insights || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.name}!
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Here's an overview of your AI API usage and costs
                </p>
            </div>

            {showToken && accessToken && (
                <TokenDisplayCard
                    token={accessToken}
                    onDismiss={() => setShowToken(false)}
                />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Cost (30d)"
                    value={overview?.totalCost.value || 0}
                    change={overview?.totalCost.change}
                    format="currency"
                    icon={CurrencyDollarIcon}
                    loading={isLoading}
                />
                <StatsCard
                    title="API Calls"
                    value={overview?.totalCalls.value || 0}
                    change={overview?.totalCalls.change}
                    format="number"
                    icon={CircleStackIcon}
                    loading={isLoading}
                />
                <StatsCard
                    title="Avg Cost per Call"
                    value={overview?.avgCostPerCall.value || 0}
                    change={overview?.avgCostPerCall.change}
                    format="currency"
                    icon={ChartBarIcon}
                    loading={isLoading}
                />
                <StatsCard
                    title="Optimizations Saved"
                    value={overview?.totalOptimizationSavings.value || 0}
                    change={overview?.totalOptimizationSavings.change}
                    format="currency"
                    icon={LightBulbIcon}
                    loading={isLoading}
                />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <LightBulbIcon className="w-5 h-5 text-primary-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-primary-800 dark:text-primary-200">
                                AI Insights
                            </h3>
                            <div className="mt-2 text-sm text-primary-700 dark:text-primary-300">
                                <ul className="pl-5 space-y-1 list-disc">
                                    {insights.map((insight, index) => (
                                        <li key={index}>{insight}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CostChart data={charts?.costOverTime || []} loading={isLoading} />
                <ServiceBreakdown data={charts?.serviceBreakdown || []} loading={isLoading} />
            </div>

            {/* Recent Activity */}
            <RecentActivity
                topPrompts={dashboardData?.data.recentActivity?.topPrompts || []}
                optimizationOpportunities={dashboardData?.data.recentActivity?.optimizationOpportunities || 0}
                loading={isLoading}
            />
        </div>
    );
}