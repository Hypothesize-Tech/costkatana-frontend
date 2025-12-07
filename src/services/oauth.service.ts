import { apiClient } from "@/config/api";

export interface OAuthProvider {
  provider: 'google' | 'github';
  email: string;
  linkedAt: string;
}

export interface LinkedProvidersResponse {
  providers: OAuthProvider[];
  hasPassword: boolean;
}

class OAuthServiceClass {
  /**
   * Initiate OAuth login flow
   */
  async initiateOAuth(provider: 'google' | 'github'): Promise<string> {
    try {
      const response = await apiClient.get(`/auth/oauth/${provider}`);
      
      if (response.data.success && response.data.data?.authUrl) {
        return response.data.data.authUrl;
      }
      
      throw new Error('Invalid OAuth response');
    } catch (error: any) {
      console.error(`Failed to initiate ${provider} OAuth:`, error);
      throw error;
    }
  }

  /**
   * Link OAuth provider to existing account
   */
  async linkOAuthProvider(provider: 'google' | 'github'): Promise<string> {
    try {
      const response = await apiClient.post(`/auth/oauth/${provider}/link`);
      
      if (response.data.success && response.data.data?.authUrl) {
        return response.data.data.authUrl;
      }
      
      throw new Error('Invalid OAuth linking response');
    } catch (error: any) {
      console.error(`Failed to link ${provider} OAuth:`, error);
      throw error;
    }
  }

  /**
   * Get linked OAuth providers for current user
   */
  async getLinkedProviders(): Promise<LinkedProvidersResponse> {
    try {
      const response = await apiClient.get('/auth/oauth/linked');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch linked providers');
    } catch (error: any) {
      console.error('Failed to get linked providers:', error);
      throw error;
    }
  }

  /**
   * Unlink OAuth provider from account
   */
  async unlinkOAuthProvider(provider: 'google' | 'github'): Promise<void> {
    try {
      const response = await apiClient.delete(`/auth/oauth/${provider}/unlink`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to unlink provider');
      }
    } catch (error: any) {
      console.error(`Failed to unlink ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Parse OAuth callback parameters from URL
   */
  parseOAuthCallback(): {
    accessToken?: string;
    refreshToken?: string;
    isNewUser?: boolean;
    error?: string;
  } {
    const params = new URLSearchParams(window.location.search);
    
    return {
      accessToken: params.get('accessToken') || undefined,
      refreshToken: params.get('refreshToken') || undefined,
      isNewUser: params.get('isNewUser') === 'true',
      error: params.get('error') || undefined,
    };
  }
}

export const oauthService = new OAuthServiceClass();

