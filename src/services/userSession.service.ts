import { apiClient } from '../config/api';
import {
  UserSessionsResponse,
  RevokeSessionResponse,
  RevokeAllOtherSessionsResponse
} from '../types/userSession.types';

class UserSessionService {
  private baseURL = '/auth/user-sessions';

  /**
   * Get all active user sessions
   */
  async getActiveUserSessions(): Promise<UserSessionsResponse> {
    try {
      const response = await apiClient.get<UserSessionsResponse>(this.baseURL);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active user sessions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user sessions');
    }
  }

  /**
   * Revoke a specific user session
   */
  async revokeUserSession(userSessionId: string): Promise<RevokeSessionResponse> {
    try {
      const response = await apiClient.delete<RevokeSessionResponse>(
        `${this.baseURL}/${userSessionId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error revoking user session:', error);
      throw new Error(error.response?.data?.message || 'Failed to revoke session');
    }
  }

  /**
   * Revoke all other user sessions except current
   */
  async revokeAllOtherUserSessions(): Promise<RevokeAllOtherSessionsResponse> {
    try {
      const response = await apiClient.delete<RevokeAllOtherSessionsResponse>(
        `${this.baseURL}/others`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error revoking all other sessions:', error);
      throw new Error(error.response?.data?.message || 'Failed to revoke sessions');
    }
  }
}

export const userSessionService = new UserSessionService();

