export type IntegrationType = 
    | 'slack_webhook' 
    | 'slack_oauth' 
    | 'discord_webhook' 
    | 'discord_oauth' 
    | 'linear_oauth'
    | 'jira_oauth'
    | 'custom_webhook';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';

export type AlertType = 
    | 'cost_threshold' 
    | 'usage_spike' 
    | 'optimization_available' 
    | 'weekly_summary' 
    | 'monthly_summary' 
    | 'error_rate' 
    | 'cost' 
    | 'optimization' 
    | 'anomaly' 
    | 'system';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertRoutingRule {
    enabled: boolean;
    severities: AlertSeverity[];
    template?: string;
    customMessage?: string;
}

export interface IntegrationCredentials {
    webhookUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    botToken?: string;
    channelId?: string;
    channelName?: string;
    guildId?: string;
    guildName?: string;
    teamId?: string;
    teamName?: string;
    projectId?: string;
    issueId?: string;
    scope?: string;
    siteUrl?: string;
    cloudId?: string; 
    projectKey?: string;
    issueTypeId?: string;
    priorityId?: string;
    labels?: string[];
    components?: Array<{ id: string; name?: string }>;
    issueKey?: string;
}

export interface DeliveryConfig {
    retryEnabled: boolean;
    maxRetries: number;
    timeout: number;
    batchDelay?: number;
}

export interface IntegrationStats {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDeliveryAt?: string;
    lastSuccessAt?: string;
    lastFailureAt?: string;
    averageResponseTime: number;
    successRate?: number;
    healthStatus?: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck?: string;
    totalNotifications?: number;
}

export interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    description?: string;
    status: IntegrationStatus;
    alertRouting: Record<AlertType, AlertRoutingRule>;
    deliveryConfig: DeliveryConfig;
    stats: IntegrationStats;
    healthCheckStatus?: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck?: string;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
    credentials?: IntegrationCredentials;
    metadata?: Record<string, any>;
    isActive?: boolean;
}

export interface CreateIntegrationDto {
    type: IntegrationType;
    name: string;
    description?: string;
    credentials: IntegrationCredentials;
    alertRouting?: Record<string, AlertRoutingRule>;
    deliveryConfig?: Partial<DeliveryConfig>;
    metadata?: Record<string, any>;
}

export interface UpdateIntegrationDto {
    name?: string;
    description?: string;
    status?: IntegrationStatus;
    credentials?: IntegrationCredentials;
    alertRouting?: Record<string, AlertRoutingRule>;
    deliveryConfig?: Partial<DeliveryConfig>;
}

export interface DeliveryLog {
    alertId: string;
    alertType: AlertType;
    alertTitle: string;
    alertSeverity: AlertSeverity;
    integrationId: string;
    status: 'pending' | 'sent' | 'failed' | 'retrying';
    sentAt?: string;
    responseTime?: number;
    attempts: number;
    lastError?: string;
    createdAt: string;
}

export interface SlackChannel {
    id: string;
    name: string;
    is_private: boolean;
    is_archived: boolean;
}

export interface DiscordGuild {
    id: string;
    name: string;
    icon?: string;
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: number;
}

export interface LinearTeam {
    id: string;
    name: string;
    key: string;
    description?: string;
}

export interface LinearProject {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

export interface JiraProject {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    simplified?: boolean;
    avatarUrls?: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
    };
}

export interface JiraIssueType {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    subtask: boolean;
}

export interface JiraPriority {
    id: string;
    name: string;
    iconUrl?: string;
}

export interface JiraComponent {
    id: string;
    name: string;
    description?: string;
}

export interface JiraIssue {
    id: string;
    key: string;
    self: string;
    fields: {
        summary: string;
        description?: string;
        status: {
            id: string;
            name: string;
        };
        priority?: JiraPriority;
        project: JiraProject;
        issuetype: JiraIssueType;
    };
}

export interface CreateJiraIssueDto {
    title: string;
    description?: string;
    projectKey: string;
    issueTypeId: string;
    priorityId?: string;
    labels?: string[];
    components?: Array<{ id: string }>;
}

export interface UpdateJiraIssueDto {
    summary?: string;
    description?: string;
    priorityId?: string;
    labels?: string[];
}

// Slack Block Kit Types
export interface SlackBlock {
    type: string;
    [key: string]: any;
}

export interface SlackMessage {
    text: string;
    blocks?: SlackBlock[];
    attachments?: any[];
}

// Discord Embed Types
export interface DiscordEmbed {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    footer?: {
        text: string;
        icon_url?: string;
    };
    timestamp?: string;
    thumbnail?: {
        url: string;
    };
    image?: {
        url: string;
    };
}

export interface DiscordMessage {
    content?: string;
    embeds?: DiscordEmbed[];
    components?: any[];
}

// API Response Types
export interface IntegrationResponse {
    success: boolean;
    message?: string;
    data?: Integration;
}

export interface IntegrationsListResponse {
    success: boolean;
    data: Integration[];
    count: number;
}

export interface TestIntegrationResponse {
    success: boolean;
    message: string;
    data?: {
        responseTime: number;
    };
}

export interface DeliveryLogsResponse {
    success: boolean;
    data: DeliveryLog[];
    count: number;
}

export interface IntegrationStatsResponse {
    success: boolean;
    data: IntegrationStats;
}

