import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Onboarding } from '../../pages/Onboarding';

interface OnboardingCheckProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const ONBOARDING_CHECK_KEY = 'onboarding_check_completed';

export const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children, fallback }) => {
    const { user, updateUser } = useAuth();
    const { projects, isLoading: projectsLoading } = useProject();
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
    const hasCheckedRef = useRef(false);
    const lastUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Reset check when user changes (e.g., logout/login)
        if (user?.id !== lastUserIdRef.current) {
            hasCheckedRef.current = false;
            lastUserIdRef.current = user?.id || null;
            setNeedsOnboarding(null);
        }

        // Wait for user and projects to load
        if (!user || projectsLoading) {
            return;
        }

        // Always check localStorage first to get the most up-to-date onboarding status
        // This ensures we pick up changes even if AuthContext hasn't refreshed yet
        const storedUser = localStorage.getItem('user');
        let onboardingStatus: { completed?: boolean; skipped?: boolean } | null = null;

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Only trust localStorage if the user ID matches
                if (parsedUser.id === user.id) {
                    onboardingStatus = parsedUser.onboarding || null;
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
            }
        }

        // Check sessionStorage - but only trust it if it matches current user ID
        const cachedCheck = sessionStorage.getItem(`${ONBOARDING_CHECK_KEY}_${user.id}`);
        if (cachedCheck && hasCheckedRef.current) {
            const cachedValue = cachedCheck === 'true';
            // Double-check with localStorage to ensure consistency
            if (onboardingStatus?.completed || onboardingStatus?.skipped) {
                setNeedsOnboarding(false);
                sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
                return;
            }
            setNeedsOnboarding(cachedValue);
            return;
        }

        // Fast path: Check if onboarding is completed or skipped
        const isCompleted = onboardingStatus?.completed === true || user.onboarding?.completed === true;
        const isSkipped = onboardingStatus?.skipped === true || user.onboarding?.skipped === true;

        if (isCompleted || isSkipped) {
            setNeedsOnboarding(false);
            sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
            hasCheckedRef.current = true;
            return;
        }

        // Check if user has projects - if yes, skip onboarding
        const hasProjects = projects && Array.isArray(projects) && projects.length > 0;
        if (hasProjects) {
            setNeedsOnboarding(false);
            sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
            hasCheckedRef.current = true;
            return;
        }

        // No projects and onboarding not completed/skipped - show onboarding
        setNeedsOnboarding(true);
        sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'true');
        hasCheckedRef.current = true;
    }, [user, user?.onboarding?.completed, user?.onboarding?.skipped, projects, projectsLoading]);

    const handleOnboardingComplete = () => {
        // Read the latest onboarding status from localStorage
        // This handles both completion and skip cases
        const storedUser = localStorage.getItem('user');
        if (storedUser && user) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Only update if user ID matches
                if (parsedUser.id === user.id && (parsedUser.onboarding?.completed || parsedUser.onboarding?.skipped)) {
                    // Update AuthContext state to sync with localStorage
                    updateUser(parsedUser);
                    // Update sessionStorage
                    sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
                    // Set needsOnboarding to false
                    setNeedsOnboarding(false);
                    // Reset check ref to allow re-evaluation if needed
                    hasCheckedRef.current = false;
                }
            } catch (error) {
                console.error('Error parsing stored user in handleOnboardingComplete:', error);
            }
        }
    };

    // Show loading only on initial check
    if (needsOnboarding === null) {
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
