// src/services/auth.service.ts
import api from '@/config/api';
import { User, LoginCredentials, RegisterData } from '@/types';
import { ApiResponse } from '@/types';

class AuthService {
    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'user';

    async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
        const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', credentials);
        const { data } = response.data;
        if (!data) {
            throw new Error('Invalid login response: missing data');
        }
        this.setTokens(data.accessToken, data.refreshToken);
        this.setUser(data.user);
        return response.data;
    }

    async register(userData: RegisterData): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>('/auth/register', userData);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            this.clearAuth();
        }
    }

    async refreshToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
            refreshToken,
        });

        const { data } = response.data;
        if (!data) {
            throw new Error('Invalid refresh token response: missing data');
        }
        this.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    }

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    }

    async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
        const response = await api.get(`/auth/verify-email/${token}`);
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

    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    private setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private clearAuth(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

export const authService = new AuthService();