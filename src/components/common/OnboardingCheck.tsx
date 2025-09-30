import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Onboarding } from '../../pages/Onboarding';

interface OnboardingCheckProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children, fallback }) => {
    const { user } = useAuth();
    const { projects, isLoading: projectsLoading } = useProject();
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user needs onboarding based on their onboarding status and projects
        if (user && !projectsLoading) {
            // If user already has projects, skip onboarding regardless of onboarding status
            const hasProjects = projects && projects.length > 0;

            if (hasProjects) {
                setNeedsOnboarding(false);
                return;
            }

            // Ensure onboarding field exists and has proper structure
            if (!user.onboarding) {
                // Initialize onboarding field if it doesn't exist
                user.onboarding = {
                    completed: false,
                    projectCreated: false,
                    firstLlmCall: false,
                    stepsCompleted: []
                };
            }

            if (typeof user.onboarding.completed === 'boolean') {
                setNeedsOnboarding(!user.onboarding.completed);
            } else {
                // onboarding.completed is not a boolean - assume they need onboarding
                user.onboarding.completed = false;
                setNeedsOnboarding(true);
            }
        } else if (!user) {
            // No user - don't set onboarding status yet
            setNeedsOnboarding(null);
        }
    }, [user, projects, projectsLoading]);

    const handleOnboardingComplete = () => {
        setNeedsOnboarding(false);
        // Update user object to reflect completed onboarding
        if (user && user.onboarding) {
            user.onboarding.completed = true;
            user.onboarding.completedAt = new Date().toISOString();
            // Update localStorage to persist the change
            localStorage.setItem('user', JSON.stringify(user));
        }
    };

    if (needsOnboarding === null || (user && projectsLoading)) {
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
