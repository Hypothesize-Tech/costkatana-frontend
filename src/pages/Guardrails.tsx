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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-blue-600" />
                                Usage Guardrails
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Monitor and manage your resource usage to stay within limits
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.href = 'https://costkatana.com/pricing'}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Upgrade Plan
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Overview
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('trends')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'trends'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Trends
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'alerts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">Time Range:</span>
                                        <div className="flex gap-2">
                                            {[7, 14, 30].map(days => (
                                                <button
                                                    key={days}
                                                    onClick={() => setTrendDays(days)}
                                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${trendDays === days
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {days} Days
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">Chart Type:</span>
                                        <div className="flex gap-2">
                                            {(['line', 'area', 'bar'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setChartType(type)}
                                                    className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${chartType === type
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Daily Average</h3>
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Tokens</span>
                                            <span className="text-sm font-medium">32.5K</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Requests</span>
                                            <span className="text-sm font-medium">245</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cost</span>
                                            <span className="text-sm font-medium">$4.85</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Peak Usage</h3>
                                        <BarChart3 className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Highest Day</span>
                                            <span className="text-sm font-medium">Monday</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Peak Hour</span>
                                            <span className="text-sm font-medium">2-3 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Max Requests</span>
                                            <span className="text-sm font-medium">487</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Efficiency</h3>
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cache Hit Rate</span>
                                            <span className="text-sm font-medium">68%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Optimized</span>
                                            <span className="text-sm font-medium">$127 saved</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Efficiency Score</span>
                                            <span className="text-sm font-medium">85/100</span>
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
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Email Alerts</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Push Notifications</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Weekly Digest</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Alert Thresholds */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-700">Warning at</label>
                                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                                <option>75% usage</option>
                                                <option>80% usage</option>
                                                <option>85% usage</option>
                                                <option>90% usage</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-700">Critical at</label>
                                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
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
