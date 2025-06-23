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
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatRelativeDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date());
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
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatServiceName = (service: string): string => {
    const serviceMap: Record<string, string> = {
        'openai': 'OpenAI',
        'aws-bedrock': 'AWS Bedrock',
        'google-ai': 'Google AI',
        'anthropic': 'Anthropic',
        'huggingface': 'Hugging Face',
        'cohere': 'Cohere',
    };
    return serviceMap[service] || capitalizeFirst(service);
};

// Model name formatting
export const formatModelName = (model: string): string => {
    return model
        .split('-')
        .map(part => capitalizeFirst(part))
        .join(' ');
};

// Prompt formatting
export const formatPrompt = (prompt: string, maxLength: number = 100): string => {
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