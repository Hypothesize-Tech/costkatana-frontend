import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle, Settings, Lightbulb } from 'lucide-react'; // Added Lightbulb for 💡 replacement

interface UsagePattern {
    day: string;
    timeSlot: string;
    requests: number;
    cost: number;
    avgDuration: number;
    errors: number;
}

interface AutoScalingRecommendationsProps {
    usagePatterns: UsagePattern[];
}

export const AutoScalingRecommendations: React.FC<AutoScalingRecommendationsProps> = ({ usagePatterns }) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        generateRecommendations();
        generateAlerts();
    }, [usagePatterns]);

    const generateRecommendations = () => {
        const peakPeriods = usagePatterns
            .filter(pattern => pattern.requests > 1000)
            .sort((a, b) => b.requests - a.requests);

        const recommendations = [
            {
                id: 'peak_scaling',
                title: 'Peak Usage Auto-Scaling',
                description: `Configure auto-scaling for ${peakPeriods.length} identified peak periods`,
                priority: 'high',
                impact: 'High',
                effort: 'Medium',
                details: [
                    ...peakPeriods.slice(0, 3).map(period =>
                        `${period.day} ${period.timeSlot}: Scale to ${Math.ceil(period.requests / 500)}-${Math.ceil(period.requests / 300)} instances (${period.requests} requests)`
                    ),
                    'Pre-warm resources 30 minutes before peak times',
                    'Set CPU threshold to 60% for faster scaling'
                ],
                estimatedSavings: `$${Math.round(peakPeriods.length * 15)}-${Math.round(peakPeriods.length * 20)}/month`,
                implementation: {
                    aws: 'Configure Auto Scaling Groups with scheduled scaling policies',
                    gcp: 'Use Cloud Scheduler with Instance Groups',
                    azure: 'Set up Virtual Machine Scale Sets with time-based rules'
                }
            },
            {
                id: 'cost_optimization',
                title: 'Cost-Based Scaling Alerts',
                description: 'Set up alerts when hourly costs exceed $1.00 threshold',
                priority: 'medium',
                impact: 'Medium',
                effort: 'Low',
                details: [
                    'Monitor hourly cost trends in real-time',
                    'Alert when costs exceed $1.00/hour',
                    'Automatic scale-down during low usage periods',
                    'Weekly cost optimization reports'
                ],
                estimatedSavings: '$20-35/month',
                implementation: {
                    monitoring: 'CloudWatch/Stackdriver custom metrics',
                    alerting: 'SNS/Pub-Sub notifications',
                    automation: 'Lambda/Cloud Functions for auto-scaling'
                }
            },
            {
                id: 'predictive_scaling',
                title: 'Weekend Usage Prediction',
                description: `Implement predictive scaling for ${peakPeriods.filter(p => p.day.includes('Sunday') || p.day.includes('Saturday')).length} weekend peak periods`,
                priority: 'medium',
                impact: 'High',
                effort: 'High',
                details: [
                    'Use ML models to predict weekend usage patterns',
                    'Pre-scale resources based on historical data',
                    ...(peakPeriods.length > 0 ? [`Optimize for ${peakPeriods[0].day} ${peakPeriods[0].timeSlot} traffic (${peakPeriods[0].requests} requests)`] : []),
                    'Gradual scale-down during weekday low periods'
                ],
                estimatedSavings: '$30-50/month',
                implementation: {
                    ml: 'AWS Forecast/Google AI Platform',
                    automation: 'Custom scaling algorithms',
                    monitoring: 'Real-time pattern analysis'
                }
            },
            {
                id: 'performance_monitoring',
                title: 'Performance-Based Scaling',
                description: 'Scale based on response time thresholds (>8 seconds)',
                priority: 'high',
                impact: 'High',
                effort: 'Medium',
                details: [
                    'Monitor average response times continuously',
                    'Scale out when response time > 8 seconds',
                    'Scale in when response time < 2 seconds',
                    'Separate scaling for AI vs HTTP operations'
                ],
                estimatedSavings: '$25-40/month',
                implementation: {
                    metrics: 'Custom response time metrics',
                    thresholds: 'Dynamic scaling policies',
                    separation: 'Service-specific scaling groups'
                }
            }
        ];

        setRecommendations(recommendations);
    };

    const generateAlerts = () => {
        const currentHourCost = usagePatterns
            .reduce((total, pattern) => total + pattern.cost, 0);

        const alerts = [];

        if (currentHourCost > 1.0) {
            alerts.push({
                id: 'high_cost',
                type: 'warning',
                title: 'High Hourly Cost Detected',
                message: `Current hourly cost: $${currentHourCost.toFixed(2)} exceeds $1.00 threshold`,
                action: 'Consider scaling down non-critical services'
            });
        }

        const highDurationPatterns = usagePatterns.filter(p => p.avgDuration > 8000);
        if (highDurationPatterns.length > 0) {
            alerts.push({
                id: 'slow_response',
                type: 'error',
                title: 'Slow Response Times Detected',
                message: `${highDurationPatterns.length} time periods with >8s response times`,
                action: 'Scale up resources or optimize performance'
            });
        }

        setAlerts(alerts);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-danger-700 dark:text-danger-300 bg-gradient-danger/20 border-danger-200/30';
            case 'medium': return 'text-warning-700 dark:text-warning-300 bg-gradient-warning/20 border-warning-200/30';
            case 'low': return 'text-success-700 dark:text-success-300 bg-gradient-success/20 border-success-200/30';
            default: return 'text-light-text-secondary dark:text-dark-text-secondary bg-gradient-primary/10 border-primary-200/30';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="bg-gradient-primary/10 p-8 rounded-t-xl border-b border-primary-200/30">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-display text-3xl font-bold gradient-text-primary">Auto-Scaling Recommendations</h2>
                    </div>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-lg">
                        AI-powered scaling recommendations based on your usage patterns
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-display text-xl font-semibold gradient-text-primary flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        Active Alerts
                    </h3>
                    {alerts.map(alert => (
                        <div key={alert.id} className={`glass rounded-xl p-6 border shadow-lg backdrop-blur-xl ${alert.type === 'error' ? 'border-danger-200/30 bg-gradient-danger/10' : 'border-warning-200/30 bg-gradient-warning/10'
                            }`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${alert.type === 'error' ? 'bg-gradient-danger' : 'bg-gradient-warning'
                                            }`}>
                                            <AlertTriangle className="w-3 h-3 text-white" />
                                        </div>
                                        <h4 className={`font-display font-semibold ${alert.type === 'error' ? 'gradient-text-danger' : 'gradient-text-warning'
                                            }`}>
                                            {alert.title}
                                        </h4>
                                    </div>
                                    <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-3">
                                        {alert.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center mt-0.5 flex-shrink-0 shadow-lg">
                                            <Lightbulb className="w-3 h-3 text-white" />
                                        </div>
                                        <p className={`font-body font-medium ${alert.type === 'error' ? 'text-danger-600 dark:text-danger-400' : 'text-warning-600 dark:text-warning-400'
                                            }`}>
                                            {alert.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            <div className="space-y-6">
                <h3 className="font-display text-xl font-semibold gradient-text-primary flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                    Scaling Recommendations
                </h3>

                {recommendations.map(rec => (
                    <div key={rec.id} className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.01]">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h4 className="font-display text-xl font-bold gradient-text-primary">{rec.title}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-display font-medium border ${getPriorityColor(rec.priority)}`}>
                                            {rec.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4 text-lg">{rec.description}</p>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                                                    <TrendingUp className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Impact</p>
                                                    <p className="font-display font-bold gradient-text-primary">{rec.impact}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass rounded-lg p-4 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Effort</p>
                                                    <p className="font-display font-bold gradient-text-secondary">{rec.effort}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass rounded-lg p-4 border border-success-200/30 shadow-lg backdrop-blur-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                                                    <DollarSign className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Savings</p>
                                                    <p className="font-display font-bold gradient-text-success">{rec.estimatedSavings}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass rounded-xl p-6 border border-success-200/30">
                                    <h5 className="font-display font-semibold gradient-text-success mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-success-500" />
                                        Implementation Details
                                    </h5>
                                    <ul className="space-y-3">
                                        {rec.details.map((detail: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 flex-shrink-0 shadow-lg">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="font-body text-light-text-primary dark:text-dark-text-primary">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="glass rounded-xl p-6 border border-accent-200/30">
                                    <h5 className="font-display font-semibold gradient-text-accent mb-4 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-accent-500" />
                                        Platform Implementation
                                    </h5>
                                    <div className="space-y-3">
                                        {Object.entries(rec.implementation).map(([platform, description]) => (
                                            <div key={platform} className="glass rounded-lg p-4 border border-primary-200/30">
                                                <div className="font-display font-medium gradient-text-primary uppercase tracking-wide mb-2 text-sm">
                                                    {platform}
                                                </div>
                                                <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">{description as string}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="glass rounded-xl p-8 border border-success-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-success flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold gradient-text-success mb-2">Expected Benefits</h3>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Comprehensive optimization impact across your infrastructure</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-display text-3xl font-bold gradient-text-success mb-1">$120-185</div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Monthly Savings</div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-display text-3xl font-bold gradient-text-primary mb-1">40-60%</div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Performance Improvement</div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-display text-3xl font-bold gradient-text-secondary mb-1">24/7</div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Automated Optimization</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
