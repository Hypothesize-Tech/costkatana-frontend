import { apiClient } from '../config/api';

interface ModerationAnalyticsParams {
  startDate?: string;
  endDate?: string;
  includeInputModeration?: boolean;
  includeOutputModeration?: boolean;
}

interface ModerationThreatsParams {
  page?: number;
  limit?: number;
  category?: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ModerationConfig {
  inputModeration: {
    enableBasicFirewall: boolean;
    enableAdvancedFirewall: boolean;
    promptGuardThreshold: number;
    openaiSafeguardThreshold: number;
  };
  outputModeration: {
    enableOutputModeration: boolean;
    toxicityThreshold: number;
    enablePIIDetection: boolean;
    enableToxicityCheck: boolean;
    enableHateSpeechCheck: boolean;
    enableSexualContentCheck: boolean;
    enableViolenceCheck: boolean;
    enableSelfHarmCheck: boolean;
    action: 'allow' | 'annotate' | 'redact' | 'block';
  };
  piiDetection: {
    enablePIIDetection: boolean;
    useAI: boolean;
    sanitizationEnabled: boolean;
  };
}

interface AppealRequest {
  threatId: string;
  reason: string;
  additionalContext?: string;
}

class ModerationService {
  /**
   * Get comprehensive moderation analytics
   */
  async getAnalytics(params: ModerationAnalyticsParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.includeInputModeration !== undefined) {
        queryParams.append('includeInputModeration', params.includeInputModeration.toString());
      }
      if (params.includeOutputModeration !== undefined) {
        queryParams.append('includeOutputModeration', params.includeOutputModeration.toString());
      }

      const response = await apiClient.get(`/moderation/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation analytics:', error);
      throw error;
    }
  }

  /**
   * Get moderation threat logs
   */
  async getThreats(params: ModerationThreatsParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.stage) queryParams.append('stage', params.stage);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/moderation/threats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation threats:', error);
      throw error;
    }
  }

  /**
   * Get moderation configuration
   */
  async getConfig() {
    try {
      const response = await apiClient.get('/moderation/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation config:', error);
      throw error;
    }
  }

  /**
   * Update moderation configuration
   */
  async updateConfig(config: ModerationConfig) {
    try {
      const response = await apiClient.put('/moderation/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating moderation config:', error);
      throw error;
    }
  }

  /**
   * Submit an appeal for a moderation decision
   */
  async appealDecision(appeal: AppealRequest) {
    try {
      const response = await apiClient.post('/moderation/appeal', appeal);
      return response.data;
    } catch (error) {
      console.error('Error submitting moderation appeal:', error);
      throw error;
    }
  }

  /**
   * Get threat categories for filtering
   */
  getThreatCategories() {
    return [
      { value: 'violence_and_hate', label: 'Violence & Hate' },
      { value: 'sexual_content', label: 'Sexual Content' },
      { value: 'self_harm', label: 'Self Harm' },
      { value: 'prompt_injection', label: 'Prompt Injection' },
      { value: 'jailbreak_attempt', label: 'Jailbreak Attempt' },
      { value: 'privacy_violations', label: 'Privacy Violations' },
      { value: 'harmful_content', label: 'Harmful Content' },
      { value: 'criminal_planning', label: 'Criminal Planning' },
      { value: 'guns_and_illegal_weapons', label: 'Guns & Illegal Weapons' },
      { value: 'regulated_substances', label: 'Regulated Substances' },
      { value: 'data_exfiltration', label: 'Data Exfiltration' },
      { value: 'phishing_and_social_engineering', label: 'Phishing & Social Engineering' },
      { value: 'spam_and_unwanted_content', label: 'Spam & Unwanted Content' },
      { value: 'misinformation', label: 'Misinformation' },
      { value: 'intellectual_property_violations', label: 'IP Violations' },
      { value: 'harassment_and_bullying', label: 'Harassment & Bullying' },
    ];
  }

  /**
   * Get moderation stages for filtering
   */
  getModerationStages() {
    return [
      { value: 'prompt-guard', label: 'Prompt Guard (Fast Detection)' },
      { value: 'openai-safeguard', label: 'OpenAI Safeguard (Deep Analysis)' },
      { value: 'output-guard', label: 'Output Guard (Response Filtering)' },
    ];
  }

  /**
   * Get threat level color coding
   */
  getThreatLevelColor(level: string): string {
    const colors = {
      'low': 'text-green-600 bg-green-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'high': 'text-red-600 bg-red-50',
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Get action type color coding
   */
  getActionTypeColor(action: string): string {
    const colors = {
      'allow': 'text-green-600 bg-green-50',
      'annotate': 'text-blue-600 bg-blue-50',
      'redact': 'text-yellow-600 bg-yellow-50',
      'block': 'text-red-600 bg-red-50',
    };
    return colors[action as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Calculate block rate
   */
  calculateBlockRate(total: number, blocked: number): number {
    return total > 0 ? (blocked / total) * 100 : 0;
  }

  /**
   * Format threat category for display
   */
  formatThreatCategory(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get default moderation configuration
   */
  getDefaultConfig(): ModerationConfig {
    return {
      inputModeration: {
        enableBasicFirewall: true,
        enableAdvancedFirewall: true,
        promptGuardThreshold: 0.7,
        openaiSafeguardThreshold: 0.7,
      },
      outputModeration: {
        enableOutputModeration: false, // Disabled by default
        toxicityThreshold: 0.7,
        enablePIIDetection: true,
        enableToxicityCheck: true,
        enableHateSpeechCheck: true,
        enableSexualContentCheck: true,
        enableViolenceCheck: true,
        enableSelfHarmCheck: true,
        action: 'block',
      },
      piiDetection: {
        enablePIIDetection: true,
        useAI: true,
        sanitizationEnabled: true,
      },
    };
  }
}

export const moderationService = new ModerationService();
export type { ModerationConfig, AppealRequest };
