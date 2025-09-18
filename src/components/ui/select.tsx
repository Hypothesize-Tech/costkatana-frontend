import React, { useState } from 'react';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');

  const handleSelect = (itemValue: string) => {
    setSelectedValue(itemValue);
    onValueChange?.(itemValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            selectedValue,
            handleSelect,
          })
          : child
      )}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps & any> = ({
  children,
  className = '',
  isOpen,
  setIsOpen
}) => {
  return (
    <button
      type="button"
      className={`w-full px-4 py-3 text-left glass border-2 border-primary-200/30 rounded-xl backdrop-blur-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all duration-300 text-light-text-primary dark:text-dark-text-primary shadow-sm hover:shadow-md hover:border-primary-300/50 ${className}`}
      onClick={() => setIsOpen?.(!isOpen)}
    >
      <div className="flex items-center justify-between">
        {children}
        <svg
          className={`w-4 h-4 transition-transform text-primary-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps & any> = ({
  children,
  isOpen,
  handleSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-50 w-full mt-2 glass border border-primary-200/30 rounded-xl shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-h-60 overflow-auto animate-fade-in">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { handleSelect })
          : child
      )}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps & any> = ({
  value,
  children,
  handleSelect
}) => {
  return (
    <div
      className="px-4 py-3 text-sm font-body cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 text-light-text-primary dark:text-dark-text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-sm rounded-lg mx-1 my-0.5"
      onClick={() => handleSelect?.(value)}
    >
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps & any> = ({
  placeholder,
  selectedValue
}) => {
  return (
    <span className={selectedValue ? 'text-light-text-primary dark:text-dark-text-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}>
      {selectedValue || placeholder}
    </span>
  );
};
