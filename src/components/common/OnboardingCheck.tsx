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
    const { user } = useAuth();
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

        // Skip if already checked in this session
        if (hasCheckedRef.current) {
            return;
        }

        // Wait for user and projects to load
        if (!user || projectsLoading) {
            return;
        }

        // Check sessionStorage first - if we've already determined onboarding status this session, use it
        const cachedCheck = sessionStorage.getItem(`${ONBOARDING_CHECK_KEY}_${user.id}`);
        if (cachedCheck) {
            const cachedValue = cachedCheck === 'true';
            setNeedsOnboarding(cachedValue);
            hasCheckedRef.current = true;
            return;
        }

        // Fast path: Check if onboarding is completed or skipped in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // If onboarding is completed or skipped, no need for further checks
                if (parsedUser.onboarding?.completed || parsedUser.onboarding?.skipped) {
                    setNeedsOnboarding(false);
                    sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
                    hasCheckedRef.current = true;
                    return;
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
            }
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
        // Ensure onboarding field exists and has proper structure
        if (!user.onboarding) {
            user.onboarding = {
                completed: false,
                projectCreated: false,
                firstLlmCall: false,
                stepsCompleted: []
            };
        }

        // Check onboarding status
        const isCompleted = user.onboarding.completed === true;
        const isSkipped = user.onboarding.skipped === true;

        if (!isCompleted && !isSkipped) {
            setNeedsOnboarding(true);
            sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'true');
        } else {
            setNeedsOnboarding(false);
            sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
        }

        hasCheckedRef.current = true;
    }, [user, projects, projectsLoading]);

    const handleOnboardingComplete = () => {
        setNeedsOnboarding(false);
        // Update user object and localStorage
        if (user) {
            if (!user.onboarding) {
                user.onboarding = {
                    completed: false,
                    projectCreated: false,
                    firstLlmCall: false,
                    stepsCompleted: []
                };
            }
            user.onboarding.completed = true;
            user.onboarding.completedAt = new Date().toISOString();
            // Update localStorage and sessionStorage
            localStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem(`${ONBOARDING_CHECK_KEY}_${user.id}`, 'false');
            hasCheckedRef.current = true;
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
