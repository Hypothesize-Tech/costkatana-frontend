import api from '../config/api';

class TrackerService {
    async getAnalytics(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<any> {
        const response = await api.get('/tracker/analytics', { params });
        return response.data;
    }

    async getOptimizationSuggestions(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<any> {
        const response = await api.get('/tracker/suggestions', { params });
        return response.data;
    }

    async syncHistoricalData(days: number = 30): Promise<{ success: boolean; message: string }> {
        const response = await api.post('/tracker/sync', { days });
        return response.data;
    }
}

export const trackerService = new TrackerService();