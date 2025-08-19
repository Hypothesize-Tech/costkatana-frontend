import api from '@/config/api';
import { AIProvider } from '../types';

export interface CostDebuggerAnalyzeRequest {
  prompt: string;
  provider: AIProvider;
  model: string;
  systemMessage?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  toolCalls?: Array<{ name: string; arguments: string }>;
  metadata?: Record<string, any>;
}

export interface DeadWeightAnalyzeRequest {
  prompt: string;
  provider: AIProvider;
  model: string;
}

export interface PromptComparisonRequest {
  originalPrompt: string;
  optimizedPrompt: string;
  provider: AIProvider;
  model: string;
}

export interface ProviderComparisonRequest {
  prompt: string;
  models: Array<{
    provider: string;
    model: string;
  }>;
}

class CostDebuggerService {
  async analyzePrompt(data: CostDebuggerAnalyzeRequest) {
    try {
      const response = await api.post('/cost-debugger/analyze', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      throw error;
    }
  }

  async detectDeadWeight(data: DeadWeightAnalyzeRequest) {
    try {
      const response = await api.post('/cost-debugger/dead-weight', data);
      return response.data;
    } catch (error) {
      console.error('Error detecting dead weight:', error);
      throw error;
    }
  }

  async comparePromptVersions(data: PromptComparisonRequest) {
    try {
      const response = await api.post('/cost-debugger/compare', data);
      return response.data;
    } catch (error) {
      console.error('Error comparing prompt versions:', error);
      throw error;
    }
  }

  async getPromptInsights(prompt: string, provider: AIProvider, model: string) {
    try {
      const response = await api.get('/cost-debugger/insights', {
        params: { prompt, provider, model }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting prompt insights:', error);
      throw error;
    }
  }

  async getProviderComparison(data: ProviderComparisonRequest) {
    try {
      const response = await api.post('/cost-debugger/provider-comparison', data);
      return response.data;
    } catch (error) {
      console.error('Error getting provider comparison:', error);
      throw error;
    }
  }
}

export const costDebuggerService = new CostDebuggerService();
