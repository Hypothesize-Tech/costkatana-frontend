import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  error = false,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 glass border rounded-xl text-sm font-body transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-xl placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary';
  const normalClasses = 'border-primary-200/30 focus:ring-primary-500 focus:border-primary-300 text-light-text-primary dark:text-dark-text-primary';
  const errorClasses = 'border-danger-300 focus:ring-danger-500 focus:border-danger-300 text-light-text-primary dark:text-dark-text-primary';

  return (
    <input
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
      {...props}
    />
  );
};
