/**
 * IntegrationSelector Component
 * 
 * Interactive UI component for selecting integration parameters.
 * Displays clickable option buttons when the AI needs user input
 * for missing parameters (e.g., which project to deploy).
 * 
 * Styled to match the Cost Katana app theme with glass morphism,
 * gradient effects, and smooth animations.
 */

import React, { useState, useCallback } from 'react';
import {
    ChevronRightIcon,
    FolderIcon,
    HashtagIcon,
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    LockClosedIcon,
    CodeBracketIcon,
    ServerIcon,
    CloudIcon,
    CheckCircleIcon,
    ClockIcon,
    TagIcon,
    InboxIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

export interface SelectionOption {
    id: string;
    label: string;
    value: string;
    description?: string;
    icon?: string;
}

export interface IntegrationSelectionData {
    parameterName: string;
    question: string;
    options: SelectionOption[];
    allowCustom: boolean;
    customPlaceholder?: string;
    integration: string;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    originalMessage?: string;
}

interface IntegrationSelectorProps {
    selection: IntegrationSelectionData;
    onSelect: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

// Icon mapping for different parameter types
const getIconForParameter = (paramName: string, optionIcon?: string): React.ReactNode => {
    const iconClass = "w-5 h-5";

    if (optionIcon) {
        switch (optionIcon) {
            case 'vercel':
            case 'globe':
                return <GlobeAltIcon className={iconClass} />;
            case 'folder':
                return <FolderIcon className={iconClass} />;
            case 'git-branch':
                return <CodeBracketIcon className={iconClass} />;
            case 'hash':
                return <HashtagIcon className={iconClass} />;
            case 'user':
            case 'users':
                return <UserIcon className={iconClass} />;
            case 'lock':
                return <LockClosedIcon className={iconClass} />;
            case 'code':
                return <CodeBracketIcon className={iconClass} />;
            case 'eye':
                return <ServerIcon className={iconClass} />;
            case 'check':
                return <CheckCircleIcon className={iconClass} />;
            case 'clock':
                return <ClockIcon className={iconClass} />;
            case 'mail':
                return <EnvelopeIcon className={iconClass} />;
            case 'calendar':
            case 'calendar-check':
                return <CalendarIcon className={iconClass} />;
            case 'inbox':
                return <InboxIcon className={iconClass} />;
            case 'tag':
                return <TagIcon className={iconClass} />;
            default:
                return <DocumentTextIcon className={iconClass} />;
        }
    }

    // Default icons based on parameter name
    switch (paramName) {
        case 'projectName':
        case 'project':
        case 'repo':
        case 'repository':
            return <FolderIcon className={iconClass} />;
        case 'channelId':
        case 'channel':
            return <HashtagIcon className={iconClass} />;
        case 'userId':
        case 'user':
            return <UserIcon className={iconClass} />;
        case 'to':
        case 'email':
            return <EnvelopeIcon className={iconClass} />;
        case 'branch':
        case 'head':
        case 'base':
            return <CodeBracketIcon className={iconClass} />;
        case 'teamId':
        case 'team':
            return <UserIcon className={iconClass} />;
        case 'calendarId':
        case 'calendar':
            return <CalendarIcon className={iconClass} />;
        default:
            return <DocumentTextIcon className={iconClass} />;
    }
};

// Integration brand colors matching app theme
const getIntegrationGradient = (integration: string): { button: string; icon: string } => {
    switch (integration) {
        case 'vercel':
            return {
                button: 'from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-600/30',
                icon: 'from-gray-600/30 to-gray-700/30',
            };
        case 'slack':
            return {
                button: 'from-purple-500/90 to-purple-600/90 hover:from-purple-400/90 hover:to-purple-500/90 border-purple-400/30',
                icon: 'from-purple-400/30 to-purple-500/30',
            };
        case 'discord':
            return {
                button: 'from-indigo-500/90 to-indigo-600/90 hover:from-indigo-400/90 hover:to-indigo-500/90 border-indigo-400/30',
                icon: 'from-indigo-400/30 to-indigo-500/30',
            };
        case 'github':
            return {
                button: 'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-500/30',
                icon: 'from-gray-500/30 to-gray-600/30',
            };
        case 'jira':
            return {
                button: 'from-blue-500/90 to-blue-600/90 hover:from-blue-400/90 hover:to-blue-500/90 border-blue-400/30',
                icon: 'from-blue-400/30 to-blue-500/30',
            };
        case 'linear':
            return {
                button: 'from-violet-500/90 to-violet-600/90 hover:from-violet-400/90 hover:to-violet-500/90 border-violet-400/30',
                icon: 'from-violet-400/30 to-violet-500/30',
            };
        case 'gmail':
        case 'google':
            return {
                button: 'from-red-500/90 to-red-600/90 hover:from-red-400/90 hover:to-red-500/90 border-red-400/30',
                icon: 'from-red-400/30 to-red-500/30',
            };
        case 'drive':
            return {
                button: 'from-yellow-500/90 to-yellow-600/90 hover:from-yellow-400/90 hover:to-yellow-500/90 border-yellow-400/30',
                icon: 'from-yellow-400/30 to-yellow-500/30',
            };
        case 'calendar':
            return {
                button: 'from-green-500/90 to-green-600/90 hover:from-green-400/90 hover:to-green-500/90 border-green-400/30',
                icon: 'from-green-400/30 to-green-500/30',
            };
        default:
            return {
                button: 'from-primary-500/90 to-primary-600/90 hover:from-primary-400/90 hover:to-primary-500/90 border-primary-400/30',
                icon: 'from-primary-400/30 to-primary-500/30',
            };
    }
};

export const IntegrationSelector: React.FC<IntegrationSelectorProps> = ({
    selection,
    onSelect,
    disabled = false,
    className = ''
}) => {
    const [customValue, setCustomValue] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleOptionClick = useCallback((option: SelectionOption) => {
        if (disabled) return;
        setSelectedOption(option.id);
        onSelect(option.value);
    }, [disabled, onSelect]);

    const handleCustomSubmit = useCallback(() => {
        if (disabled || !customValue.trim()) return;
        setSelectedOption('custom');
        onSelect(customValue.trim());
    }, [disabled, customValue, onSelect]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCustomSubmit();
        }
    }, [handleCustomSubmit]);

    const gradients = getIntegrationGradient(selection.integration);

    return (
        <div className={`integration-selector animate-fade-in ${className}`}>
            {/* Question with icon */}
            <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2.5 rounded-xl shadow-md">
                    <SparklesIcon className="w-5 h-5 text-primary-500" />
                </div>
                <p className="font-display font-semibold text-base text-light-text-primary dark:text-dark-text-primary">
                    {selection.question}
                </p>
            </div>

            {/* Options Grid */}
            {selection.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {selection.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option)}
                            disabled={disabled}
                            className={`
                relative glass p-4 rounded-xl text-left
                bg-gradient-to-br ${gradients.button}
                backdrop-blur-xl border
                transition-all duration-300 ease-out
                transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none
                group
                ${selectedOption === option.id
                                    ? 'ring-2 ring-primary-400/50 scale-[1.02] shadow-xl glow-primary'
                                    : 'shadow-lg'
                                }
              `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradients.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="text-white">
                                        {getIconForParameter(selection.parameterName, option.icon)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <span className="block font-display font-semibold text-sm text-white truncate">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="block text-xs text-white/70 truncate mt-0.5 font-body">
                                            {option.description}
                                        </span>
                                    )}
                                </div>

                                {/* Selection indicator */}
                                {selectedOption === option.id && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircleIcon className="w-5 h-5 text-success-400 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Custom Input Section */}
            {selection.allowCustom && (
                <div className="mt-4">
                    {!showCustomInput ? (
                        <button
                            onClick={() => setShowCustomInput(true)}
                            disabled={disabled}
                            className="
                flex items-center gap-2 px-4 py-3 w-full
                glass rounded-xl border-2 border-dashed border-primary-300/30
                text-light-text-secondary dark:text-dark-text-secondary 
                hover:text-primary-500 hover:border-primary-400/50
                hover:bg-primary-500/5
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                font-display font-medium text-sm
              "
                        >
                            <CloudIcon className="w-4 h-4" />
                            <span>Other...</span>
                        </button>
                    ) : (
                        <div className="flex gap-2 animate-fade-in">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder={selection.customPlaceholder || `Enter ${selection.parameterName}...`}
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={disabled}
                                    autoFocus
                                    className="
                    w-full px-4 py-3 rounded-xl
                    glass border border-primary-200/30
                    bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50
                    text-light-text-primary dark:text-dark-text-primary 
                    placeholder-light-text-secondary dark:placeholder-dark-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    font-body text-sm
                  "
                                />
                            </div>
                            <button
                                onClick={handleCustomSubmit}
                                disabled={disabled || !customValue.trim()}
                                className={`
                  flex items-center justify-center px-4 py-3 rounded-xl
                  bg-gradient-to-br from-primary-500 to-primary-600
                  text-white font-display font-semibold
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:shadow-xl hover:scale-105 glow-primary
                `}
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* No options message */}
            {selection.options.length === 0 && !selection.allowCustom && (
                <div className="text-center py-8 glass rounded-xl border border-primary-200/30">
                    <DocumentTextIcon className="w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-2" />
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                        No options available. Please try again.
                    </p>
                </div>
            )}

            {/* Context info badge */}
            <div className="mt-4 flex items-center gap-2">
                <span className="glass px-3 py-1.5 rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 font-display font-semibold text-xs text-primary-600 dark:text-primary-400 capitalize">
                    {selection.integration}
                </span>
                <span className="text-light-text-secondary dark:text-dark-text-secondary text-xs">•</span>
                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                    {selection.pendingAction.replace(/_/g, ' ')}
                </span>
            </div>
        </div>
    );
};

export default IntegrationSelector;
