import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(amount);
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

export const formatCompactNumber = (num: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
    });
    return formatter.format(num);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

export const formatPercentageChange = (value: number): string => {
    const formatted = formatPercentage(Math.abs(value));
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
};

// Date formatting
export const formatDate = (date: string | Date, formatStr: string = 'MMM d, yyyy'): string => {
    if (!date) {
        return 'N/A';
    }

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        return format(dateObj, formatStr);
    } catch (error) {
        return 'N/A';
    }
};

export const formatDateTime = (date: string | Date): string => {
    if (!date) {
        return 'N/A';
    }

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        return format(dateObj, 'MMM d, yyyy h:mm a');
    } catch (error) {
        return 'N/A';
    }
};

export const formatRelativeTime = (date: string | Date): string => {
    // Handle empty, null, or undefined dates
    if (!date) {
        return 'Never';
    }

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        // Check if the parsed date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Never';
        }

        return formatDistance(dateObj, new Date(), { addSuffix: true });
    } catch (error) {
        // If parsing fails, return a fallback
        return 'Never';
    }
};

// Safe timestamp formatting for times (HH:MM:SS format)
export const formatTimestamp = (timestamp: string | Date | number): string => {
    // Handle null/undefined/empty values
    if (!timestamp || timestamp === 'null' || timestamp === 'undefined') {
        return 'Just now';
    }

    try {
        let dateObj: Date;
        
        if (typeof timestamp === 'string') {
            // Handle empty strings
            if (timestamp.trim() === '') {
                return 'Just now';
            }
            
            // Try parsing ISO string first (MongoDB format: "2024-12-15T14:30:45.000Z")
            dateObj = parseISO(timestamp);
            
            // If parseISO fails, try standard Date constructor
            if (isNaN(dateObj.getTime())) {
                dateObj = new Date(timestamp);
            }
        } else if (typeof timestamp === 'number') {
            // Handle Unix timestamps (both seconds and milliseconds)
            dateObj = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        } else if (timestamp instanceof Date) {
            dateObj = timestamp;
        } else {
            // Fallback for any other type
            return 'Just now';
        }

        // Final validation
        if (isNaN(dateObj.getTime())) {
            return 'Just now';
        }

        return dateObj.toLocaleTimeString();
    } catch (error) {
        return 'Just now';
    }
};

// Safe date formatting with better fallbacks
export const formatSafeDate = (date: string | Date | number): string => {
    if (!date) {
        return 'Unknown date';
    }

    try {
        let dateObj: Date;
        
        if (typeof date === 'string') {
            dateObj = parseISO(date);
            if (isNaN(dateObj.getTime())) {
                dateObj = new Date(date);
            }
        } else if (typeof date === 'number') {
            dateObj = new Date(date < 10000000000 ? date * 1000 : date);
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) {
            return 'Unknown date';
        }

        return format(dateObj, 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Unknown date';
    }
};

export const formatRelativeDate = (date: string | Date): string => {
    if (!date) {
        return 'Never';
    }

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'Never';
        }

        return formatRelative(dateObj, new Date());
    } catch (error) {
        return 'Never';
    }
};

// Token formatting
export const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return tokens.toString();
    return formatCompactNumber(tokens);
};

// Duration formatting
export const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

export const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

// File size formatting
export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Text formatting
export const truncateText = (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

export const capitalizeFirst = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatServiceName = (service: string): string => {
    if (!service || typeof service !== 'string') {
        return 'Unknown Service';
    }
    
    const serviceMap: Record<string, string> = {
        'openai': 'OpenAI',
        'aws-bedrock': 'AWS Bedrock',
        'aws bedrock': 'AWS Bedrock',
        'bedrock': 'AWS Bedrock',
        'google-ai': 'Google AI',
        'anthropic': 'Anthropic',
        'huggingface': 'Hugging Face',
        'cohere': 'Cohere',
        'meta': 'Meta',
        'mistral': 'Mistral AI',
        'ai21': 'AI21 Labs',
    };
    
    // Normalize the service name to lowercase for lookup
    const normalizedService = service.toLowerCase().trim();
    return serviceMap[normalizedService] || capitalizeFirst(service);
};

// Model name formatting
export const formatModelName = (model: string): string => {
    if (!model || typeof model !== 'string') {
        return 'Unknown Model';
    }
    return model
        .split('-')
        .map(part => capitalizeFirst(part))
        .join(' ');
};

// Prompt formatting
export const formatPrompt = (prompt: string, maxLength: number = 100): string => {
    if (!prompt || prompt.trim() === '') return 'No prompt';
    const cleaned = prompt.replace(/\n+/g, ' ').trim();
    return truncateText(cleaned, maxLength);
};

// Error message formatting
export const formatErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred';
};

// Plural formatting
export const pluralize = (count: number, singular: string, plural?: string): string => {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
};

/**
 * Safely render markdown/HTML content with proper formatting
 */
export const renderFormattedContent = (content: string): string => {
    if (!content) return '';

    return content
        // Remove HTML tags but preserve line breaks
        .replace(/<[^>]*>/g, '')
        // Remove markdown headers more aggressively
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')
        // Remove italic formatting
        .replace(/\*(.*?)\*/g, '$1')
        // Remove inline code formatting
        .replace(/`([^`]+)`/g, '$1')
        // Remove code blocks but preserve content
        .replace(/```[\s\S]*?```/g, (match) => {
            const code = match.slice(3, -3);
            const lines = code.split('\n');
            const language = lines[0].trim();
            const codeContent = lines.slice(1).join('\n');
            return `\n[${language.toUpperCase()} CODE]\n${codeContent}\n[/CODE]\n`;
        })
        // Remove list markers
        .replace(/^[-*+]\s+/gm, '• ')
        // Remove numbered list markers
        .replace(/^\d+\.\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
};

/**
 * Format optimization suggestions for display
 */
export function formatOptimizationSuggestions(suggestions: any[]): any[] {
    return suggestions.map(suggestion => ({
        ...suggestion,
        description: renderFormattedContent(suggestion.description || suggestion.explanation || ''),
        type: suggestion.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Optimization'
    }));
}

/**
 * Format comparison data for display
 */
export function formatComparisonData(data: any): any {
    if (!data) return data;
    
    return {
        ...data,
        comparison: {
            ...data.comparison,
            summary: renderFormattedContent(data.comparison?.summary || ''),
            recommendations: data.comparison?.recommendations?.map((rec: any) => ({
                ...rec,
                recommendation: renderFormattedContent(rec.recommendation || ''),
                targetGroup: rec.targetGroup || 'General'
            })) || [],
            collaborationOpportunities: data.comparison?.collaborationOpportunities?.map((opp: string) => 
                renderFormattedContent(opp)
            ) || []
        }
    };
}

// Error formatting functions
export const formatHttpStatusCode = (statusCode?: number): string => {
    if (!statusCode) return '';
    
    let statusText = '';
    
    if (statusCode >= 200 && statusCode < 300) {
        statusText = 'Success';
    } else if (statusCode >= 300 && statusCode < 400) {
        statusText = 'Redirect';
    } else if (statusCode >= 400 && statusCode < 500) {
        statusText = 'Client Error';
    } else if (statusCode >= 500) {
        statusText = 'Server Error';
    }
    
    return `${statusCode} ${statusText}`;
};

export const formatErrorType = (errorType?: string): string => {
    if (!errorType) return '';
    
    const errorTypeMap: Record<string, string> = {
        'client_error': 'Client Error',
        'server_error': 'Server Error',
        'network_error': 'Network Error',
        'auth_error': 'Authentication Error',
        'rate_limit': 'Rate Limited',
        'timeout': 'Timeout',
        'validation_error': 'Validation Error',
        'integration_error': 'Integration Error'
    };
    
    return errorTypeMap[errorType] || errorType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getStatusCodeColor = (statusCode?: number): string => {
    if (!statusCode) return 'gray';
    
    if (statusCode >= 200 && statusCode < 300) return 'green';
    if (statusCode >= 300 && statusCode < 400) return 'blue';
    if (statusCode >= 400 && statusCode < 500) return 'yellow';
    if (statusCode >= 500) return 'red';
    
    return 'gray';
};

export const getErrorTypeColor = (errorType?: string): string => {
    if (!errorType) return 'gray';
    
    switch (errorType) {
        case 'auth_error': return 'red';
        case 'rate_limit': return 'orange';
        case 'timeout': return 'yellow';
        case 'validation_error': return 'blue';
        case 'client_error': return 'yellow';
        case 'server_error': return 'red';
        case 'network_error': return 'purple';
        case 'integration_error': return 'gray';
        default: return 'gray';
    }
};