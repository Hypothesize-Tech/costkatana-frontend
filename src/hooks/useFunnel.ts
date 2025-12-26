import { useCallback } from 'react';
import { funnelService, FunnelService } from '../services/funnel.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * React hook for tracking conversion funnels
 */
export const useFunnel = () => {
    const { user } = useAuth();

    const trackStep = useCallback((
        funnelName: keyof typeof FunnelService.FUNNELS,
        stepName: string,
        properties?: Record<string, any>
    ) => {
        funnelService.trackFunnelStep(funnelName, stepName, {
            userId: user?.id,
            ...properties
        });
    }, [user?.id]);

    const trackCompletion = useCallback((
        funnelName: keyof typeof FunnelService.FUNNELS,
        properties?: Record<string, any>
    ) => {
        const completionTime = user?.id
            ? funnelService.getFunnelCompletionTime(user.id, funnelName)
            : null;

        funnelService.trackFunnelCompletion(funnelName, {
            userId: user?.id,
            completion_time_seconds: completionTime,
            ...properties
        });

        // Clear funnel progress after completion
        if (user?.id) {
            funnelService.clearFunnelProgress(user.id, funnelName);
        }
    }, [user?.id]);

    const trackDropoff = useCallback((
        funnelName: keyof typeof FunnelService.FUNNELS,
        stepName: string,
        reason?: string,
        properties?: Record<string, any>
    ) => {
        funnelService.trackFunnelDropoff(funnelName, stepName, reason, {
            userId: user?.id,
            ...properties
        });
    }, [user?.id]);

    const getProgress = useCallback((
        funnelName: keyof typeof FunnelService.FUNNELS
    ): string[] => {
        return user?.id ? funnelService.getFunnelProgress(user.id, funnelName) : [];
    }, [user?.id]);

    return {
        trackStep,
        trackCompletion,
        trackDropoff,
        getProgress,
        funnels: FunnelService.FUNNELS
    };
};

export default useFunnel;

