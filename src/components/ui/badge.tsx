import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'highlight';
  size?: 'default' | 'sm';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-display font-semibold rounded-full transition-all duration-300 hover:scale-105 uppercase letter-spacing-wide';

  const variantClasses = {
    default: 'bg-gradient-primary text-white shadow-lg',
    secondary: 'bg-gradient-secondary text-white shadow-lg',
    outline: 'glass border border-primary-200/30 text-primary-600 dark:text-primary-400 backdrop-blur-xl',
    destructive: 'bg-gradient-danger text-white shadow-lg',
    success: 'bg-gradient-success text-white shadow-lg',
    warning: 'bg-gradient-accent text-white shadow-lg',
    highlight: 'bg-gradient-highlight text-white shadow-lg',
  };

  const sizeClasses = {
    default: 'px-3 py-1 text-xs',
    sm: 'px-2 py-0.5 text-xs',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
