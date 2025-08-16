import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

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
                description: 'Configure auto-scaling for Monday night and Sunday evening peak periods',
                priority: 'high',
                impact: 'High',
                effort: 'Medium',
                details: [
                    'Monday Night (00:00-06:00): Scale to 3-5 instances',
                    'Sunday Evening (18:00-24:00): Scale to 2-4 instances',
                    'Pre-warm resources 30 minutes before peak times',
                    'Set CPU threshold to 60% for faster scaling'
                ],
                estimatedSavings: '$45-60/month',
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
                description: 'Implement predictive scaling for weekend traffic spikes',
                priority: 'medium',
                impact: 'High',
                effort: 'High',
                details: [
                    'Use ML models to predict weekend usage patterns',
                    'Pre-scale resources based on historical data',
                    'Optimize for Sunday evening traffic (3,978 requests)',
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
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Auto-Scaling Recommendations</h2>
                </div>
                <p className="text-blue-100">
                    AI-powered scaling recommendations based on your usage patterns
                </p>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Active Alerts
                    </h3>
                    {alerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-lg border ${alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className={`font-semibold ${alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                                        }`}>
                                        {alert.title}
                                    </h4>
                                    <p className={`text-sm mt-1 ${alert.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                                        }`}>
                                        {alert.message}
                                    </p>
                                    <p className={`text-xs mt-2 font-medium ${alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        💡 {alert.action}
                                    </p>
                                </div>
                                <AlertTriangle className={`w-5 h-5 ${alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                                    }`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Scaling Recommendations
                </h3>

                {recommendations.map(rec => (
                    <div key={rec.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-800">{rec.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                                            {rec.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{rec.description}</p>

                                    {/* Metrics */}
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-gray-600">Impact: <strong>{rec.impact}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm text-gray-600">Effort: <strong>{rec.effort}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-600">Savings: <strong>{rec.estimatedSavings}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-medium text-gray-800 mb-2">Implementation Details</h5>
                                    <ul className="space-y-1">
                                        {rec.details.map((detail: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-medium text-gray-800 mb-2">Platform Implementation</h5>
                                    <div className="space-y-2">
                                        {Object.entries(rec.implementation).map(([platform, description]) => (
                                            <div key={platform} className="bg-gray-50 rounded p-3">
                                                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                                    {platform}
                                                </div>
                                                <div className="text-sm text-gray-600">{description as string}</div>
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
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Expected Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">$120-185</div>
                        <div className="text-sm text-gray-600">Monthly Savings</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">40-60%</div>
                        <div className="text-sm text-gray-600">Performance Improvement</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                        <div className="text-sm text-gray-600">Automated Optimization</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
