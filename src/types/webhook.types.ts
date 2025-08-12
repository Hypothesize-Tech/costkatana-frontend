export interface IWebhook {
    id: string;
    name: string;
    description?: string;
    url: string;
    active: boolean;
    version: string;
    events: string[];
    auth?: {
        type: 'none' | 'basic' | 'bearer' | 'custom_header' | 'oauth2';
        hasCredentials?: boolean;
    };
    filters?: {
        severity?: string[];
        tags?: string[];
        projects?: string[];
        models?: string[];
        minCost?: number;
        customQuery?: Record<string, any>;
    };
    headers?: Record<string, string>;
    payloadTemplate?: string;
    useDefaultPayload: boolean;
    secret?: string;
    timeout: number;
    retryConfig?: {
        maxRetries: number;
        backoffMultiplier: number;
        initialDelay: number;
    };
    stats: {
        totalDeliveries: number;
        successfulDeliveries: number;
        failedDeliveries: number;
        lastDeliveryAt?: string;
        lastSuccessAt?: string;
        lastFailureAt?: string;
        averageResponseTime?: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IWebhookDelivery {
    id: string;
    webhookId: string;
    eventId: string;
    eventType: string;
    eventData: any;
    attempt: number;
    status: 'pending' | 'success' | 'failed' | 'timeout' | 'cancelled';
    request: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body: string;
        timestamp: string;
    };
    response?: {
        statusCode: number;
        headers: Record<string, string>;
        body: string;
        responseTime: number;
        timestamp: string;
    };
    error?: {
        type: string;
        message: string;
        code?: string;
        details?: any;
    };
    nextRetryAt?: string;
    retriesLeft?: number;
    signature?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookEvent {
    key: string;
    value: string;
    category: string;
    name: string;
}

export interface WebhookFormData {
    name: string;
    description?: string;
    url: string;
    active: boolean;
    events: string[];
    auth?: {
        type: 'none' | 'basic' | 'bearer' | 'custom_header' | 'oauth2';
        credentials?: {
            username?: string;
            password?: string;
            token?: string;
            headerName?: string;
            headerValue?: string;
            oauth2?: {
                clientId?: string;
                clientSecret?: string;
                tokenUrl?: string;
                scope?: string;
            };
        };
    };
    filters?: {
        severity?: string[];
        tags?: string[];
        projects?: string[];
        models?: string[];
        minCost?: number;
        customQuery?: Record<string, any>;
    };
    headers?: Record<string, string>;
    payloadTemplate?: string;
    useDefaultPayload: boolean;
    timeout: number;
    retryConfig: {
        maxRetries: number;
        backoffMultiplier: number;
        initialDelay: number;
    };
}

export interface WebhookQueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
}