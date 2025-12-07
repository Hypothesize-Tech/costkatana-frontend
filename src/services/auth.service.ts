
import { apiClient } from "@/config/api";
import { User, LoginCredentials, RegisterData } from "@/types";
import { ApiResponse } from "@/types";

class AuthService {
  private readonly TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_KEY = "user";

  async login(
    credentials: LoginCredentials,
  ): Promise<
    ApiResponse<{ 
      user: User; 
      accessToken: string; 
      refreshToken: string;
      requiresMFA?: boolean;
      mfaToken?: string;
      userId?: string;
      availableMethods?: Array<'email' | 'totp'>;
    }>
  > {
    const response = await apiClient.post<
      ApiResponse<{ 
        user: User; 
        accessToken: string; 
        refreshToken: string;
        requiresMFA?: boolean;
        mfaToken?: string;
        userId?: string;
        availableMethods?: Array<'email' | 'totp'>;
      }>
    >("/auth/login", credentials);
    const { data } = response.data;
    if (!data) {
      throw new Error("Invalid login response: missing data");
    }
    
    // Only set tokens and user if MFA is not required
    if (!data.requiresMFA) {
      this.setTokens(data.accessToken, data.refreshToken);
      this.setUser(data.user);
    }
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/register",
      userData,
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Set refresh token as cookie for the request
    document.cookie = `refreshToken=${refreshToken}; path=/; secure=${window.location.protocol === 'https:'}; samesite=strict`;

    const response = await apiClient.post<
      ApiResponse<{ accessToken: string }>
    >("/auth/refresh", {});

    const { data } = response.data;
    if (!data) {
      throw new Error("Invalid refresh token response: missing data");
    }
    
    // Update access token (refresh token is handled by backend via cookie)
    this.setTokens(data.accessToken, refreshToken);
    return data.accessToken;
  }

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    
    // Also set refresh token as cookie for backend compatibility
    document.cookie = `refreshToken=${refreshToken}; path=/; secure=${window.location.protocol === 'https:'}; samesite=strict; max-age=${30 * 24 * 60 * 60}`;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearTokens(): void {
    this.clearAuth();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>("/user/profile");
    return response.data;
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear refresh token cookie
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export const authService = new AuthService();
