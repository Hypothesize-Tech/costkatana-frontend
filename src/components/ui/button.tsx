import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-display font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95';

  const variantClasses = {
    default: 'bg-gradient-primary text-white hover:shadow-lg glow-primary focus:ring-primary-500',
    outline: 'glass border border-primary-200/30 bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    ghost: 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary focus:ring-primary-500',
    destructive: 'bg-gradient-danger text-white hover:shadow-lg glow-danger focus:ring-danger-500',
  };

  const sizeClasses = {
    default: 'px-6 py-3 text-sm',
    sm: 'px-4 py-2 text-xs',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
