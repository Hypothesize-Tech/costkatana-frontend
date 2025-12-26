import { useState, useEffect } from 'react';
import { experimentService } from '../services/experiment.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * React hook for A/B testing experiments
 */
export const useExperiment = (experimentName: string) => {
    const { user } = useAuth();
    const [variant, setVariant] = useState<'control' | 'variant_a' | 'variant_b'>('control');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            setIsLoading(true);
            const assignedVariant = experimentService.getVariant(experimentName, user.id);
            setVariant(assignedVariant);
            experimentService.trackExperimentViewed(experimentName, assignedVariant, { userId: user.id });
            setIsLoading(false);
        }
    }, [experimentName, user?.id]);

    const trackConversion = (value?: number, properties?: Record<string, any>) => {
        if (user?.id) {
            experimentService.trackExperimentConverted(
                experimentName,
                variant,
                value,
                { userId: user.id, ...properties }
            );
        }
    };

    const trackGoal = (goalName: string, properties?: Record<string, any>) => {
        if (user?.id) {
            experimentService.trackExperimentGoal(
                experimentName,
                variant,
                goalName,
                { userId: user.id, ...properties }
            );
        }
    };

    return {
        variant,
        isControl: variant === 'control',
        isVariantA: variant === 'variant_a',
        isVariantB: variant === 'variant_b',
        isLoading,
        trackConversion,
        trackGoal
    };
};

export default useExperiment;

