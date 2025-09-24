/**
 * Format a number with commas for thousands
 */
export const formatNumber = (num: number): string => {
    if (num === undefined || num === null) return '0';
    
    // Handle very large numbers
    if (num >= 1e9) {
        return `${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
        return `${(num / 1e6).toFixed(2)}M`;
    }
    if (num >= 1e3) {
        return `${(num / 1e3).toFixed(1)}K`;
    }
    
    return num.toLocaleString();
};

/**
 * Smart number formatting - shows meaningful digits after decimal
 */
export const formatSmartNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num >= 1) return num.toFixed(2);
    
    // For numbers less than 1, find the first non-zero digit after decimal
    const str = num.toString();
    const decimalIndex = str.indexOf('.');
    
    if (decimalIndex === -1) return num.toString();
    
    const afterDecimal = str.substring(decimalIndex + 1);
    let firstNonZeroIndex = -1;
    
    for (let i = 0; i < afterDecimal.length; i++) {
        if (afterDecimal[i] !== '0') {
            firstNonZeroIndex = i;
            break;
        }
    }
    
    if (firstNonZeroIndex === -1) return '0';
    
    // Show up to the first 2-3 significant digits after the first non-zero
    const significantDigits = Math.max(2, firstNonZeroIndex + 2);
    const decimalPlaces = Math.min(significantDigits, 6); // Cap at 6 decimal places
    
    return num.toFixed(decimalPlaces);
};

/**
 * Format currency values with smart decimal handling
 */
export const formatCurrency = (amount: number, _currency: string = 'USD'): string => {
    const formattedAmount = formatSmartNumber(amount);
    return `$${formattedAmount}`;
};

/**
 * Format currency values (legacy - for backwards compatibility)
 */
export const formatCurrencyLegacy = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
    // Handle null, undefined, or invalid dates
    if (!date) {
        return 'No date available';
    }

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }

    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
};

/**
 * Format date to readable format
 */
export const formatDate = (date: Date | string | null | undefined, format?: string): string => {
    // Handle null, undefined, or invalid dates
    if (!date) {
        return 'No date available';
    }

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }

    if (format === 'relative') {
        return formatRelativeTime(d);
    }

    if (format === 'short' || format === 'MMM dd' || format === 'MMM d') {
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
    // Handle null, undefined, or invalid dates
    if (!date) {
        return 'No date available';
    }

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }

    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format duration in milliseconds to human readable
 */
export const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format model name for display
 */
export const formatModelName = (model: string): string => {
    const modelMap: { [key: string]: string } = {
        'gpt-4': 'GPT-4',
        'gpt-4-turbo': 'GPT-4 Turbo',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        'claude-3-opus': 'Claude 3 Opus',
        'claude-3-sonnet': 'Claude 3 Sonnet',
        'claude-3-haiku': 'Claude 3 Haiku',
        'claude-3.5-sonnet': 'Claude 3.5 Sonnet',
        'gemini-1.5-pro': 'Gemini 1.5 Pro',
        'gemini-1.5-flash': 'Gemini 1.5 Flash',
        'llama-3-70b': 'Llama 3 70B',
        'llama-3-8b': 'Llama 3 8B'
    };
    
    return modelMap[model] || model;
};

/**
 * Format plan name for display
 */
export const formatPlanName = (plan: string): string => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
};

/**
 * Calculate and format time remaining
 */
export const formatTimeRemaining = (endDate: Date | string): string => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days remaining`;
    return `${hours} hours remaining`;
};

/**
 * Format token count with appropriate units
 */
export const formatTokens = (tokens: number): string => {
    if (tokens >= 1e9) return `${(tokens / 1e9).toFixed(2)}B tokens`;
    if (tokens >= 1e6) return `${(tokens / 1e6).toFixed(2)}M tokens`;
    if (tokens >= 1e3) return `${(tokens / 1e3).toFixed(1)}K tokens`;
    return `${tokens} tokens`;
};

/**
 * Additional formatter functions for compatibility
 */

export const formatServiceName = (service: string): string => {
    const serviceMap: { [key: string]: string } = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google',
        'azure': 'Azure',
        'aws': 'AWS',
        'huggingface': 'HuggingFace'
    };
    return serviceMap[service.toLowerCase()] || service;
};

export const formatPrompt = (prompt: string, maxLength: number = 100): string => {
    if (!prompt) return '';
    if (prompt.length <= maxLength) return prompt;
    return `${prompt.substring(0, maxLength)}...`;
};

export const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

export const formatHttpStatusCode = (code: number): string => {
    const statusMap: { [key: number]: string } = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    return statusMap[code] || `Status ${code}`;
};

export const formatErrorType = (error: string): string => {
    if (!error) return 'Unknown Error';
    return error.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getStatusCodeColor = (code: number): string => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 400 && code < 500) return 'text-yellow-600';
    if (code >= 500) return 'text-red-600';
    return 'text-gray-600';
};

export const getErrorTypeColor = (error: string): string => {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('rate')) return 'text-yellow-600';
    if (lowerError.includes('auth')) return 'text-orange-600';
    if (lowerError.includes('server')) return 'text-red-600';
    return 'text-gray-600';
};

export const formatPercentageChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

export const formatTimestamp = (timestamp: Date | string | number): string => {
    const d = typeof timestamp === 'string' || typeof timestamp === 'number' 
        ? new Date(timestamp) 
        : timestamp;
    return d.toISOString();
};

export const renderFormattedContent = (content: string): string => {
    // Simple markdown-like formatting
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
};

export const formatOptimizationSuggestions = (suggestions: unknown[]): string[] => {
    if (!Array.isArray(suggestions)) return [];
    return suggestions.map(s => typeof s === 'string' ? s : (s as any)?.description || '');
};