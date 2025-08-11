import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Info, XCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { guardrailsService, UsageAlert } from '../../services/guardrails.service';
import { formatDistanceToNow } from 'date-fns';

export const UsageAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<UsageAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAlerts();
        // Refresh alerts every 2 minutes
        const interval = setInterval(fetchAlerts, 120000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await guardrailsService.getUsageAlerts();
            // Filter out dismissed alerts
            const filteredAlerts = data.filter(alert => !dismissedAlerts.has(alert._id));
            setAlerts(filteredAlerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = async (alertId: string) => {
        try {
            await guardrailsService.markAlertAsRead(alertId);
            setDismissedAlerts(prev => new Set([...prev, alertId]));
            setAlerts(prev => prev.filter(alert => alert._id !== alertId));
        } catch (error) {
            console.error('Error dismissing alert:', error);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'medium':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'low':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-50 border-red-200';
            case 'medium':
                return 'bg-yellow-50 border-yellow-200';
            case 'low':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-900';
            case 'medium':
                return 'text-yellow-900';
            case 'low':
                return 'text-blue-900';
            default:
                return 'text-gray-900';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Usage Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Usage Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
                        <p className="text-sm">No active alerts</p>
                        <p className="text-xs mt-1">Your usage is within normal limits</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Usage Alerts
                    </span>
                    {alerts.length > 0 && (
                        <span className="text-sm font-normal bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {alerts.length} active
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map(alert => (
                        <div
                            key={alert._id}
                            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {getSeverityIcon(alert.severity)}
                                    <div className="flex-1">
                                        <h4 className={`font-semibold text-sm ${getSeverityTextColor(alert.severity)}`}>
                                            {alert.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {alert.message}
                                        </p>

                                        {alert.metadata?.suggestions && alert.metadata.suggestions.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                                    Recommendations:
                                                </p>
                                                <ul className="space-y-1">
                                                    {alert.metadata.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                                                        <li key={index} className="text-xs text-gray-600 flex items-start">
                                                            <span className="mr-1">•</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {alert.metadata?.percentage && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${alert.metadata.percentage >= 90
                                                                ? 'bg-red-500'
                                                                : alert.metadata.percentage >= 75
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-blue-500'
                                                                }`}
                                                            style={{ width: `${Math.min(alert.metadata.percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold">
                                                        {alert.metadata.percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">
                                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => dismissAlert(alert._id)}
                                    className="ml-2 p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                                    aria-label="Dismiss alert"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {alerts.some(alert => alert.severity === 'high') && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                        <p className="text-sm font-semibold mb-1">
                            Approaching usage limits
                        </p>
                        <p className="text-xs mb-2">
                            Upgrade your plan for increased limits and access to all features.
                        </p>
                        <a
                            href="https://costkatana.com/pricing"
                            className="inline-flex items-center text-xs bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                        >
                            View Plans →
                        </a>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
