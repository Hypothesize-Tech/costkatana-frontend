import React from 'react';
import { CostTrends } from '../../services/unexplainedCost.service';

interface CostTrendsChartProps {
    trends: CostTrends;
}

export const CostTrendsChart: React.FC<CostTrendsChartProps> = ({ trends }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(amount);
    };

    const formatPercentage = (percentage: number) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${(percentage * 100).toFixed(1)}%`;
    };

    const getTrendColor = (trend: string) => {
        const colors: Record<string, string> = {
            increasing: 'text-error-600 dark:text-error-400',
            decreasing: 'text-success-600 dark:text-success-400',
            stable: 'text-primary-600 dark:text-primary-400'
        };
        return colors[trend] || 'text-light-text-secondary dark:text-dark-text-secondary';
    };

    const getTrendIcon = (trend: string) => {
        const icons: Record<string, string> = {
            increasing: '📈',
            decreasing: '📉',
            stable: '➡️'
        };
        return icons[trend] || '❓';
    };

    const getTrendDescription = (trend: string) => {
        const descriptions: Record<string, string> = {
            increasing: 'Trending Up',
            decreasing: 'Trending Down',
            stable: 'Stable'
        };
        return descriptions[trend] || 'Unknown';
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-success-600 dark:text-success-400';
        if (confidence >= 0.6) return 'text-warning-600 dark:text-warning-400';
        return 'text-error-600 dark:text-error-400';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        return 'Low';
    };

    return (
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Cost Trends & Predictions</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Historical patterns and future projections</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-display font-bold gradient-text-primary">
                        {formatCurrency(trends.trends.daily_average)}
                    </div>
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Daily Average</div>
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-primary-700 dark:text-primary-300">Weekly Growth</div>
                            <div className={`text-lg font-bold ${getTrendColor(trends.trends.weekly_growth > 0 ? 'increasing' : 'decreasing')}`}>
                                {formatPercentage(trends.trends.weekly_growth)}
                            </div>
                        </div>
                        <div className="text-2xl">
                            {getTrendIcon(trends.trends.weekly_growth > 0 ? 'increasing' : 'decreasing')}
                        </div>
                    </div>
                </div>

                <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Monthly Growth</div>
                            <div className={`text-lg font-bold ${getTrendColor(trends.trends.monthly_growth > 0 ? 'increasing' : 'decreasing')}`}>
                                {formatPercentage(trends.trends.monthly_growth)}
                            </div>
                        </div>
                        <div className="text-2xl">
                            {getTrendIcon(trends.trends.monthly_growth > 0 ? 'increasing' : 'decreasing')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Driver Trends */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Cost Driver Trends</h3>
                <div className="space-y-3">
                    {trends.trends.cost_drivers_trend.map((driver, index) => (
                        <div key={index} className="flex items-center justify-between p-4 glass rounded-xl border border-accent-200/30 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 mr-3"></div>
                                <div>
                                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary capitalize">
                                        {driver.driver.replace('_', ' ')}
                                    </div>
                                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {getTrendDescription(driver.trend)}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`font-semibold ${getTrendColor(driver.trend)}`}>
                                    {formatPercentage(driver.rate)}
                                </div>
                                <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {getTrendIcon(driver.trend)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Predictions */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Cost Predictions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                        <div className="text-center">
                            <div className="text-sm font-medium text-success-700 dark:text-success-300 mb-1">Next Week</div>
                            <div className="text-xl font-bold text-success-900 dark:text-success-100">
                                {formatCurrency(trends.predictions.next_week)}
                            </div>
                            <div className="text-xs text-success-600 dark:text-success-400 mt-1">
                                {formatPercentage((trends.predictions.next_week - trends.trends.daily_average) / trends.trends.daily_average)}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                        <div className="text-center">
                            <div className="text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">Next Month</div>
                            <div className="text-xl font-bold text-accent-900 dark:text-accent-100">
                                {formatCurrency(trends.predictions.next_month)}
                            </div>
                            <div className="text-xs text-accent-600 dark:text-accent-400 mt-1">
                                {formatPercentage((trends.predictions.next_month - trends.trends.daily_average) / trends.trends.daily_average)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confidence Level */}
                <div className="mt-4 p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-warning-600 dark:text-warning-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-warning-800 dark:text-warning-200">Prediction Confidence</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-16 h-2 glass rounded-full mr-2 bg-light-bg-300 dark:bg-dark-bg-300">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-warning-400 to-warning-500"
                                    style={{ width: `${trends.predictions.confidence * 100}%` }}
                                ></div>
                            </div>
                            <span className={`text-sm font-semibold ${getConfidenceColor(trends.predictions.confidence)}`}>
                                {getConfidenceLabel(trends.predictions.confidence)}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-warning-700 dark:text-warning-300 mt-2">
                        Based on {trends.period} of historical data. Higher confidence means more reliable predictions.
                    </p>
                </div>
            </div>

            {/* Trend Analysis */}
            <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-accent-50/20 to-accent-100/20 dark:from-accent-900/10 dark:to-accent-800/10">
                <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Trend Analysis</h4>
                <div className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {trends.trends.weekly_growth > 0.1 && (
                        <div className="flex items-center">
                            <span className="text-error-500 mr-2">⚠️</span>
                            <span>Weekly costs are growing rapidly. Consider immediate optimization.</span>
                        </div>
                    )}

                    {trends.trends.monthly_growth > 0.05 && (
                        <div className="flex items-center">
                            <span className="text-warning-500 mr-2">📊</span>
                            <span>Monthly trend shows steady growth. Monitor for optimization opportunities.</span>
                        </div>
                    )}

                    {trends.trends.cost_drivers_trend.some(d => d.trend === 'increasing' && d.rate > 0.1) && (
                        <div className="flex items-center">
                            <span className="text-secondary-500 mr-2">🔍</span>
                            <span>Some cost drivers are increasing significantly. Review system prompts and tool usage.</span>
                        </div>
                    )}

                    {trends.predictions.confidence < 0.7 && (
                        <div className="flex items-center">
                            <span className="text-primary-500 mr-2">ℹ️</span>
                            <span>Low prediction confidence. More historical data needed for accurate forecasts.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-accent-200/30">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            const csvContent = `data:text/csv;charset=utf-8,Period,Daily Average,Weekly Growth,Monthly Growth,Next Week,Next Month,Confidence\n${trends.period},${trends.trends.daily_average},${trends.trends.weekly_growth},${trends.trends.monthly_growth},${trends.predictions.next_week},${trends.predictions.next_month},${trends.predictions.confidence}`;
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute('download', `cost-trends-${trends.period}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="btn-primary inline-flex items-center"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Export Trends
                    </button>

                    <button
                        onClick={() => {
                            alert(`Cost Trends Analysis Guide:\n\n• Daily Average: ${formatCurrency(trends.trends.daily_average)} - Your typical daily spending\n• Weekly Growth: ${formatPercentage(trends.trends.weekly_growth)} - How costs change week-over-week\n• Monthly Growth: ${formatPercentage(trends.trends.monthly_growth)} - Long-term cost trajectory\n• Prediction Confidence: ${getConfidenceLabel(trends.predictions.confidence)} - Reliability of forecasts\n\n${trends.predictions.confidence < 0.7 ? 'Low confidence suggests you need more historical data for accurate predictions.' : 'High confidence means predictions are reliable based on current data.'}`);
                        }}
                        className="btn-secondary inline-flex items-center"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Learn More
                    </button>

                    <button
                        onClick={() => {
                            const thresholds = {
                                weekly_growth: Math.abs(trends.trends.weekly_growth) > 0.1 ? 'High' : 'Normal',
                                monthly_growth: Math.abs(trends.trends.monthly_growth) > 0.05 ? 'High' : 'Normal',
                                confidence: trends.predictions.confidence < 0.7 ? 'Low' : 'Good'
                            };
                            alert(`Setting up trend alerts:\n\nAlert Thresholds:\n• Weekly Growth: ${thresholds.weekly_growth} (${formatPercentage(trends.trends.weekly_growth)})\n• Monthly Growth: ${thresholds.monthly_growth} (${formatPercentage(trends.trends.monthly_growth)})\n• Prediction Confidence: ${thresholds.confidence} (${getConfidenceLabel(trends.predictions.confidence)})\n\nYou will be notified when trends exceed these thresholds.`);
                        }}
                        className="btn-secondary inline-flex items-center"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Set Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};



