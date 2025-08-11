import React from 'react';

interface AlertProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export const Alert: React.FC<AlertProps> = ({
    children,
    className = '',
    variant = 'default'
}) => {
    const variantClasses = {
        default: 'bg-blue-50 border-blue-200 text-blue-900',
        destructive: 'bg-red-50 border-red-200 text-red-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        success: 'bg-green-50 border-green-200 text-green-900'
    };

    return (
        <div className={`p-4 border rounded-lg ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <h3 className={`font-semibold mb-1 ${className}`}>
            {children}
        </h3>
    );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`text-sm ${className}`}>
            {children}
        </div>
    );
};
