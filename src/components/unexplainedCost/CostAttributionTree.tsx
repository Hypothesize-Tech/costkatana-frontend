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
            system_prompt: 'bg-gradient-primary',
            tool_calls: 'bg-gradient-success',
            context_window: 'bg-gradient-secondary',
            retries: 'bg-gradient-danger',
            cache_miss: 'bg-gradient-warning',
            model_switching: 'bg-gradient-info',
            network: 'bg-gradient-accent',
            database: 'bg-gradient-tertiary'
        };
        return colors[driverType] || 'bg-gradient-secondary';
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
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Cost Attribution Tree</h2>
                    <p className="text-secondary-600 dark:text-secondary-300 mt-1">Breakdown of what's driving your costs</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-display font-bold gradient-text-primary">
                        {formatCurrency(totalCost)}
                    </div>
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Total Explained</div>
                </div>
            </div>

            {/* Cost Drivers Tree */}
            <div className="space-y-4">
                {sortedDrivers.map((driver, index) => (
                    <div key={index} className="relative">
                        {/* Driver Node */}
                        <div className="flex items-center p-4 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex-shrink-0 mr-4">
                                <div className={`w-12 h-12 rounded-full ${getDriverColor(driver.driver_type)} flex items-center justify-center text-white text-xl glow-primary`}>
                                    {getDriverIcon(driver.driver_type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-display font-bold gradient-text-primary capitalize">
                                            {driver.driver_type.replace('_', ' ')}
                                        </h3>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                            {getDriverDescription(driver.driver_type)}
                                        </p>
                                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                                            {driver.explanation}
                                        </p>
                                    </div>

                                    <div className="text-right ml-4">
                                        <div className="text-xl font-display font-bold gradient-text-primary">
                                            {formatCurrency(driver.cost_impact)}
                                        </div>
                                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                            {driver.percentage_of_total.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                                        <span>Cost Impact</span>
                                        <span>{driver.percentage_of_total.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getDriverColor(driver.driver_type)} glow-primary`}
                                            style={{ width: `${Math.min(driver.percentage_of_total, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optimization Potential */}
                        <div className="ml-16 mt-3 p-3 glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-success-600 dark:text-success-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-display font-medium text-success-800 dark:text-success-300">Optimization Potential</span>
                                </div>
                                <span className="text-sm font-display font-bold text-success-800 dark:text-success-300">
                                    Save up to {formatCurrency(driver.optimization_potential)}
                                </span>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < sortedDrivers.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-8 bg-accent-300 dark:bg-accent-600"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-primary-200/30">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                        <div className="text-2xl font-display font-bold text-primary-900 dark:text-primary-300">
                            {analysis.cost_drivers.length}
                        </div>
                        <div className="text-sm text-primary-700 dark:text-primary-400">Cost Drivers</div>
                    </div>

                    <div className="text-center p-3 glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                        <div className="text-2xl font-display font-bold text-success-900 dark:text-success-300">
                            {formatCurrency(analysis.cost_drivers.reduce((sum, driver) => sum + driver.optimization_potential, 0))}
                        </div>
                        <div className="text-sm text-success-700 dark:text-success-400">Total Savings Potential</div>
                    </div>
                </div>
            </div>

            {/* Anomaly Score */}
            <div className="mt-4 p-4 glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-display font-medium text-warning-800 dark:text-warning-300">Anomaly Score</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-16 h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full mr-2">
                            <div
                                className="h-2 rounded-full bg-gradient-warning glow-warning"
                                style={{ width: `${analysis.anomaly_score}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-display font-bold text-warning-800 dark:text-warning-300">
                            {analysis.anomaly_score.toFixed(0)}/100
                        </span>
                    </div>
                </div>
                <p className="text-xs text-warning-700 dark:text-warning-400 mt-2">
                    Higher scores indicate more unusual cost patterns that may need attention.
                </p>
            </div>
        </div>
    );
};



