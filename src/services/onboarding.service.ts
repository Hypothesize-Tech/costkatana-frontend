import { apiClient } from "@/config/api";

export interface OnboardingStatus {
  userId: string;
  currentStep: number;
  steps: Array<{
    id: string;
    name: string;
    completed: boolean;
    data?: any;
  }>;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  skipped?: boolean;
  skippedAt?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  budget?: {
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
    currency?: string;
  };
}

export interface LlmQueryData {
  query: string;
  model: string;
  projectId: string;
  userId: string;
}

export interface LlmResponse {
  content: string;
  model: string;
  tokens: number;
  cost: number;
}

export class OnboardingService {
  private static readonly BASE_URL = '/onboarding';

  /**
   * Get onboarding status
   */
  static async getOnboardingStatus(): Promise<OnboardingStatus | null> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return null;
    }
  }

  /**
   * Initialize onboarding
   */
  static async initializeOnboarding(): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/initialize`);
      return response.data.data;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding step
   */
  static async completeStep(stepId: string, data?: any): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/complete-step`, {
        stepId,
        data
      });
      return response.data.data;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  /**
   * Create project during onboarding
   */
  static async createProject(projectData: CreateProjectData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/create-project`, projectData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating project during onboarding:', error);
      throw error;
    }
  }

  /**
   * Execute LLM query during onboarding
   */
  static async executeLlmQuery(queryData: LlmQueryData): Promise<LlmResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/llm-query`, queryData);
      return response.data.data;
    } catch (error) {
      console.error('Error executing LLM query during onboarding:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding process
   */
  static async completeOnboarding(): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Skip onboarding process
   */
  static async skipOnboarding(): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/skip`);
      return response.data.data;
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      throw error;
    }
  }

  /**
   * Get available LLM models
   */
  static getAvailableModels(): Array<{ id: string; name: string; provider: string }> {
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    ];
  }
}
