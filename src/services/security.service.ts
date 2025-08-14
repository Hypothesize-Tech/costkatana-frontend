import { apiClient } from '../config/api';

interface SecurityMetricsParams {
  startDate?: string;
  endDate?: string;
}

interface SecurityTestParams {
  prompt: string;
  retrievedChunks?: string[];
  toolCalls?: any[];
  provenanceSource?: string;
}

interface HumanReviewDecision {
  decision: 'approved' | 'denied';
  comments?: string;
}

interface SecurityAnalytics {
  detectionRate: number;
  topRiskyPatterns: Array<{
    pattern: string;
    count: number;
    averageRiskScore: number;
  }>;
  topRiskySources: Array<{
    source: string;
    count: number;
    averageRiskScore: number;
  }>;
  threatDistribution: Record<string, number>;
  containmentActions: Record<string, number>;
  costSaved: number;
  timeRange: {
    start: string;
    end: string;
  };
}

interface SecurityMetrics {
  totalThreatsDetected: number;
  totalCostSaved: number;
  averageRiskScore: number;
  mostCommonThreat: string;
  detectionTrend: 'increasing' | 'decreasing' | 'stable';
}

interface HumanReviewRequest {
  id: string;
  requestId: string;
  threatResult: {
    threatCategory: string;
    confidence: number;
    riskScore: number;
    reason: string;
    containmentAction: string;
  };
  originalPrompt: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  createdAt: string;
  expiresAt: string;
}

interface FirewallConfig {
  enableBasicFirewall: boolean;
  enableAdvancedFirewall: boolean;
  enableRAGSecurity: boolean;
  enableToolSecurity: boolean;
  promptGuardThreshold: number;
  llamaGuardThreshold: number;
  ragSecurityThreshold: number;
  toolSecurityThreshold: number;
  sandboxHighRisk: boolean;
  requireHumanApproval: boolean;
}

class SecurityService {
  /**
   * Get security analytics
   */
  async getAnalytics(params: SecurityMetricsParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/security/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security analytics:', error);
      throw error;
    }
  }

  /**
   * Get security metrics summary
   */
  async getMetrics() {
    try {
      const response = await apiClient.get('/security/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }

  /**
   * Test security check
   */
  async testSecurityCheck(params: SecurityTestParams) {
    try {
      const response = await apiClient.post('/security/test', params);
      return response.data;
    } catch (error) {
      console.error('Error testing security check:', error);
      throw error;
    }
  }

  /**
   * Get pending human reviews
   */
  async getPendingReviews() {
    try {
      const response = await apiClient.get('/security/reviews/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }
  }

  /**
   * Submit human review decision
   */
  async reviewRequest(reviewId: string, decision: HumanReviewDecision) {
    try {
      const response = await apiClient.post(`/security/reviews/${reviewId}/decision`, decision);
      return response.data;
    } catch (error) {
      console.error('Error submitting review decision:', error);
      throw error;
    }
  }

  /**
   * Get firewall analytics
   */
  async getFirewallAnalytics(params: SecurityMetricsParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/security/firewall/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching firewall analytics:', error);
      throw error;
    }
  }

  /**
   * Get firewall configuration
   */
  async getFirewallConfig() {
    try {
      const response = await apiClient.get('/security/firewall/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching firewall config:', error);
      throw error;
    }
  }

  /**
   * Update firewall configuration
   */
  async updateFirewallConfig(config: FirewallConfig) {
    try {
      const response = await apiClient.put('/security/firewall/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating firewall config:', error);
      throw error;
    }
  }

  /**
   * Get top risky patterns
   */
  async getTopRiskyPatterns(limit: number = 20) {
    try {
      const response = await apiClient.get(`/security/risks/top-patterns?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top risky patterns:', error);
      throw error;
    }
  }

  /**
   * Export security report
   */
  async exportReport(format: 'json' | 'csv' = 'json', params: SecurityMetricsParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/security/reports/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting security report:', error);
      throw error;
    }
  }

  /**
   * Get threat categories for filtering
   */
  getThreatCategories() {
    return [
      { value: 'prompt_injection', label: 'Prompt Injection' },
      { value: 'jailbreak_attempt', label: 'Jailbreak Attempt' },
      { value: 'data_exfiltration', label: 'Data Exfiltration' },
      { value: 'unauthorized_tool_access', label: 'Unauthorized Tool Access' },
      { value: 'rag_security_violation', label: 'RAG Security Violation' },
      { value: 'context_manipulation', label: 'Context Manipulation' },
      { value: 'system_prompt_extraction', label: 'System Prompt Extraction' },
      { value: 'violence_and_hate', label: 'Violence & Hate' },
      { value: 'sexual_content', label: 'Sexual Content' },
      { value: 'criminal_planning', label: 'Criminal Planning' },
      { value: 'guns_and_illegal_weapons', label: 'Guns & Illegal Weapons' },
      { value: 'regulated_substances', label: 'Regulated Substances' },
      { value: 'self_harm', label: 'Self Harm' },
      { value: 'phishing_and_social_engineering', label: 'Phishing & Social Engineering' },
      { value: 'spam_and_unwanted_content', label: 'Spam & Unwanted Content' },
      { value: 'misinformation', label: 'Misinformation' },
      { value: 'privacy_violations', label: 'Privacy Violations' },
      { value: 'intellectual_property_violations', label: 'IP Violations' },
      { value: 'harassment_and_bullying', label: 'Harassment & Bullying' },
      { value: 'harmful_content', label: 'Harmful Content' }
    ];
  }

  /**
   * Get security stages for filtering
   */
  getSecurityStages() {
    return [
      { value: 'prompt-guard', label: 'Prompt Guard (Fast Detection)' },
      { value: 'llama-guard', label: 'Llama Guard (Deep Analysis)' },
      { value: 'rag-guard', label: 'RAG Guard (Context Security)' },
      { value: 'tool-guard', label: 'Tool Guard (Tool Validation)' },
      { value: 'output-guard', label: 'Output Guard (Response Filtering)' }
    ];
  }

  /**
   * Get containment actions
   */
  getContainmentActions() {
    return [
      { value: 'allow', label: 'Allow', color: 'text-green-600 bg-green-50' },
      { value: 'sandbox', label: 'Sandbox', color: 'text-yellow-600 bg-yellow-50' },
      { value: 'human_review', label: 'Human Review', color: 'text-blue-600 bg-blue-50' },
      { value: 'block', label: 'Block', color: 'text-red-600 bg-red-50' }
    ];
  }

  /**
   * Get risk score color coding
   */
  getRiskScoreColor(riskScore: number): string {
    if (riskScore >= 0.8) return 'text-red-600';
    if (riskScore >= 0.6) return 'text-orange-600';
    if (riskScore >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * Get threat category color coding
   */
  getThreatCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'prompt_injection': 'bg-red-100 text-red-800',
      'jailbreak_attempt': 'bg-red-100 text-red-800',
      'data_exfiltration': 'bg-orange-100 text-orange-800',
      'unauthorized_tool_access': 'bg-yellow-100 text-yellow-800',
      'rag_security_violation': 'bg-purple-100 text-purple-800',
      'context_manipulation': 'bg-pink-100 text-pink-800',
      'system_prompt_extraction': 'bg-indigo-100 text-indigo-800',
      'harmful_content': 'bg-gray-100 text-gray-800',
      'violence_and_hate': 'bg-red-100 text-red-800',
      'sexual_content': 'bg-purple-100 text-purple-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format threat category for display
   */
  formatThreatCategory(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Calculate detection rate
   */
  calculateDetectionRate(detected: number, total: number): number {
    return total > 0 ? (detected / total) * 100 : 0;
  }

  /**
   * Get default firewall configuration
   */
  getDefaultFirewallConfig(): FirewallConfig {
    return {
      enableBasicFirewall: true,
      enableAdvancedFirewall: false,
      enableRAGSecurity: true,
      enableToolSecurity: true,
      promptGuardThreshold: 0.5,
      llamaGuardThreshold: 0.8,
      ragSecurityThreshold: 0.6,
      toolSecurityThreshold: 0.7,
      sandboxHighRisk: true,
      requireHumanApproval: false
    };
  }
}

export const securityService = new SecurityService();
export type {
  SecurityAnalytics,
  SecurityMetrics,
  HumanReviewRequest,
  FirewallConfig,
  SecurityTestParams,
  HumanReviewDecision
};
