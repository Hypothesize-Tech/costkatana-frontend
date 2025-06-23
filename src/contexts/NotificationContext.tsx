import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        handler: () => void;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (
        message: string,
        type?: NotificationType,
        options?: {
            title?: string;
            duration?: number;
            action?: {
                label: string;
                handler: () => void;
            };
        }
    ) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Alias for backward compatibility
export const useNotification = useNotifications;

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const showNotification = useCallback(
        (
            message: string,
            type: NotificationType = 'info',
            options?: {
                title?: string;
                duration?: number;
                action?: {
                    label: string;
                    handler: () => void;
                };
            }
        ) => {
            const id = uuidv4();
            const notification: Notification = {
                id,
                type,
                message,
                title: options?.title,
                duration: options?.duration ?? 5000,
                action: options?.action,
            };

            setNotifications((prev) => [...prev, notification]);

            // Auto-remove notification after duration (if not an error)
            if (type !== 'error' && notification.duration && notification.duration > 0) {
                setTimeout(() => {
                    removeNotification(id);
                }, notification.duration);
            }
        },
        [removeNotification]
    );

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        notifications,
        showNotification,
        removeNotification,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </NotificationContext.Provider>
    );
};

// Notification Container Component
interface NotificationContainerProps {
    notifications: Notification[];
    onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
    notifications,
    onRemove,
}) => {
    if (notifications.length === 0) return null;

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
};

// Individual Notification Component
interface NotificationItemProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return (
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50';
            case 'error':
                return 'bg-red-50';
            case 'warning':
                return 'bg-yellow-50';
            default:
                return 'bg-blue-50';
        }
    };

    return (
        <div
            className={`max-w-sm w-full ${getBgColor()} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">{getIcon()}</div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        {notification.title && (
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        )}
                        <p className={`${notification.title ? 'mt-1' : ''} text-sm text-gray-500`}>
                            {notification.message}
                        </p>
                        {notification.action && (
                            <div className="mt-3">
                                <button
                                    onClick={notification.action.handler}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {notification.action.label}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => onRemove(notification.id)}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};