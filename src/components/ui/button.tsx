import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'highlight';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-lg';

  const variantClasses = {
    default: 'bg-gradient-primary text-white shadow-lg focus:ring-primary-500 hover:shadow-xl',
    secondary: 'bg-gradient-secondary text-white shadow-lg focus:ring-secondary-500 hover:shadow-xl',
    outline: 'glass border-2 border-primary-200/30 backdrop-blur-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    ghost: 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 focus:ring-primary-500',
    destructive: 'bg-gradient-danger text-white shadow-lg focus:ring-danger-500 hover:shadow-xl',
    success: 'bg-gradient-success text-white shadow-lg focus:ring-success-500 hover:shadow-xl',
    warning: 'bg-gradient-accent text-white shadow-lg focus:ring-accent-500 hover:shadow-xl',
    highlight: 'bg-gradient-highlight text-white shadow-lg focus:ring-highlight-500 hover:shadow-xl',
  };

  const sizeClasses = {
    default: 'px-6 py-3 text-sm',
    sm: 'px-4 py-2 text-xs',
    lg: 'px-8 py-4 text-base',
    icon: 'p-3 w-10 h-10',
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
