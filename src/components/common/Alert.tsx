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
        default: 'bg-gradient-primary/10 border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary',
        destructive: 'bg-gradient-danger/10 border border-danger-200/30 text-danger-600 dark:text-danger-400',
        warning: 'bg-gradient-warning/10 border border-warning-200/30 text-warning-600 dark:text-warning-400',
        success: 'bg-gradient-success/10 border border-success-200/30 text-success-600 dark:text-success-400'
    };

    return (
        <div className={`p-4 rounded-xl glass backdrop-blur-xl shadow-lg animate-fade-in ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <h3 className={`font-display font-semibold mb-2 ${className}`}>
            {children}
        </h3>
    );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`text-sm font-body leading-relaxed ${className}`}>
            {children}
        </div>
    );
};
