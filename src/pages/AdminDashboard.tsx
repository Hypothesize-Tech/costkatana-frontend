import React, { useState, useEffect } from 'react';
import {
    UsersIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    FireIcon,
    CpuChipIcon,
    FolderIcon,
    CommandLineIcon,
    BellIcon,
    ClockIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    CircleStackIcon,
    Squares2X2Icon,
    RocketLaunchIcon,
    ArrowTrendingUpIcon,
    ServerIcon,
    BriefcaseIcon,
    SparklesIcon,
    ChartPieIcon,
    ArrowTrendingDownIcon,
    CheckCircleIcon,
    CubeIcon,
    BuildingOfficeIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';
import {
    ChartBarIcon as ChartBarIconSolid,
    UsersIcon as UsersIconSolid,
    FireIcon as FireIconSolid,
    ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from '@heroicons/react/24/solid';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import {
    AdminDashboardService,
    EngagementMetrics,
    UserGrowthTrend,
    Alert,
    ModelComparison,
    ServiceComparison,
    FeatureUsageStats,
    FeatureAdoption,
    ProjectStats,
    WorkspaceStats,
    AdminDashboardFilters,
} from '../services/adminDashboard.service';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { ExportReports } from '../components/admin/ExportReports';
import { RealTimeActivityFeed } from '../components/admin/RealTimeActivityFeed';
import { UserManagement } from '../components/admin/UserManagement';
import {
    generateLineChartData,
    generateDoughnutChartData,
    getLineChartOptions,
    getDoughnutChartOptions,
} from '../utils/chartConfig';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'growth' | 'alerts' | 'models' | 'features' | 'projects' | 'activity' | 'users'
    >('overview');

    const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
    const [growthTrends, setGrowthTrends] = useState<UserGrowthTrend[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [modelComparison, setModelComparison] = useState<ModelComparison[]>([]);
    const [serviceComparison, setServiceComparison] = useState<ServiceComparison[]>([]);
    const [featureUsage, setFeatureUsage] = useState<FeatureUsageStats[]>([]);
    const [featureAdoption, setFeatureAdoption] = useState<FeatureAdoption[]>([]);
    const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
    const [workspaceStats, setWorkspaceStats] = useState<WorkspaceStats[]>([]);

    const [filters, setFilters] = useState<AdminDashboardFilters>({
        period: 'daily',
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showNotification } = useNotification();

    const fetchData = async () => {
        try {
            setRefreshing(true);

            const promises: Promise<unknown>[] = [
                AdminDashboardService.getUserEngagementMetrics(filters),
            ];

            // Fetch based on active tab
            if (activeTab === 'overview' || activeTab === 'growth') {
                promises.push(AdminDashboardService.getUserGrowthTrends(filters));
            }

            if (activeTab === 'overview' || activeTab === 'alerts') {
                promises.push(AdminDashboardService.getCurrentAlerts());
            }

            if (activeTab === 'overview' || activeTab === 'models') {
                promises.push(
                    AdminDashboardService.getModelComparison(filters),
                    AdminDashboardService.getServiceComparison(filters)
                );
            }

            if (activeTab === 'overview' || activeTab === 'features') {
                promises.push(
                    AdminDashboardService.getFeatureUsageStats(filters),
                    AdminDashboardService.getFeatureAdoptionRates(filters)
                );
            }

            if (activeTab === 'overview' || activeTab === 'projects') {
                promises.push(
                    AdminDashboardService.getProjectAnalytics(filters),
                    AdminDashboardService.getWorkspaceAnalytics(filters)
                );
            }

            const results: unknown[] = await Promise.all(promises);

            let idx = 0;
            setEngagementMetrics(results[idx++] as EngagementMetrics);

            if (activeTab === 'overview' || activeTab === 'growth') {
                setGrowthTrends((results[idx++] as UserGrowthTrend[]) || []);
            }

            if (activeTab === 'overview' || activeTab === 'alerts') {
                setAlerts((results[idx++] as Alert[]) || []);
            }

            if (activeTab === 'overview' || activeTab === 'models') {
                setModelComparison((results[idx++] as ModelComparison[]) || []);
                setServiceComparison((results[idx++] as ServiceComparison[]) || []);
            }

            if (activeTab === 'overview' || activeTab === 'features') {
                setFeatureUsage((results[idx++] as FeatureUsageStats[]) || []);
                setFeatureAdoption((results[idx++] as FeatureAdoption[]) || []);
            }

            if (activeTab === 'overview' || activeTab === 'projects') {
                setProjectStats((results[idx++] as ProjectStats[]) || []);
                setWorkspaceStats((results[idx++] as WorkspaceStats[]) || []);
            }
        } catch (error: unknown) {
            console.error('Error fetching admin dashboard data:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load dashboard data';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, filters]);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon, activeIcon: ChartBarIconSolid, description: 'Platform insights and metrics' },
        { id: 'growth', name: 'User Growth', icon: ArrowTrendingUpIcon, activeIcon: UsersIconSolid, description: 'User acquisition and engagement' },
        { id: 'alerts', name: 'Alerts & Anomalies', icon: BellIcon, activeIcon: ExclamationTriangleIconSolid, description: 'System alerts and issues' },
        { id: 'models', name: 'Models & Services', icon: ServerIcon, activeIcon: CpuChipIcon, description: 'AI model performance' },
        { id: 'features', name: 'Features', icon: SparklesIcon, activeIcon: CommandLineIcon, description: 'Feature usage analytics' },
        { id: 'projects', name: 'Projects & Workspaces', icon: BriefcaseIcon, activeIcon: FolderIcon, description: 'Project and workspace stats' },
        { id: 'users', name: 'User Management', icon: UserGroupIcon, activeIcon: UsersIconSolid, description: 'Manage users and permissions' },
        { id: 'activity', name: 'Activity Feed', icon: BoltIcon, activeIcon: FireIconSolid, description: 'Real-time platform activity' },
    ];

    const handleDateRangeChange = (startDate?: string, endDate?: string) => {
        setFilters(prev => ({
            ...prev,
            startDate,
            endDate,
        }));
    };

    const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
        setFilters(prev => ({
            ...prev,
            period,
        }));
    };

    if (loading && !engagementMetrics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-6">
                <div className="max-w-[1600px] mx-auto">
                    <div className="glass p-12 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-3xl">
                        <LoadingSpinner />
                    </div>
                </div>
            </div>
        );
    }

    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Premium Header */}
                <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-dark-card/80 dark:via-dark-card/60 dark:to-dark-card/80">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl shadow-2xl glow-primary">
                                    <ChartBarIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                                    Admin Dashboard
                                </h1>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary font-body text-base">
                                    Comprehensive platform analytics and monitoring
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl border border-primary-200/30 font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-dark-surface/50 dark:to-dark-surface/30"
                            >
                                <ArrowPathIcon
                                    className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </button>
                            <ExportReports
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                sections={['user_spending', 'model_comparison', 'feature_analytics', 'project_analytics']}
                            />
                        </div>
                    </div>

                    {/* Premium Tabs */}
                    <div className="flex flex-wrap gap-3">
                        {tabs.map((tab) => {
                            const Icon = activeTab === tab.id ? tab.activeIcon : tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`group relative flex flex-col items-start gap-2 px-5 py-4 rounded-xl font-display font-semibold transition-all duration-300 min-w-[140px] ${isActive
                                        ? 'bg-gradient-primary text-white shadow-2xl glow-primary scale-105'
                                        : 'glass border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:bg-white/20 dark:hover:bg-dark-surface/20 hover:scale-105 hover:shadow-xl'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5 w-full">
                                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary-500 dark:text-primary-400'}`} />
                                        <span className="text-sm">{tab.name}</span>
                                    </div>
                                    {isActive && (
                                        <p className="text-xs text-white/80 font-body mt-1">
                                            {tab.description}
                                        </p>
                                    )}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        engagementMetrics={engagementMetrics}
                        growthTrends={growthTrends}
                        alerts={alerts}
                        modelComparison={modelComparison}
                        serviceComparison={serviceComparison}
                        featureUsage={featureUsage}
                        projectStats={projectStats}
                        workspaceStats={workspaceStats}
                        criticalAlerts={criticalAlerts}
                        filters={filters}
                        onDateRangeChange={handleDateRangeChange}
                        onPeriodChange={handlePeriodChange}
                    />
                )}

                {/* User Growth Tab */}
                {activeTab === 'growth' && (
                    <UserGrowthTab
                        engagementMetrics={engagementMetrics}
                        growthTrends={growthTrends}
                        filters={filters}
                        onDateRangeChange={handleDateRangeChange}
                        onPeriodChange={handlePeriodChange}
                    />
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                    <AlertsTab
                        alerts={alerts}
                        onRefresh={fetchData}
                    />
                )}

                {/* Models & Services Tab */}
                {activeTab === 'models' && (
                    <ModelsTab
                        modelComparison={modelComparison}
                        serviceComparison={serviceComparison}
                        filters={filters}
                        onDateRangeChange={handleDateRangeChange}
                    />
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <FeaturesTab
                        featureUsage={featureUsage}
                        featureAdoption={featureAdoption}
                        filters={filters}
                        onDateRangeChange={handleDateRangeChange}
                    />
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <ProjectsTab
                        projectStats={projectStats}
                        workspaceStats={workspaceStats}
                        filters={filters}
                        onDateRangeChange={handleDateRangeChange}
                    />
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <UserManagementTab onRefresh={fetchData} />
                )}

                {/* Activity Feed Tab */}
                {activeTab === 'activity' && (
                    <RealTimeActivityFeed limit={50} />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
interface OverviewTabProps {
    engagementMetrics: EngagementMetrics | null;
    growthTrends: UserGrowthTrend[];
    alerts: Alert[];
    modelComparison: ModelComparison[];
    serviceComparison: ServiceComparison[];
    featureUsage: FeatureUsageStats[];
    projectStats: ProjectStats[];
    workspaceStats: WorkspaceStats[];
    criticalAlerts: Alert[];
    filters: AdminDashboardFilters;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
    onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
}

interface UserGrowthTabProps {
    engagementMetrics: EngagementMetrics | null;
    growthTrends: UserGrowthTrend[];
    filters: AdminDashboardFilters;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
    onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
}

interface AlertsTabProps {
    alerts: Alert[];
    onRefresh: () => void;
}

interface ModelsTabProps {
    modelComparison: ModelComparison[];
    serviceComparison: ServiceComparison[];
    filters: AdminDashboardFilters;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
}

interface FeaturesTabProps {
    featureUsage: FeatureUsageStats[];
    featureAdoption: FeatureAdoption[];
    filters: AdminDashboardFilters;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
}

interface ProjectsTabProps {
    projectStats: ProjectStats[];
    workspaceStats: WorkspaceStats[];
    filters: AdminDashboardFilters;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    engagementMetrics,
    growthTrends,
    criticalAlerts,
    modelComparison,
    featureUsage,
}) => {
    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg glow-primary">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-display font-semibold">
                            Total
                        </span>
                    </div>
                    <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Total Users
                    </h3>
                    <p className="text-3xl font-display font-bold gradient-text">
                        {formatNumber(engagementMetrics?.totalUsers || 0)}
                    </p>
                </div>

                <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg glow-primary">
                            <FireIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-display font-semibold">
                            Active
                        </span>
                    </div>
                    <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Active Users
                    </h3>
                    <p className="text-3xl font-display font-bold gradient-text">
                        {formatNumber(engagementMetrics?.activeUsers || 0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-display font-semibold">
                            {((engagementMetrics?.activeUsers || 0) / (engagementMetrics?.totalUsers || 1) * 100).toFixed(1)}% of total
                        </span>
                    </div>
                </div>

                <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg glow-primary">
                            <ChartPieIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-display font-semibold">
                            Rate
                        </span>
                    </div>
                    <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Retention Rate
                    </h3>
                    <p className="text-3xl font-display font-bold gradient-text">
                        {(engagementMetrics?.retentionRate || 0).toFixed(1)}%
                    </p>
                </div>

                <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg glow-primary">
                            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${criticalAlerts.length > 0
                            ? 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                            {criticalAlerts.length > 0 ? 'Alert' : 'OK'}
                        </span>
                    </div>
                    <h3 className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Critical Alerts
                    </h3>
                    <p className={`text-3xl font-display font-bold ${criticalAlerts.length > 0 ? 'text-red-600 dark:text-red-400' : 'gradient-text'
                        }`}>
                        {criticalAlerts.length}
                    </p>
                </div>
            </div>

            {/* Growth Chart */}
            {growthTrends.length > 0 && (
                <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                            <PresentationChartLineIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold gradient-text">
                                User Growth Trends
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                Track user acquisition over time
                            </p>
                        </div>
                    </div>
                    <div className="h-80">
                        <Line
                            data={generateLineChartData(
                                growthTrends.map(t => t.date),
                                [
                                    {
                                        label: 'New Users',
                                        data: growthTrends.map(t => t.newUsers),
                                        color: '#3B82F6',
                                    },
                                    {
                                        label: 'Total Users',
                                        data: growthTrends.map(t => t.totalUsers),
                                        color: '#10B981',
                                    },
                                    {
                                        label: 'Active Users',
                                        data: growthTrends.map(t => t.activeUsers),
                                        color: '#F59E0B',
                                    },
                                ]
                            )}
                            options={getLineChartOptions()}
                        />
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Models */}
                {modelComparison.length > 0 && (
                    <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                                <CpuChipIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    Top Models by Cost
                                </h3>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Most expensive AI models
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                        <th className="text-left py-3 px-4 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Model</th>
                                        <th className="text-right py-3 px-4 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                        <th className="text-right py-3 px-4 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                        <th className="text-right py-3 px-4 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modelComparison.slice(0, 5).map((model, idx) => (
                                        <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                            <td className="py-3 px-4 font-display font-medium text-light-text-primary dark:text-dark-text-primary">{model.model}</td>
                                            <td className="text-right py-3 px-4 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(model.totalCost)}</td>
                                            <td className="text-right py-3 px-4 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(model.totalRequests)}</td>
                                            <td className="text-right py-3 px-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-display font-semibold ${model.efficiencyScore > 7
                                                    ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                    : model.efficiencyScore > 4
                                                        ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {model.efficiencyScore.toFixed(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Feature Usage */}
                {featureUsage.length > 0 && (
                    <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    Feature Usage
                                </h3>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Cost breakdown by feature
                                </p>
                            </div>
                        </div>
                        <div className="h-64">
                            <Doughnut
                                data={generateDoughnutChartData(
                                    featureUsage.map(f => f.feature),
                                    featureUsage.map(f => f.totalCost),
                                    ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
                                )}
                                options={getDoughnutChartOptions()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// User Growth Tab Component
const UserGrowthTab: React.FC<UserGrowthTabProps> = ({
    engagementMetrics,
    growthTrends,
}) => {
    return (
        <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Users"
                    value={engagementMetrics?.totalUsers || 0}
                    icon={UsersIcon}
                    format="number"
                />
                <StatsCard
                    title="Active Users"
                    value={engagementMetrics?.activeUsers || 0}
                    icon={FireIcon}
                    format="number"
                />
                <StatsCard
                    title="Retention Rate"
                    value={engagementMetrics?.retentionRate || 0}
                    icon={ChartBarIcon}
                    format="percentage"
                />
            </div>

            {/* Growth Chart */}
            {growthTrends.length > 0 && (
                <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                            <PresentationChartLineIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold gradient-text">
                                User Growth Trends
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                Track user acquisition and engagement over time
                            </p>
                        </div>
                    </div>
                    <div className="h-96">
                        <Line
                            data={generateLineChartData(
                                growthTrends.map(t => t.date),
                                [
                                    {
                                        label: 'New Users',
                                        data: growthTrends.map(t => t.newUsers),
                                        color: '#3B82F6',
                                    },
                                    {
                                        label: 'Total Users',
                                        data: growthTrends.map(t => t.totalUsers),
                                        color: '#10B981',
                                    },
                                    {
                                        label: 'Active Users',
                                        data: growthTrends.map(t => t.activeUsers),
                                        color: '#F59E0B',
                                    },
                                ]
                            )}
                            options={getLineChartOptions()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Alerts Tab Component
const AlertsTab: React.FC<AlertsTabProps> = ({ alerts }) => {
    const severityColors = {
        critical: {
            bg: 'bg-red-100/50 dark:bg-red-900/30',
            text: 'text-red-600 dark:text-red-400',
            icon: 'bg-gradient-to-br from-red-500 to-red-600',
            border: 'border-red-200/50 dark:border-red-800/50',
        },
        high: {
            bg: 'bg-orange-100/50 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400',
            icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
            border: 'border-orange-200/50 dark:border-orange-800/50',
        },
        medium: {
            bg: 'bg-yellow-100/50 dark:bg-yellow-900/30',
            text: 'text-yellow-600 dark:text-yellow-400',
            icon: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
            border: 'border-yellow-200/50 dark:border-yellow-800/50',
        },
        low: {
            bg: 'bg-blue-100/50 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
            border: 'border-blue-200/50 dark:border-blue-800/50',
        },
    };

    return (
        <div className="space-y-6">
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                            <BellIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold gradient-text">
                                Current Alerts
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                System alerts and anomalies
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-display font-semibold shadow-lg ${alerts.length > 0
                        ? 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                        {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
                    </span>
                </div>
                <div className="space-y-4">
                    {alerts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/50 dark:bg-green-900/30 mb-4">
                                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                All Clear!
                            </p>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary font-body">
                                No active alerts at this time
                            </p>
                        </div>
                    ) : (
                        alerts.map((alert, idx) => {
                            const severity = severityColors[alert.severity];
                            return (
                                <div
                                    key={idx}
                                    className={`p-6 glass rounded-xl border ${severity.border} hover:scale-[1.01] transition-all duration-300 bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${severity.icon} shadow-lg flex-shrink-0`}>
                                            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase tracking-wide ${severity.bg} ${severity.text}`}>
                                                    {alert.severity}
                                                </span>
                                                <h4 className="font-display font-bold text-lg text-light-text-primary dark:text-dark-text-primary">
                                                    {alert.title}
                                                </h4>
                                            </div>
                                            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 font-body leading-relaxed">
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                <div className="flex items-center gap-1.5">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                                </div>
                                                {alert.type && (
                                                    <span className="px-2 py-1 rounded-lg bg-primary-100/30 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                                                        {alert.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

// Models Tab Component
const ModelsTab: React.FC<ModelsTabProps> = ({
    modelComparison,
    serviceComparison,
}) => {
    return (
        <div className="space-y-6">
            {/* Model Comparison */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                        <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Model Comparison
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Performance metrics across AI models
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Model</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Tokens</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Error Rate</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modelComparison.map((model, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <CubeIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{model.model}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(model.totalCost)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(model.totalTokens)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(model.totalRequests)}</td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${model.errorRate < 0.01
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : model.errorRate < 0.05
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {(model.errorRate * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${model.efficiencyScore > 7
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : model.efficiencyScore > 4
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {model.efficiencyScore.toFixed(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Comparison */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                        <ServerIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Service Comparison
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Performance across AI services
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Service</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Tokens</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Error Rate</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceComparison.map((service, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <CircleStackIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{service.service}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(service.totalCost)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(service.totalTokens)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(service.totalRequests)}</td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${service.errorRate < 0.01
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : service.errorRate < 0.05
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {(service.errorRate * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${service.efficiencyScore > 7
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : service.efficiencyScore > 4
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {service.efficiencyScore.toFixed(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Features Tab Component
const FeaturesTab: React.FC<FeaturesTabProps> = ({
    featureUsage,
    featureAdoption,
}) => {
    return (
        <div className="space-y-6">
            {/* Feature Usage */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Feature Usage Statistics
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Cost and usage breakdown by feature
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Feature</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Tokens</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Users</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Error Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {featureUsage.map((feature, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <CommandLineIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{feature.feature}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(feature.totalCost)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(feature.totalTokens)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(feature.totalRequests)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(feature.uniqueUsers)}</td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${feature.errorRate < 0.01
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : feature.errorRate < 0.05
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {(feature.errorRate * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Feature Adoption */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                        <RocketLaunchIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Feature Adoption Rates
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            User adoption and growth trends
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Feature</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Active Users</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Users</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Adoption Rate</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Growth Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {featureAdoption.map((feature, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <Squares2X2Icon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{feature.feature}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatNumber(feature.activeUsers)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(feature.totalUsers)}</td>
                                    <td className="text-right py-4 px-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${feature.adoptionRate > 50
                                            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : feature.adoptionRate > 25
                                                ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {feature.adoptionRate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="text-right py-4 px-5">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {feature.growthRate > 0 ? (
                                                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`font-display font-semibold ${feature.growthRate > 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {Math.abs(feature.growthRate).toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Projects Tab Component
const ProjectsTab: React.FC<ProjectsTabProps> = ({
    projectStats,
    workspaceStats,
}) => {
    return (
        <div className="space-y-6">
            {/* Projects */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Project Analytics
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Cost and usage by project
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Project</th>
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Workspace</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Budget Usage</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectStats.map((project, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <FolderIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{project.projectName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{project.workspaceName || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(project.totalCost)}</td>
                                    <td className="text-right py-4 px-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="flex-1 max-w-[100px] h-2 rounded-full bg-primary-100/50 dark:bg-primary-900/30 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${project.budgetUsagePercentage > 90
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                        : project.budgetUsagePercentage > 70
                                                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                            : 'bg-gradient-to-r from-green-500 to-green-600'
                                                        }`}
                                                    style={{ width: `${Math.min(project.budgetUsagePercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-display font-semibold min-w-[50px] text-right ${project.isOverBudget
                                                ? 'text-red-600 dark:text-red-400'
                                                : project.budgetUsagePercentage > 70
                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                    : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                {project.budgetUsagePercentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(project.totalRequests)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(project.activeUsers)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Workspaces */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Workspace Analytics
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Aggregated metrics by workspace
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="text-left py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Workspace</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Cost</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Projects</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Requests</th>
                                <th className="text-right py-4 px-5 font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workspaceStats.map((workspace, idx) => (
                                <tr key={idx} className="border-b border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{workspace.workspaceName}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-4 px-5 font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(workspace.totalCost)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(workspace.projectCount)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(workspace.totalRequests)}</td>
                                    <td className="text-right py-4 px-5 font-body text-light-text-secondary dark:text-dark-text-secondary">{formatNumber(workspace.activeUsers)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// User Management Tab Component
const UserManagementTab: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
    return <UserManagement onRefresh={onRefresh} />;
};
