import { API_BASE_URL } from '../config/api';

export interface UserPreferences {
    emailAlerts: boolean;
    alertThreshold: number;
    optimizationSuggestions: boolean;
    enableSessionReplay?: boolean;
    sessionReplayTimeout?: number;
}

export class UserPreferencesService {
    private static token = localStorage.getItem('access_token');

    static async getPreferences(): Promise<UserPreferences> {
        const response = await fetch(`${API_BASE_URL}/user/preferences`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch preferences');
        }

        const data = await response.json();
        return data.data.preferences;
    }

    static async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
        const response = await fetch(`${API_BASE_URL}/user/preferences`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });

        if (!response.ok) {
            throw new Error('Failed to update preferences');
        }

        const data = await response.json();
        return data.data.preferences;
    }

    static async enableSessionReplay(enabled: boolean, timeout?: number): Promise<void> {
        await this.updatePreferences({
            enableSessionReplay: enabled,
            ...(timeout !== undefined && { sessionReplayTimeout: timeout })
        });
    }

    static async getSessionReplayStatus(): Promise<{ enabled: boolean; timeout: number }> {
        const preferences = await this.getPreferences();
        return {
            enabled: preferences.enableSessionReplay || false,
            timeout: preferences.sessionReplayTimeout || 30
        };
    }
}

