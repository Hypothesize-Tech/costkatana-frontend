/**
 * Cost Intelligence Service
 * 
 * API service for interacting with the Cost Intelligence Stack
 */

import axios from 'axios';
import { CostIntelligence, CostIntelligenceStats, CostIntelligenceConfig, StreamingStats } from '../types/costIntelligence.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api`;

export class CostIntelligenceService {
  /**
   * Get recent cost intelligence insights
   */
  static async getInsights(params?: {
    userId?: string;
    workspaceId?: string;
    type?: string;
    severity?: string;
    limit?: number;
  }): Promise<CostIntelligence[]> {
    const response = await axios.get(`${API_BASE_URL}/cost-intelligence/insights`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data.insights;
  }

  /**
   * Get cost intelligence statistics
   */
  static async getStats(): Promise<CostIntelligenceStats> {
    const response = await axios.get(`${API_BASE_URL}/cost-intelligence/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Start continuous analysis
   */
  static async startAnalysis(): Promise<void> {
    await axios.post(`${API_BASE_URL}/cost-intelligence/analysis/start`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
  }

  /**
   * Stop continuous analysis
   */
  static async stopAnalysis(): Promise<void> {
    await axios.post(`${API_BASE_URL}/cost-intelligence/analysis/stop`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
  }

  /**
   * Get streaming statistics
   */
  static async getStreamingStats(): Promise<StreamingStats> {
    const response = await axios.get(`${API_BASE_URL}/cost-streaming/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Get configuration
   */
  static async getConfig(): Promise<CostIntelligenceConfig> {
    const response = await axios.get(`${API_BASE_URL}/cost-intelligence-config`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Update configuration
   */
  static async updateConfig(updates: Partial<CostIntelligenceConfig>): Promise<CostIntelligenceConfig> {
    const response = await axios.put(`${API_BASE_URL}/cost-intelligence-config`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Update specific layer configuration
   */
  static async updateLayerConfig(layer: string, updates: any): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/cost-intelligence-config/${layer}`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Reset configuration to defaults
   */
  static async resetConfig(): Promise<CostIntelligenceConfig> {
    const response = await axios.post(`${API_BASE_URL}/cost-intelligence-config/reset`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Validate configuration
   */
  static async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const response = await axios.get(`${API_BASE_URL}/cost-intelligence-config/actions/validate`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data;
  }

  /**
   * Check if a feature is enabled
   */
  static async isFeatureEnabled(layer: string, feature?: string): Promise<boolean> {
    const url = feature 
      ? `${API_BASE_URL}/cost-intelligence-config/feature/${layer}/${feature}`
      : `${API_BASE_URL}/cost-intelligence-config/feature/${layer}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data.data.enabled;
  }

  /**
   * Connect to cost telemetry stream
   */
  static connectToStream(
    onEvent: (event: any) => void,
    onError?: (error: Error) => void,
    filters?: {
      eventTypes?: string[];
      minCost?: number;
      operations?: string[];
    }
  ): EventSource {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();

    if (filters?.eventTypes) {
      params.append('eventTypes', filters.eventTypes.join(','));
    }
    if (filters?.minCost) {
      params.append('minCost', filters.minCost.toString());
    }
    if (filters?.operations) {
      params.append('operations', filters.operations.join(','));
    }

    // Include token as query param for authentication in SSE
    if (token) {
      params.append('token', token);
    }

    const url = `${API_BASE_URL}/cost-streaming/stream?${params.toString()}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) {
        onError(new Error('Stream connection failed'));
      }
    };

    return eventSource;
  }
}

