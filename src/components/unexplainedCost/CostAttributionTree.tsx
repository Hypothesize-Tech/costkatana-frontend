import React from 'react';
import { CostAnalysis } from '../../services/unexplainedCost.service';

interface CostAttributionTreeProps {
    analysis: CostAnalysis;
}

export const CostAttributionTree: React.FC<CostAttributionTreeProps> = ({ analysis }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(amount);
    };

    const getDriverColor = (driverType: string) => {
        const colors: Record<string, string> = {
            system_prompt: 'bg-blue-500',
            tool_calls: 'bg-green-500',
            context_window: 'bg-purple-500',
            retries: 'bg-red-500',
            cache_miss: 'bg-yellow-500',
            model_switching: 'bg-indigo-500',
            network: 'bg-pink-500',
            database: 'bg-gray-500'
        };
        return colors[driverType] || 'bg-gray-500';
    };

    const getDriverIcon = (driverType: string) => {
        const icons: Record<string, string> = {
            system_prompt: '📝',
            tool_calls: '🔧',
            context_window: '🧠',
            retries: '🔄',
            cache_miss: '💾',
            model_switching: '🔄',
            network: '🌐',
            database: '🗄️'
        };
        return icons[driverType] || '❓';
    };

    const getDriverDescription = (driverType: string) => {
        const descriptions: Record<string, string> = {
            system_prompt: 'System prompt tokens',
            tool_calls: 'API tool calls',
            context_window: 'Context window size',
            retries: 'Failed request retries',
            cache_miss: 'Cache misses',
            model_switching: 'Model switching costs',
            network: 'Network latency',
            database: 'Database operations'
        };
        return descriptions[driverType] || 'Unknown cost driver';
    };

    const totalCost = analysis.total_cost || 0;
    const sortedDrivers = [...analysis.cost_drivers].sort((a, b) => b.cost_impact - a.cost_impact);

    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cost Attribution Tree</h2>
                    <p className="text-gray-600 mt-1">Breakdown of what's driving your costs</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalCost)}
                    </div>
                    <div className="text-sm text-gray-500">Total Explained</div>
                </div>
            </div>

            {/* Cost Drivers Tree */}
            <div className="space-y-4">
                {sortedDrivers.map((driver, index) => (
                    <div key={index} className="relative">
                        {/* Driver Node */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <div className="flex-shrink-0 mr-4">
                                <div className={`w-12 h-12 rounded-full ${getDriverColor(driver.driver_type)} flex items-center justify-center text-white text-xl`}>
                                    {getDriverIcon(driver.driver_type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                            {driver.driver_type.replace('_', ' ')}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {getDriverDescription(driver.driver_type)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {driver.explanation}
                                        </p>
                                    </div>

                                    <div className="text-right ml-4">
                                        <div className="text-xl font-bold text-gray-900">
                                            {formatCurrency(driver.cost_impact)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {driver.percentage_of_total.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Cost Impact</span>
                                        <span>{driver.percentage_of_total.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getDriverColor(driver.driver_type)}`}
                                            style={{ width: `${Math.min(driver.percentage_of_total, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optimization Potential */}
                        <div className="ml-16 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-800">Optimization Potential</span>
                                </div>
                                <span className="text-sm font-semibold text-green-800">
                                    Save up to {formatCurrency(driver.optimization_potential)}
                                </span>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < sortedDrivers.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                            {analysis.cost_drivers.length}
                        </div>
                        <div className="text-sm text-blue-700">Cost Drivers</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(analysis.cost_drivers.reduce((sum, driver) => sum + driver.optimization_potential, 0))}
                        </div>
                        <div className="text-sm text-green-700">Total Savings Potential</div>
                    </div>
                </div>
            </div>

            {/* Anomaly Score */}
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-yellow-800">Anomaly Score</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                                className="h-2 rounded-full bg-yellow-500"
                                style={{ width: `${analysis.anomaly_score}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-semibold text-yellow-800">
                            {analysis.anomaly_score.toFixed(0)}/100
                        </span>
                    </div>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                    Higher scores indicate more unusual cost patterns that may need attention.
                </p>
            </div>
        </div>
    );
};



