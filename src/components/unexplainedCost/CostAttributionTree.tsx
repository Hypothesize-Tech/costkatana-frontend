import React from 'react';
import {
    FileText,
    Wrench,
    Brain,
    RotateCcw,
    Database,
    Shuffle,
    Globe,
    Server,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
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
        const icons: Record<string, JSX.Element> = {
            system_prompt: <FileText className="w-6 h-6" />,
            tool_calls: <Wrench className="w-6 h-6" />,
            context_window: <Brain className="w-6 h-6" />,
            retries: <RotateCcw className="w-6 h-6" />,
            cache_miss: <Database className="w-6 h-6" />,
            model_switching: <Shuffle className="w-6 h-6" />,
            network: <Globe className="w-6 h-6" />,
            database: <Server className="w-6 h-6" />
        };
        return icons[driverType] || <AlertTriangle className="w-6 h-6" />;
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
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-display font-bold gradient-text-primary">Cost Attribution Tree</h2>
                    <p className="text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300 mt-1">Breakdown of what's driving your costs</p>
                </div>

                <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                        {formatCurrency(totalCost)}
                    </div>
                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Total Explained</div>
                </div>
            </div>

            {/* Cost Drivers Tree */}
            <div className="space-y-3 sm:space-y-4">
                {sortedDrivers.map((driver, index) => (
                    <div key={index} className="relative">
                        {/* Driver Node */}
                        <div className="flex items-start sm:items-center p-3 sm:p-4 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex-shrink-0 mr-3 sm:mr-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getDriverColor(driver.driver_type)} flex items-center justify-center text-white text-lg sm:text-xl glow-primary`}>
                                    {getDriverIcon(driver.driver_type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary capitalize break-words">
                                            {driver.driver_type.replace('_', ' ')}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 break-words">
                                            {getDriverDescription(driver.driver_type)}
                                        </p>
                                        <p className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1 break-words">
                                            {driver.explanation}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                                        <div className="text-lg sm:text-xl font-display font-bold gradient-text-primary">
                                            {formatCurrency(driver.cost_impact)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
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
                        <div className="ml-0 sm:ml-12 md:ml-16 mt-3 p-2 sm:p-3 glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                <div className="flex items-center">
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success-600 dark:text-success-400 mr-2 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm font-display font-medium text-success-800 dark:text-success-300">Optimization Potential</span>
                                </div>
                                <span className="text-xs sm:text-sm font-display font-bold text-success-800 dark:text-success-300 break-words">
                                    Save up to {formatCurrency(driver.optimization_potential)}
                                </span>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < sortedDrivers.length - 1 && (
                            <div className="absolute left-5 sm:left-6 top-14 sm:top-16 w-0.5 h-6 sm:h-8 bg-accent-300 dark:bg-accent-600"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-primary-200/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20">
                        <div className="text-xl sm:text-2xl font-display font-bold text-primary-900 dark:text-primary-300">
                            {analysis.cost_drivers.length}
                        </div>
                        <div className="text-xs sm:text-sm text-primary-700 dark:text-primary-400">Cost Drivers</div>
                    </div>

                    <div className="text-center p-2 sm:p-3 glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20">
                        <div className="text-xl sm:text-2xl font-display font-bold text-success-900 dark:text-success-300 break-words">
                            {formatCurrency(analysis.cost_drivers.reduce((sum, driver) => sum + driver.optimization_potential, 0))}
                        </div>
                        <div className="text-xs sm:text-sm text-success-700 dark:text-success-400">Total Savings Potential</div>
                    </div>
                </div>
            </div>

            {/* Anomaly Score */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning-600 dark:text-warning-400 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-display font-medium text-warning-800 dark:text-warning-300">Anomaly Score</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-12 sm:w-16 h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full mr-2">
                            <div
                                className="h-2 rounded-full bg-gradient-warning glow-warning"
                                style={{ width: `${analysis.anomaly_score}%` }}
                            ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-display font-bold text-warning-800 dark:text-warning-300">
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



