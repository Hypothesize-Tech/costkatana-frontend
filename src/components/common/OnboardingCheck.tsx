import React, { useState, useEffect, useCallback } from 'react';
import { OnboardingService } from '../../services/onboarding.service';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Onboarding } from '../../pages/Onboarding';

interface OnboardingCheckProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children, fallback }) => {
    const { user } = useAuth();
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkOnboarding();
    }, [user]);

    const handleOnboardingComplete = () => {
        setNeedsOnboarding(false);
    };

    const checkOnboarding = useCallback(async () => {
        if (user?.id) {
            try {
                const status = await OnboardingService.getOnboardingStatus();
                // If onboarding status doesn't exist or is not completed, user needs onboarding
                setNeedsOnboarding(!status || !status.completed);
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                // Default to showing onboarding if there's an error
                setNeedsOnboarding(true);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        checkOnboarding();
    }, [checkOnboarding]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-medium text-secondary-600 dark:text-secondary-300">
                        Checking setup status...
                    </p>
                </div>
            </div>
        );
    }

    if (needsOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return <>{children || fallback}</>;
};
