import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  error = false,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 glass border-2 rounded-xl text-sm font-body transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-xl placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary shadow-sm hover:shadow-md focus:shadow-lg';
  const normalClasses = 'border-primary-200/30 focus:ring-primary-500 focus:border-primary-400 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50';
  const errorClasses = 'border-danger-400 focus:ring-danger-500 focus:border-danger-500 text-light-text-primary dark:text-dark-text-primary hover:border-danger-500/70';

  return (
    <input
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
      {...props}
    />
  );
};
