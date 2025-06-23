// src/components/alerts/AlertBadge.tsx
import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface AlertBadgeProps {
    count: number;
    onClick?: () => void;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
    count,
    onClick,
    size = 'medium',
    showIcon = true,
}) => {
    const sizeClasses = {
        small: {
            icon: 'h-5 w-5',
            badge: 'h-4 w-4 text-xs',
            container: 'p-1',
        },
        medium: {
            icon: 'h-6 w-6',
            badge: 'h-5 w-5 text-xs',
            container: 'p-2',
        },
        large: {
            icon: 'h-8 w-8',
            badge: 'h-6 w-6 text-sm',
            container: 'p-3',
        },
    };

    const classes = sizeClasses[size];

    return (
        <button
            onClick={onClick}
            className={`relative ${classes.container} text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg`}
        >
            {showIcon && <BellIcon className={classes.icon} />}
            {count > 0 && (
                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center ${classes.badge} rounded-full bg-red-500 text-white font-bold`}>
                    {count > 99 ? '99+' : count}
                </span>
            )}
            <span className="sr-only">{count} unread alerts</span>
        </button>
    );
};