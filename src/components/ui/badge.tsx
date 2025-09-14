import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'default' | 'sm';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-display font-medium rounded-full transition-all duration-300 hover:scale-105';

  const variantClasses = {
    default: 'bg-gradient-primary text-white glow-primary',
    secondary: 'glass border border-secondary-200/30 text-light-text-secondary dark:text-dark-text-secondary backdrop-blur-xl',
    outline: 'glass border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary backdrop-blur-xl',
    destructive: 'bg-gradient-danger text-white glow-danger',
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
