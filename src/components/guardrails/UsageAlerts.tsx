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
                return (
                    <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                        <XCircle className="w-4 h-4 text-white" />
                    </div>
                );
            case 'medium':
                return (
                    <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                );
            case 'low':
                return (
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                        <Bell className="w-4 h-4 text-white" />
                    </div>
                );
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-gradient-to-br from-danger-50/50 to-danger-100/50 border-danger-200/30';
            case 'medium':
                return 'bg-gradient-to-br from-warning-50/50 to-warning-100/50 border-warning-200/30';
            case 'low':
                return 'bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30';
            default:
                return 'bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'gradient-text-danger';
            case 'medium':
                return 'gradient-text-warning';
            case 'low':
                return 'gradient-text';
            default:
                return 'text-light-text-primary dark:text-dark-text-primary';
        }
    };

    if (loading) {
        return (
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">🔔 Usage Alerts</h3>
                </div>
                <div className="flex items-center justify-center h-32">
                    <div className="spinner-lg text-primary-500"></div>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">🔔 Usage Alerts</h3>
                </div>
                <div className="flex flex-col items-center justify-center h-32 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-success flex items-center justify-center mb-4 shadow-2xl glow-success animate-pulse">
                        <CheckCircle className="w-8 w-8 text-white" />
                    </div>
                    <p className="text-lg font-display font-bold gradient-text-success mb-2">No Active Alerts</p>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Your usage is within normal limits</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">🔔 Usage Alerts</h3>
                </div>
                {alerts.length > 0 && (
                    <span className="text-sm font-display font-bold bg-gradient-danger text-white px-3 py-1 rounded-full shadow-lg">
                        {alerts.length} active
                    </span>
                )}
            </div>
            <div className="space-y-4">
                {alerts.map(alert => (
                    <div
                        key={alert._id}
                        className={`card card-hover p-6 rounded-xl border ${getSeverityColor(alert.severity)} transition-all duration-300 hover:scale-105`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                {getSeverityIcon(alert.severity)}
                                <div className="flex-1">
                                    <h4 className={`font-display font-bold text-lg ${getSeverityTextColor(alert.severity)}`}>
                                        {alert.title}
                                    </h4>
                                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                        {alert.message}
                                    </p>

                                    {alert.metadata?.suggestions && alert.metadata.suggestions.length > 0 && (
                                        <div className="mt-4 glass p-4 rounded-xl border border-primary-200/30">
                                            <p className="text-sm font-display font-bold gradient-text mb-3">
                                                💡 Recommendations:
                                            </p>
                                            <ul className="space-y-2">
                                                {alert.metadata.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                                                    <li key={index} className="text-sm font-body text-light-text-primary dark:text-dark-text-primary flex items-start">
                                                        <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 mt-2 flex-shrink-0 shadow-lg"></div>
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {alert.metadata?.percentage && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Usage Progress</span>
                                                <span className={`text-sm font-display font-bold ${alert.metadata.percentage >= 90
                                                    ? 'gradient-text-danger'
                                                    : alert.metadata.percentage >= 75
                                                        ? 'gradient-text-warning'
                                                        : 'gradient-text-success'
                                                    }`}>
                                                    {alert.metadata.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-primary-200/30 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${alert.metadata.percentage >= 90
                                                        ? 'bg-gradient-danger glow-danger'
                                                        : alert.metadata.percentage >= 75
                                                            ? 'bg-gradient-warning glow-warning'
                                                            : 'bg-gradient-success glow-success'
                                                        }`}
                                                    style={{ width: `${Math.min(alert.metadata.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted mt-4">
                                        ⏰ {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => dismissAlert(alert._id)}
                                className="ml-4 p-2 hover:bg-primary-500/10 rounded-xl transition-all duration-300 hover:scale-110"
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted hover:text-danger-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.some(alert => alert.severity === 'high') && (
                <div className="mt-6 card p-6 bg-gradient-primary shadow-2xl backdrop-blur-xl border border-primary-200/30">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-display font-bold text-white">
                            🚨 Approaching Usage Limits
                        </p>
                    </div>
                    <p className="text-sm font-body text-white/90 mb-4">
                        Upgrade your plan for increased limits and access to all features.
                    </p>
                    <a
                        href="https://costkatana.com/pricing"
                        className="inline-flex items-center text-sm font-display font-semibold bg-white text-primary-600 px-4 py-2 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        ✨ View Plans →
                    </a>
                </div>
            )}
        </div>
    );
};
