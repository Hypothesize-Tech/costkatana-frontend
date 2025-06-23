import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Usage validation schemas
export const trackUsageSchema = z.object({
    service: z.enum(['openai', 'aws-bedrock', 'google-ai', 'anthropic', 'huggingface', 'cohere']),
    model: z.string().min(1, 'Model is required'),
    prompt: z.string().min(1, 'Prompt is required'),
    completion: z.string().optional(),
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    cost: z.number().nonnegative(),
    responseTime: z.number().nonnegative(),
    metadata: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
});

// Optimization validation schemas
export const createOptimizationSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
    service: z.string().min(1, 'Service is required'),
    model: z.string().min(1, 'Model is required'),
    context: z.string().optional(),
    options: z.object({
        targetReduction: z.number().min(0).max(100).optional(),
        preserveIntent: z.boolean().optional(),
        suggestAlternatives: z.boolean().optional(),
    }).optional(),
});

export const optimizationFeedbackSchema = z.object({
    helpful: z.boolean(),
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(500).optional(),
});

// User profile validation schemas
export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    preferences: z.object({
        emailAlerts: z.boolean().optional(),
        alertThreshold: z.number().positive().optional(),
        weeklyReports: z.boolean().optional(),
        optimizationSuggestions: z.boolean().optional(),
    }).optional(),
});

export const addApiKeySchema = z.object({
    service: z.string().min(1, 'Service is required'),
    key: z.string().min(10, 'API key must be at least 10 characters'),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Filter validation schemas
export const dateRangeSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: 'Start date must be before end date',
});

export const paginationSchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

// Custom validation functions
export const isValidApiKey = (key: string): boolean => {
    // Basic validation - adjust based on actual API key formats
    return key.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(key);
};

export const isValidPrompt = (prompt: string): boolean => {
    return prompt.trim().length >= 10 && prompt.trim().length <= 10000;
};

export const isValidModel = (service: string, model: string): boolean => {
    const validModels: Record<string, string[]> = {
        openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'text-embedding-ada-002'],
        'aws-bedrock': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'],
        'google-ai': ['gemini-pro', 'gemini-pro-vision', 'palm-2'],
        anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        huggingface: ['llama-2', 'mistral-7b', 'falcon-40b'],
        cohere: ['command', 'command-light', 'embed-english-v3.0'],
    };

    return validModels[service]?.includes(model) || false;
};

// Type guards
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TrackUsageFormData = z.infer<typeof trackUsageSchema>;
export type CreateOptimizationFormData = z.infer<typeof createOptimizationSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;