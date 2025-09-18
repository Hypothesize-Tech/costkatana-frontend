import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  error = false,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 glass border-2 rounded-xl text-sm font-body transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-xl placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary resize-none shadow-sm hover:shadow-md focus:shadow-lg min-h-[120px]';
  const normalClasses = 'border-primary-200/30 focus:ring-primary-500 focus:border-primary-400 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50';
  const errorClasses = 'border-danger-400 focus:ring-danger-500 focus:border-danger-500 text-light-text-primary dark:text-dark-text-primary hover:border-danger-500/70';

  return (
    <textarea
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
      {...props}
    />
  );
};
