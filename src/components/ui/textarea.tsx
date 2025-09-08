import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  error = false,
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const normalClasses = 'border-gray-300 focus:ring-indigo-500 focus:border-transparent';
  const errorClasses = 'border-red-300 focus:ring-red-500 focus:border-transparent';

  return (
    <textarea
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
      {...props}
    />
  );
};
