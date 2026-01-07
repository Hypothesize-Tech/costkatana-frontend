import { apiClient } from '../config/api';

export interface MongoDBConnection {
    _id: string;
    userId: string;
    alias: string;
    connectionString: string;
    metadata?: {
        host?: string;
        port?: number;
        database?: string;
        username?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MongoDBContext {
    connectionId: string;
    database?: string;
    collection?: string;
    lastCommand?: string;
}

class MongoDBService {
    async listConnections(): Promise<MongoDBConnection[]> {
        try {
            const response = await apiClient.get('/mcp/mongodb/connections');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch MongoDB connections:', error);
            throw error;
        }
    }

    async getConnection(connectionId: string): Promise<MongoDBConnection> {
        try {
            const response = await apiClient.get(`/mcp/mongodb/connections/${connectionId}`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch MongoDB connection:', error);
            throw error;
        }
    }

    async createConnection(data: {
        alias: string;
        connectionString: string;
        database?: string;
    }): Promise<MongoDBConnection> {
        try {
            const response = await apiClient.post('/mcp/mongodb/connections', data);
            return response.data.data;
        } catch (error) {
            console.error('Failed to create MongoDB connection:', error);
            throw error;
        }
    }

    async updateConnection(
        connectionId: string,
        data: Partial<Pick<MongoDBConnection, 'alias' | 'connectionString' | 'isActive'>>
    ): Promise<MongoDBConnection> {
        try {
            const response = await apiClient.put(`/mcp/mongodb/connections/${connectionId}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Failed to update MongoDB connection:', error);
            throw error;
        }
    }

    async deleteConnection(connectionId: string): Promise<void> {
        try {
            await apiClient.delete(`/mcp/mongodb/connections/${connectionId}`);
        } catch (error) {
            console.error('Failed to delete MongoDB connection:', error);
            throw error;
        }
    }

    async testConnection(connectionString: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post('/mcp/mongodb/test-connection', { connectionString });
            return response.data;
        } catch (error) {
            console.error('Failed to test MongoDB connection:', error);
            throw error;
        }
    }

    async hasActiveConnection(): Promise<boolean> {
        try {
            const connections = await this.listConnections();
            return connections.some(conn => conn.isActive);
        } catch (error) {
            return false;
        }
    }
}

export const mongodbService = new MongoDBService();
export default mongodbService;
