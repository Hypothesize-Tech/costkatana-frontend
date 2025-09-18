import React, { useState } from 'react';
import { Shield, TrendingUp, Bell, BarChart3, Settings } from 'lucide-react';
import { UsageOverview } from '../components/guardrails/UsageOverview';
import { UsageTrendChart } from '../components/guardrails/UsageTrendChart';
import { UsageAlerts } from '../components/guardrails/UsageAlerts';

const Guardrails: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts'>('overview');
    const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
    const [trendDays, setTrendDays] = useState(7);

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold gradient-text-primary flex items-center gap-3">
                                    <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                    Usage Guardrails
                                </h1>
                                <p className="text-secondary-600 dark:text-secondary-300 mt-2">
                                    Monitor and manage your resource usage to stay within limits
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.location.href = 'https://www.costkatana.com/#pricing'}
                                    className="btn-primary px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Upgrade Plan
                                </button>
                                <button className="btn-secondary px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
                        <nav className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'overview'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Overview
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('trends')}
                                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'trends'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Trends
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'alerts'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Alerts
                                </div>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            <UsageOverview />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <UsageTrendChart days={7} chartType="area" />
                                <UsageAlerts />
                            </div>
                        </>
                    )}

                    {activeTab === 'trends' && (
                        <>
                            {/* Trend Controls */}
                            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Time Range:</span>
                                        <div className="flex gap-2">
                                            {[7, 14, 30].map(days => (
                                                <button
                                                    key={days}
                                                    onClick={() => setTrendDays(days)}
                                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${trendDays === days
                                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                                        : 'bg-light-bg-300 dark:bg-dark-bg-300 text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10'
                                                        }`}
                                                >
                                                    {days} Days
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Chart Type:</span>
                                        <div className="flex gap-2">
                                            {(['line', 'area', 'bar'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setChartType(type)}
                                                    className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${chartType === type
                                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                                        : 'bg-light-bg-300 dark:bg-dark-bg-300 text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <UsageTrendChart days={trendDays} chartType={chartType} />

                            {/* Additional Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Daily Average</h3>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-highlight-600 dark:text-highlight-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Tokens</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">32.5K</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Requests</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">245</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Cost</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">$4.85</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Peak Usage</h3>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Highest Day</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">Monday</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Peak Hour</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">2-3 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Max Requests</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">487</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Efficiency</h3>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Cache Hit Rate</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">68%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Optimized</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">$127 saved</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-secondary-600 dark:text-secondary-300">Efficiency Score</span>
                                            <span className="text-sm font-medium text-secondary-900 dark:text-white">85/100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <UsageAlerts />
                            </div>
                            <div className="space-y-6">
                                {/* Alert Settings */}
                                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Alert Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-secondary-700 dark:text-secondary-300">Email Alerts</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-light-bg-300 dark:bg-dark-bg-300 peer-focus:outline-none peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-secondary-700 dark:text-secondary-300">Push Notifications</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-light-bg-300 dark:bg-dark-bg-300 peer-focus:outline-none peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-secondary-700 dark:text-secondary-300">Weekly Digest</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-light-bg-300 dark:bg-dark-bg-300 peer-focus:outline-none peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Alert Thresholds */}
                                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Alert Thresholds</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-secondary-700 dark:text-secondary-300">Warning at</label>
                                            <select className="select mt-1 w-full text-sm">
                                                <option>75% usage</option>
                                                <option>80% usage</option>
                                                <option>85% usage</option>
                                                <option>90% usage</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-secondary-700 dark:text-secondary-300">Critical at</label>
                                            <select className="select mt-1 w-full text-sm">
                                                <option>90% usage</option>
                                                <option>95% usage</option>
                                                <option>100% usage</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Guardrails;
