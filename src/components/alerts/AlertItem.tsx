// src/components/alerts/AlertItem.tsx
import React, { useState } from 'react';
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    BellIcon,
    BellSlashIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Alert } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface AlertItemProps {
    alert: Alert;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onSnooze: (id: string, until: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({
    alert,
    onMarkAsRead,
    onDelete,
    onSnooze,
}) => {
    const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

    const getIcon = () => {
        const iconProps = "h-5 w-5";

        switch (alert.severity) {
            case 'critical':
                return <XCircleIcon className={`${iconProps} text-red-500`} />;
            case 'high':
                return <ExclamationTriangleIcon className={`${iconProps} text-orange-500`} />;
            case 'medium':
                return <InformationCircleIcon className={`${iconProps} text-yellow-500`} />;
            case 'low':
                return <CheckCircleIcon className={`${iconProps} text-blue-500`} />;
            default:
                return <BellIcon className={`${iconProps} text-gray-500`} />;
        }
    };

    const getSeverityColor = () => {
        switch (alert.severity) {
            case 'critical':
                return 'border-red-200 bg-red-50';
            case 'high':
                return 'border-orange-200 bg-orange-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const handleSnooze = (hours: number) => {
        const until = new Date();
        until.setHours(until.getHours() + hours);
        onSnooze(alert._id, until.toISOString());
        setShowSnoozeMenu(false);
    };

    return (
        <div
            className={`p-4 rounded-lg border ${getSeverityColor()} ${!alert.read ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
                }`}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>

                    {/* Metadata */}
                    {alert.data && (
                        <div className="mt-2 text-xs text-gray-500">
                            {alert.type === 'cost_threshold' && alert.data.amount && (
                                <span>Amount: {formatCurrency(alert.data.amount)}</span>
                            )}
                            {alert.type === 'optimization_available' && alert.data.savings && (
                                <span>Potential savings: {formatCurrency(alert.data.savings)}</span>
                            )}
                            {alert.type === 'usage_spike' && alert.data.deviation && (
                                <span>Deviation: {alert.data.deviation.toFixed(1)}%</span>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex items-center space-x-4 text-xs">
                        <span className="text-gray-500">
                            {formatDate(alert.createdAt, 'relative')}
                        </span>

                        {!alert.read && (
                            <button
                                onClick={() => onMarkAsRead(alert._id)}
                                className="text-indigo-600 hover:text-indigo-500"
                            >
                                Mark as read
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                                className="text-gray-600 hover:text-gray-500"
                            >
                                <BellSlashIcon className="h-4 w-4 inline mr-1" />
                                Snooze
                            </button>

                            {showSnoozeMenu && (
                                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => handleSnooze(1)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        1 hour
                                    </button>
                                    <button
                                        onClick={() => handleSnooze(4)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        4 hours
                                    </button>
                                    <button
                                        onClick={() => handleSnooze(24)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        1 day
                                    </button>
                                    <button
                                        onClick={() => handleSnooze(168)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        1 week
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => onDelete(alert._id)}
                            className="text-red-600 hover:text-red-500"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};