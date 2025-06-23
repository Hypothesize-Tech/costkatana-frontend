import React, { useState } from 'react';
import { Switch } from '@headlessui/react';

interface NotificationSettings {
    email: {
        costAlerts: boolean;
        optimizationSuggestions: boolean;
        weeklyReports: boolean;
        monthlyReports: boolean;
        anomalyDetection: boolean;
    };
    push: {
        costAlerts: boolean;
        optimizationSuggestions: boolean;
        anomalyDetection: boolean;
    };
}

interface ThresholdSettings {
    dailyCostLimit: number;
    weeklyCostLimit: number;
    monthlyCostLimit: number;
    anomalyPercentage: number;
}

interface SettingsState extends NotificationSettings {
    thresholds: ThresholdSettings;
}

interface NotificationSettingsProps {
    onUpdate: (data: { notifications: NotificationSettings }) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    onUpdate,
}) => {
    const [settings, setSettings] = useState<SettingsState>({
        email: {
            costAlerts: true,
            optimizationSuggestions: true,
            weeklyReports: true,
            monthlyReports: false,
            anomalyDetection: true,
        },
        push: {
            costAlerts: true,
            optimizationSuggestions: false,
            anomalyDetection: true,
        },
        thresholds: {
            dailyCostLimit: 100,
            weeklyCostLimit: 500,
            monthlyCostLimit: 2000,
            anomalyPercentage: 50,
        },
    });

    const handleToggle = (
        category: 'email' | 'push',
        setting: keyof NotificationSettings['email'] | keyof NotificationSettings['push']
    ) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
            },
        }));
    };

    const handleThresholdChange = (field: string, value: number) => {
        setSettings({
            ...settings,
            thresholds: {
                ...settings.thresholds,
                [field]: value,
            },
        });
    };

    const handleSave = () => {
        onUpdate({ notifications: settings });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Choose how you want to be notified about important events
                </p>
            </div>

            {/* Email Notifications */}
            <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                    {Object.entries(settings.email).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </label>
                                <p className="text-sm text-gray-500">
                                    {key === 'costAlerts' && 'Get notified when costs exceed thresholds'}
                                    {key === 'optimizationSuggestions' && 'Receive AI-powered optimization tips'}
                                    {key === 'weeklyReports' && 'Weekly summary of usage and savings'}
                                    {key === 'monthlyReports' && 'Detailed monthly analytics report'}
                                    {key === 'anomalyDetection' && 'Alert on unusual usage patterns'}
                                </p>
                            </div>
                            <Switch
                                checked={value}
                                onChange={() => handleToggle('email', key as keyof NotificationSettings['email'])}
                                className={`${value ? 'bg-indigo-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span
                                    className={`${value ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    ))}
                </div>
            </div>

            {/* Push Notifications */}
            <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Push Notifications</h3>
                <div className="space-y-4">
                    {Object.entries(settings.push).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </label>
                            </div>
                            <Switch
                                checked={value}
                                onChange={() => handleToggle('push', key as keyof NotificationSettings['push'])}
                                className={`${value ? 'bg-indigo-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span
                                    className={`${value ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alert Thresholds */}
            <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Alert Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Daily Cost Limit ($)
                        </label>
                        <input
                            type="number"
                            value={settings.thresholds.dailyCostLimit}
                            onChange={(e) => handleThresholdChange('dailyCostLimit', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Weekly Cost Limit ($)
                        </label>
                        <input
                            type="number"
                            value={settings.thresholds.weeklyCostLimit}
                            onChange={(e) => handleThresholdChange('weeklyCostLimit', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Monthly Cost Limit ($)
                        </label>
                        <input
                            type="number"
                            value={settings.thresholds.monthlyCostLimit}
                            onChange={(e) => handleThresholdChange('monthlyCostLimit', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Anomaly Detection Threshold (%)
                        </label>
                        <input
                            type="number"
                            value={settings.thresholds.anomalyPercentage}
                            onChange={(e) => handleThresholdChange('anomalyPercentage', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Alert when usage exceeds normal by this percentage
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
};