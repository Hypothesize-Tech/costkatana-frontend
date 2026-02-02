import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  variant?: 'default' | 'compact' | 'card';
}

export function ProgressiveDisclosure({
  title,
  children,
  defaultExpanded = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  icon: Icon,
  badge,
  variant = 'default'
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const baseClasses = {
    default: 'border border-primary-200/20 dark:border-primary-600/20 rounded-lg bg-white/30 dark:bg-dark-card/30',
    compact: 'border-b border-primary-200/20 dark:border-primary-600/20',
    card: 'border border-primary-200/30 dark:border-primary-500/20 rounded-xl shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel'
  };

  const headerClasses = {
    default: 'p-4 hover:bg-primary-50/50 dark:hover:bg-primary-900/20',
    compact: 'py-3 px-0 hover:bg-transparent',
    card: 'p-6 hover:bg-white/20 dark:hover:bg-dark-card/20'
  };

  const contentClasses = {
    default: 'px-4 pb-4',
    compact: 'py-3 px-0',
    card: 'px-6 pb-6'
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <button
        onClick={toggleExpanded}
        className={`w-full text-left transition-colors duration-200 ${headerClasses[variant]} ${headerClassName}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className={`font-medium text-secondary-900 dark:text-white truncate ${
                variant === 'card' ? 'text-lg' : variant === 'compact' ? 'text-sm' : 'text-base'
              }`}>
                {title}
              </h3>
            </div>
            {badge && (
              <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400">
                {badge}
              </span>
            )}
          </div>
          <div className="flex-shrink-0 ml-3">
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400 transition-transform duration-200" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {isExpanded && (
          <div className={`${contentClasses[variant]} ${contentClassName} animate-in slide-in-from-top-2 duration-300`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized variants for common use cases
export function CompactDisclosure({ title, children, ...props }: Omit<ProgressiveDisclosureProps, 'variant'>) {
  return (
    <ProgressiveDisclosure
      title={title}
      variant="compact"
      {...props}
    >
      {children}
    </ProgressiveDisclosure>
  );
}

export function CardDisclosure({ title, children, ...props }: Omit<ProgressiveDisclosureProps, 'variant'>) {
  return (
    <ProgressiveDisclosure
      title={title}
      variant="card"
      {...props}
    >
      {children}
    </ProgressiveDisclosure>
  );
}