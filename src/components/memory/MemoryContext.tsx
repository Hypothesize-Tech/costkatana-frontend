import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryService, MemoryInsight, UserPreference } from '@/services/memory.service';

interface MemoryContextType {
    insights: MemoryInsight[];
    preferences: UserPreference | null;
    preferenceSummary: string;
    personalizedRecommendations: string[];
    isLoading: boolean;
    error: string | null;
    refreshMemory: () => Promise<void>;
    getRecommendationsForQuery: (query: string) => Promise<string[]>;
    updatePreferences: (updates: Partial<UserPreference>) => Promise<void>;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const useMemory = (): MemoryContextType => {
    const context = useContext(MemoryContext);
    if (!context) {
        throw new Error('useMemory must be used within a MemoryProvider');
    }
    return context;
};

interface MemoryProviderProps {
    children: ReactNode;
}

export const MemoryProvider: React.FC<MemoryProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [insights, setInsights] = useState<MemoryInsight[]>([]);
    const [preferences, setPreferences] = useState<UserPreference | null>(null);
    const [preferenceSummary, setPreferenceSummary] = useState<string>('');
    const [personalizedRecommendations, setPersonalizedRecommendations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshMemory = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            setError(null);

            const [insightsData, preferencesData] = await Promise.all([
                MemoryService.getMemoryInsights(user.id),
                MemoryService.getUserPreferences(user.id)
            ]);

            setInsights(insightsData);
            setPreferences(preferencesData.preferences);
            setPreferenceSummary(preferencesData.summary);
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to refresh memory:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getRecommendationsForQuery = async (query: string): Promise<string[]> => {
        if (!user) return [];

        try {
            const recommendations = await MemoryService.getPersonalizedRecommendations(user.id, query);
            setPersonalizedRecommendations(recommendations);
            return recommendations;
        } catch (err: any) {
            console.error('Failed to get recommendations:', err);
            return [];
        }
    };

    const updatePreferences = async (updates: Partial<UserPreference>) => {
        if (!user) return;

        try {
            const updatedPreferences = await MemoryService.updateUserPreferences(user.id, updates);
            setPreferences(updatedPreferences);

            // Refresh summary
            const preferencesData = await MemoryService.getUserPreferences(user.id);
            setPreferenceSummary(preferencesData.summary);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Load memory data when user changes
    useEffect(() => {
        if (user) {
            refreshMemory();
        } else {
            // Clear memory data when user logs out
            setInsights([]);
            setPreferences(null);
            setPreferenceSummary('');
            setPersonalizedRecommendations([]);
        }
    }, [user]);

    const value: MemoryContextType = {
        insights,
        preferences,
        preferenceSummary,
        personalizedRecommendations,
        isLoading,
        error,
        refreshMemory,
        getRecommendationsForQuery,
        updatePreferences
    };

    return (
        <MemoryContext.Provider value={value}>
            {children}
        </MemoryContext.Provider>
    );
};