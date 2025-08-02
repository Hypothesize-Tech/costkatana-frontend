import React, { useState, useEffect, useMemo } from 'react';
import { predictiveIntelligenceService, PredictiveIntelligenceData } from '../../services/predictiveIntelligence.service';
import './PredictiveCostDashboard.css';

interface PredictiveCostDashboardProps {
    scope?: 'user' | 'project' | 'team';
    scopeId?: string;
    className?: string;
}

const PredictiveCostDashboard: React.FC<PredictiveCostDashboardProps> = ({
    scope = 'user',
    scopeId,
    className = ''
}) => {
    const [intelligenceData, setIntelligenceData] = useState<PredictiveIntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(30);
    const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'forecasts' | 'optimizations' | 'scenarios'>('overview');
    const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);

    // Fetch predictive intelligence data
    useEffect(() => {
        const fetchIntelligenceData = async () => {
            try {
                setLoading(true);

                const data = await predictiveIntelligenceService.getPredictiveIntelligence({
                    scope,
                    scopeId,
                    timeHorizon: selectedTimeHorizon,
                    includeScenarios: true,
                    includeCrossPlatform: true
                });

                setIntelligenceData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchIntelligenceData();
    }, [scope, scopeId, selectedTimeHorizon]);

    // Calculate key metrics
    const keyMetrics = useMemo(() => {
        if (!intelligenceData) return null;

        const criticalAlerts = intelligenceData.proactiveAlerts.filter(alert => alert.severity === 'critical').length;
        const urgentAlerts = intelligenceData.proactiveAlerts.filter(alert => alert.daysUntilImpact <= 7).length;
        const totalPotentialSavings = intelligenceData.optimizationRecommendations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
        const easyOptimizations = intelligenceData.optimizationRecommendations.filter(opt => opt.implementationDifficulty === 'easy').length;
        const budgetRiskProjects = intelligenceData.budgetExceedanceProjections.filter(proj => proj.exceedanceProbability > 0.7).length;

        return {
            criticalAlerts,
            urgentAlerts,
            totalPotentialSavings,
            easyOptimizations,
            budgetRiskProjects,
            confidenceScore: intelligenceData.confidenceScore,
            nextBudgetExceedance: intelligenceData.budgetExceedanceProjections.length > 0
                ? intelligenceData.budgetExceedanceProjections.sort((a, b) => a.daysUntilExceedance - b.daysUntilExceedance)[0]
                : null
        };
    }, [intelligenceData]);

    const handleAutoOptimize = async (alertId: string) => {
        try {
            setLoading(true);
            const result = await predictiveIntelligenceService.autoOptimize(alertId);

            // Show success message
            if (result.success) {
                alert(`✅ Auto-optimization completed successfully!\n\n` +
                    `Actions Applied:\n${result.data.actionsApplied.join('\n')}\n\n` +
                    `Estimated Savings: $${result.data.estimatedSavings.toFixed(2)}\n\n` +
                    `Status: ${result.data.implementationStatus}`);
            }

            // Refresh data after auto-optimization
            window.location.reload();
        } catch (err) {
            console.error('Auto-optimization failed:', err);
            alert(`❌ Auto-optimization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={`predictive-dashboard ${className}`}>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>🧠 Generating Predictive Intelligence...</h3>
                    <p>Analyzing patterns, forecasting costs, and identifying opportunities</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`predictive-dashboard ${className}`}>
                <div className="error-state">
                    <h3>❌ Intelligence Generation Failed</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (!intelligenceData || !keyMetrics) {
        return (
            <div className={`predictive-dashboard ${className}`}>
                <div className="no-data-state">
                    <h3>📊 No Intelligence Data Available</h3>
                    <p>Insufficient historical data for predictive analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`predictive-dashboard ${className}`}>
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>🧠 Predictive Cost Intelligence</h1>
                    <p>AI-powered cost forecasting and proactive optimization</p>
                    <div className="confidence-indicator">
                        <span>Confidence Score: </span>
                        <div className="confidence-bar">
                            <div
                                className="confidence-fill"
                                style={{ width: `${keyMetrics.confidenceScore * 100}%` }}
                            ></div>
                        </div>
                        <span>{Math.round(keyMetrics.confidenceScore * 100)}%</span>
                    </div>
                </div>

                <div className="header-controls">
                    <select
                        value={selectedTimeHorizon}
                        onChange={(e) => setSelectedTimeHorizon(parseInt(e.target.value))}
                        className="time-horizon-select"
                    >
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={60}>60 Days</option>
                        <option value={90}>90 Days</option>
                    </select>

                    <div className="auto-optimize-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={autoOptimizeEnabled}
                                onChange={(e) => setAutoOptimizeEnabled(e.target.checked)}
                            />
                            Auto-Optimize
                        </label>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card critical">
                    <div className="metric-icon">🚨</div>
                    <div className="metric-content">
                        <h3>{keyMetrics.criticalAlerts}</h3>
                        <p>Critical Alerts</p>
                        {keyMetrics.urgentAlerts > 0 && (
                            <span className="urgent-indicator">{keyMetrics.urgentAlerts} urgent</span>
                        )}
                    </div>
                </div>

                <div className="metric-card savings">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <h3>{formatCurrency(keyMetrics.totalPotentialSavings)}</h3>
                        <p>Potential Monthly Savings</p>
                        <span className="easy-indicator">{keyMetrics.easyOptimizations} easy wins</span>
                    </div>
                </div>

                <div className="metric-card budget">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <h3>{keyMetrics.budgetRiskProjects}</h3>
                        <p>Projects at Budget Risk</p>
                        {keyMetrics.nextBudgetExceedance && (
                            <span className="next-exceedance">
                                Next: {keyMetrics.nextBudgetExceedance.daysUntilExceedance} days
                            </span>
                        )}
                    </div>
                </div>

                <div className="metric-card growth">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                        <h3>{intelligenceData.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%</h3>
                        <p>Weekly Prompt Growth</p>
                        <span className={`trend-indicator ${intelligenceData.historicalTokenTrends.tokenEfficiencyTrend}`}>
                            {intelligenceData.historicalTokenTrends.tokenEfficiencyTrend}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-navigation">
                {[
                    { id: 'overview', label: 'Overview', icon: '🏠' },
                    { id: 'alerts', label: 'Proactive Alerts', icon: '🚨' },
                    { id: 'forecasts', label: 'Cost Forecasts', icon: '📊' },
                    { id: 'optimizations', label: 'Smart Optimizations', icon: '⚡' },
                    { id: 'scenarios', label: 'Future Scenarios', icon: '🔮' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <div className="overview-grid">
                            {/* Next Budget Exceedance */}
                            {keyMetrics.nextBudgetExceedance && (
                                <div className="overview-card budget-warning">
                                    <h3>⚠️ Upcoming Budget Exceedance</h3>
                                    <div className="budget-details">
                                        <p><strong>{keyMetrics.nextBudgetExceedance.scopeName}</strong> will exceed budget in</p>
                                        <div className="days-countdown">
                                            {keyMetrics.nextBudgetExceedance.daysUntilExceedance} days
                                        </div>
                                        <p>Exceeding by {formatCurrency(keyMetrics.nextBudgetExceedance.exceedanceAmount)}</p>
                                    </div>
                                    <div className="mitigation-actions">
                                        <h4>Quick Actions:</h4>
                                        {keyMetrics.nextBudgetExceedance.mitigationStrategies.slice(0, 2).map((strategy: any, index: number) => (
                                            <div key={index} className="action-item">
                                                <span>{strategy.strategy}</span>
                                                <span className="saving">{formatCurrency(strategy.potentialSaving)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Optimization Opportunity */}
                            {intelligenceData.optimizationRecommendations.length > 0 && (
                                <div className="overview-card optimization-highlight">
                                    <h3>💡 Top Optimization Opportunity</h3>
                                    <div className="optimization-details">
                                        <h4>{intelligenceData.optimizationRecommendations[0].title}</h4>
                                        <p>{intelligenceData.optimizationRecommendations[0].description}</p>
                                        <div className="savings-highlight">
                                            <span className="current-cost">
                                                Current: {formatCurrency(intelligenceData.optimizationRecommendations[0].currentCost)}
                                            </span>
                                            <span className="arrow">→</span>
                                            <span className="optimized-cost">
                                                Optimized: {formatCurrency(intelligenceData.optimizationRecommendations[0].optimizedCost)}
                                            </span>
                                        </div>
                                        <div className="savings-percentage">
                                            Save {intelligenceData.optimizationRecommendations[0].savingsPercentage.toFixed(1)}%
                                            ({formatCurrency(intelligenceData.optimizationRecommendations[0].potentialSavings)}/month)
                                        </div>
                                    </div>
                                    {intelligenceData.optimizationRecommendations[0].implementationDifficulty === 'easy' && (
                                        <button className="auto-optimize-btn">
                                            ✅ Auto-Optimize Now
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Token Growth Trend */}
                            <div className="overview-card token-trends">
                                <h3>📈 Token Usage Trends</h3>
                                <div className="trend-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Average Prompt Length</span>
                                        <span className="stat-value">
                                            {intelligenceData.historicalTokenTrends.averagePromptLength.toFixed(0)} tokens
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Growth Rate (Weekly)</span>
                                        <span className={`stat-value ${intelligenceData.promptLengthGrowth.growthRatePerWeek > 5 ? 'warning' : 'normal'}`}>
                                            {intelligenceData.promptLengthGrowth.growthRatePerWeek.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Projected Monthly Increase</span>
                                        <span className="stat-value">
                                            {formatCurrency(
                                                intelligenceData.promptLengthGrowth.impactOnCosts.projectedMonthly -
                                                intelligenceData.promptLengthGrowth.impactOnCosts.currentMonthly
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="alerts-content">
                        <div className="alerts-header">
                            <h3>🚨 Proactive Alerts</h3>
                            <p>AI-detected issues and opportunities requiring attention</p>
                        </div>

                        <div className="alerts-list">
                            {intelligenceData.proactiveAlerts.map(alert => (
                                <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                                    <div className="alert-header">
                                        <div className="alert-title">
                                            <span
                                                className="severity-indicator"
                                                style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                            ></span>
                                            <h4>{alert.title}</h4>
                                            <span className="days-until">
                                                {alert.daysUntilImpact === 0 ? 'Today' : `${alert.daysUntilImpact} days`}
                                            </span>
                                        </div>
                                        <div className="alert-impact">
                                            {formatCurrency(alert.estimatedImpact)}
                                        </div>
                                    </div>

                                    <p className="alert-message">{alert.message}</p>

                                    <div className="actionable-insights">
                                        <h5>Recommended Actions:</h5>
                                        {alert.actionableInsights.map((insight: any, index: number) => (
                                            <div key={index} className="insight-item">
                                                <div className="insight-action">
                                                    <span className={`difficulty-badge ${insight.difficulty}`}>
                                                        {insight.difficulty}
                                                    </span>
                                                    <span className="action-text">{insight.action}</span>
                                                </div>
                                                <div className="insight-impact">
                                                    <span className="saving">{formatCurrency(insight.expectedSaving)}</span>
                                                    <span className="timeframe">{insight.timeToImplement}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {alert.autoOptimizationAvailable && autoOptimizeEnabled && (
                                        <div className="alert-actions">
                                            <button
                                                className="auto-optimize-btn"
                                                onClick={() => handleAutoOptimize(alert.id)}
                                            >
                                                ⚡ Auto-Optimize
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'forecasts' && (
                    <div className="forecasts-content">
                        <div className="forecasts-header">
                            <h3>📊 Cost Forecasts</h3>
                            <p>Predictive cost analysis for the next {selectedTimeHorizon} days</p>
                        </div>

                        <div className="forecast-chart">
                            {/* Simple forecast visualization - would use a proper chart library in production */}
                            <div className="chart-container">
                                <div className="chart-header">
                                    <h4>Daily Cost Forecast</h4>
                                    <div className="chart-legend">
                                        <span className="legend-item baseline">
                                            <span className="legend-color"></span>
                                            Baseline
                                        </span>
                                        <span className="legend-item predicted">
                                            <span className="legend-color"></span>
                                            Predicted
                                        </span>
                                    </div>
                                </div>

                                <div className="forecast-bars">
                                    {intelligenceData.forecasts.slice(0, 14).map((forecast, index) => (
                                        <div key={index} className="forecast-bar-container">
                                            <div className="forecast-bar">
                                                <div
                                                    className="baseline-bar"
                                                    style={{ height: `${(forecast.baselineCost / Math.max(...intelligenceData.forecasts.map(f => f.predictedCost))) * 100}%` }}
                                                ></div>
                                                <div
                                                    className="predicted-bar"
                                                    style={{ height: `${(forecast.predictedCost / Math.max(...intelligenceData.forecasts.map(f => f.predictedCost))) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="forecast-date">
                                                {new Date(forecast.period).getDate()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="forecast-insights">
                            <h4>Key Insights:</h4>
                            <div className="insights-grid">
                                <div className="insight-card">
                                    <h5>Trend Direction</h5>
                                    <span className={`trend-value ${intelligenceData.forecasts[0]?.trend}`}>
                                        {intelligenceData.forecasts[0]?.trend || 'stable'}
                                    </span>
                                </div>
                                <div className="insight-card">
                                    <h5>Peak Cost Day</h5>
                                    <span className="peak-value">
                                        {intelligenceData.forecasts.reduce((max, current) =>
                                            current.predictedCost > max.predictedCost ? current : max
                                        ).period ? formatDate(intelligenceData.forecasts.reduce((max, current) =>
                                            current.predictedCost > max.predictedCost ? current : max
                                        ).period) : 'N/A'}
                                    </span>
                                </div>
                                <div className="insight-card">
                                    <h5>Average Daily Cost</h5>
                                    <span className="avg-value">
                                        {formatCurrency(intelligenceData.forecasts.reduce((sum, f) => sum + f.predictedCost, 0) / intelligenceData.forecasts.length)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'optimizations' && (
                    <div className="optimizations-content">
                        <div className="optimizations-header">
                            <h3>⚡ Smart Optimizations</h3>
                            <p>AI-powered recommendations to reduce costs while maintaining quality</p>
                        </div>

                        <div className="optimization-summary">
                            <div className="summary-card total-savings">
                                <h4>Total Potential Savings</h4>
                                <div className="savings-amount">{formatCurrency(keyMetrics.totalPotentialSavings)}</div>
                                <span className="savings-period">per month</span>
                            </div>
                            <div className="summary-card easy-wins">
                                <h4>Easy Implementations</h4>
                                <div className="easy-count">{keyMetrics.easyOptimizations}</div>
                                <span className="implementation-note">can be automated</span>
                            </div>
                        </div>

                        <div className="optimizations-list">
                            {intelligenceData.optimizationRecommendations.map((optimization, index) => (
                                <div key={index} className="optimization-card">
                                    <div className="optimization-header">
                                        <div className="optimization-title">
                                            <span className={`type-badge ${optimization.type}`}>
                                                {optimization.type.replace('_', ' ')}
                                            </span>
                                            <h4>{optimization.title}</h4>
                                        </div>
                                        <div className="optimization-savings">
                                            <span className="savings-amount">{formatCurrency(optimization.potentialSavings)}</span>
                                            <span className="savings-percentage">({optimization.savingsPercentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>

                                    <p className="optimization-description">{optimization.description}</p>

                                    <div className="optimization-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Current Cost:</span>
                                            <span className="detail-value">{formatCurrency(optimization.currentCost)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Optimized Cost:</span>
                                            <span className="detail-value">{formatCurrency(optimization.optimizedCost)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Affected Requests:</span>
                                            <span className="detail-value">{optimization.affectedRequests.toLocaleString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Time to Results:</span>
                                            <span className="detail-value">{optimization.timeToSeeResults}</span>
                                        </div>
                                    </div>

                                    <div className="implementation-info">
                                        <div className="difficulty-indicator">
                                            <span className={`difficulty-badge ${optimization.implementationDifficulty}`}>
                                                {optimization.implementationDifficulty} to implement
                                            </span>
                                            <span className="confidence-score">
                                                {Math.round(optimization.confidenceLevel * 100)}% confidence
                                            </span>
                                        </div>

                                        <div className="implementation-steps">
                                            <h5>Implementation Steps:</h5>
                                            <ol>
                                                {optimization.steps.map((step: string, stepIndex: number) => (
                                                    <li key={stepIndex}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div className="risk-assessment">
                                            <h5>Risk Assessment:</h5>
                                            <div className="risk-items">
                                                <span className="risk-item">
                                                    Performance: {optimization.riskAssessment.performanceImpact}
                                                </span>
                                                <span className="risk-item">
                                                    Quality: {optimization.riskAssessment.qualityImpact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {optimization.implementationDifficulty === 'easy' && (
                                        <div className="optimization-actions">
                                            <button
                                                className="implement-btn"
                                                onClick={() => handleAutoOptimize(`opt_${index}`)}
                                            >
                                                🚀 Implement Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'scenarios' && (
                    <div className="scenarios-content">
                        <div className="scenarios-header">
                            <h3>🔮 Future Scenarios</h3>
                            <p>Strategic cost planning with different growth and optimization scenarios</p>
                        </div>

                        <div className="scenarios-comparison">
                            <h4>Scenario Comparison</h4>
                            <div className="comparison-chart">
                                {intelligenceData.scenarioSimulations.map((scenario) => (
                                    <div key={scenario.scenarioId} className="scenario-bar">
                                        <div className="scenario-name">{scenario.name}</div>
                                        <div className="cost-bars">
                                            <div className="baseline-bar">
                                                <span className="bar-label">Baseline</span>
                                                <div
                                                    className="bar-fill baseline"
                                                    style={{
                                                        width: `${(scenario.projectedCosts.baseline / Math.max(...intelligenceData.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                    }}
                                                ></div>
                                                <span className="bar-value">{formatCurrency(scenario.projectedCosts.baseline)}</span>
                                            </div>
                                            <div className="optimized-bar">
                                                <span className="bar-label">Optimized</span>
                                                <div
                                                    className="bar-fill optimized"
                                                    style={{
                                                        width: `${(scenario.projectedCosts.optimized / Math.max(...intelligenceData.scenarioSimulations.map(s => s.projectedCosts.baseline))) * 100}%`
                                                    }}
                                                ></div>
                                                <span className="bar-value">{formatCurrency(scenario.projectedCosts.optimized)}</span>
                                            </div>
                                        </div>
                                        <div className="scenario-savings">
                                            Save {formatCurrency(scenario.projectedCosts.savings)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="scenarios-details">
                            {intelligenceData.scenarioSimulations.map((scenario) => (
                                <div key={scenario.scenarioId} className="scenario-card">
                                    <div className="scenario-header">
                                        <h4>{scenario.name}</h4>
                                        <div className="scenario-meta">
                                            <span className="timeframe">{scenario.timeframe.replace('_', ' ')}</span>
                                            <span className="success-probability">
                                                {Math.round(scenario.probabilityOfSuccess * 100)}% success rate
                                            </span>
                                        </div>
                                    </div>

                                    <p className="scenario-description">{scenario.description}</p>

                                    <div className="scenario-variables">
                                        <h5>Key Variables:</h5>
                                        <div className="variables-grid">
                                            <div className="variable-item">
                                                <span className="variable-label">Usage Growth</span>
                                                <span className="variable-value">
                                                    {((scenario.variables.usageGrowth - 1) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="variable-item">
                                                <span className="variable-label">Prompt Complexity</span>
                                                <span className="variable-value">
                                                    {((scenario.variables.promptComplexity - 1) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="variable-item">
                                                <span className="variable-label">Optimization Level</span>
                                                <span className="variable-value">
                                                    {(scenario.variables.optimizationLevel * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="scenario-insights">
                                        <h5>Key Insights:</h5>
                                        <ul>
                                            {scenario.keyInsights.map((insight: string, insightIndex: number) => (
                                                <li key={insightIndex}>{insight}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="scenario-actions">
                                        <h5>Recommended Actions:</h5>
                                        <ul>
                                            {scenario.recommendedActions.map((action: string, actionIndex: number) => (
                                                <li key={actionIndex}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictiveCostDashboard;