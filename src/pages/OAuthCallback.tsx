import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { authService } from "../services/auth.service";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { refreshAuth } = useAuth();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Parse OAuth callback parameters
                const params = new URLSearchParams(window.location.search);
                const accessToken = params.get('accessToken') || undefined;
                const refreshToken = params.get('refreshToken') || undefined;
                const isNewUser = params.get('isNewUser') === 'true';
                const error = params.get('error') || undefined;
                const lastLoginMethod = params.get('lastLoginMethod') as 'email' | 'google' | 'github' | null;

                // MFA parameters
                const requiresMFA = params.get('requiresMFA') === 'true';
                const mfaToken = params.get('mfaToken') || undefined;
                const userId = params.get('userId') || undefined;
                const availableMethods = params.get('availableMethods')?.split(',') as Array<'email' | 'totp'> || undefined;

                // Check for errors
                if (error) {
                    setStatus('error');
                    setErrorMessage(error);
                    showNotification(error, "error");

                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                    return;
                }

                // Check if MFA is required
                if (requiresMFA && mfaToken && userId && availableMethods) {
                    // Redirect to login page with MFA data
                    localStorage.setItem('oauthMfaRequired', 'true');
                    localStorage.setItem('oauthMfaToken', mfaToken);
                    localStorage.setItem('oauthUserId', userId);
                    localStorage.setItem('oauthAvailableMethods', JSON.stringify(availableMethods));

                    // Store last login method if provided
                    if (lastLoginMethod) {
                        localStorage.setItem('lastLoginMethod', lastLoginMethod);
                    }

                    showNotification("MFA verification required", "info");
                    navigate("/login");
                    return;
                }

                // Validate tokens
                if (!accessToken || !refreshToken) {
                    setStatus('error');
                    setErrorMessage("Missing authentication tokens");
                    showNotification("Authentication failed. Please try again.", "error");

                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                    return;
                }

                // Store tokens
                authService.setTokens(accessToken, refreshToken);

                // Fetch user data
                try {
                    const userResponse = await authService.getCurrentUser();
                    if (userResponse && userResponse.data) {
                        const user = userResponse.data;

                        // Store user in localStorage (must be done before refreshAuth)
                        authService.setUser(user);

                        // Store last login method (prefer URL param, fallback to user data)
                        const loginMethod = lastLoginMethod || user.lastLoginMethod;
                        if (loginMethod) {
                            localStorage.setItem('lastLoginMethod', loginMethod);
                        }

                        // Refresh AuthContext to update React state (critical for app to recognize user as logged in)
                        await refreshAuth();

                        setStatus('success');

                        // Show success notification
                        if (isNewUser) {
                            showNotification("Account created successfully! Welcome to Cost Katana!", "success");
                        } else {
                            showNotification("Successfully signed in!", "success");
                        }

                        // Redirect to dashboard
                        setTimeout(() => {
                            navigate("/dashboard", { replace: true });
                        }, 1000);
                    } else {
                        throw new Error("Failed to fetch user data");
                    }
                } catch (fetchError: unknown) {
                    console.error("Failed to fetch user data:", fetchError);
                    setStatus('error');
                    setErrorMessage("Failed to complete authentication");
                    showNotification("Authentication incomplete. Please try again.", "error");

                    // Clear tokens
                    authService.clearTokens();

                    setTimeout(() => {
                        navigate("/login", { replace: true });
                    }, 3000);
                }
            } catch (error: unknown) {
                console.error("OAuth callback error:", error);
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
                showNotification("Authentication failed. Please try again.", "error");

                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            }
        };

        handleOAuthCallback();
    }, [navigate, showNotification, refreshAuth]);

    return (
        <div className="flex overflow-hidden relative flex-1 justify-center items-center min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Ambient glow effects */}
            <div className="overflow-hidden absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary-500/8" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse bg-success-500/8" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 px-4 w-full max-w-md">
                <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    {/* Logo and Title */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center items-center mb-4">
                            <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-primary">
                                <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold font-display gradient-text-primary">
                            {APP_NAME}
                        </h1>
                    </div>

                    {/* Status Content */}
                    <div className="text-center">
                        {status === 'processing' && (
                            <div className="space-y-4">
                                <LoadingSpinner />
                                <div>
                                    <h2 className="mb-2 text-xl font-semibold font-display text-secondary-900 dark:text-white">
                                        Completing Sign In
                                    </h2>
                                    <p className="text-secondary-600 dark:text-secondary-300">
                                        Please wait while we authenticate your account...
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="flex justify-center items-center w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30">
                                        <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-2 text-xl font-semibold font-display text-secondary-900 dark:text-white">
                                        Success!
                                    </h2>
                                    <p className="text-secondary-600 dark:text-secondary-300">
                                        Redirecting to your dashboard...
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="flex justify-center items-center w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30">
                                        <svg className="w-8 h-8 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-2 text-xl font-semibold font-display text-secondary-900 dark:text-white">
                                        Authentication Failed
                                    </h2>
                                    <p className="mb-4 text-secondary-600 dark:text-secondary-300">
                                        {errorMessage || "Something went wrong. Please try again."}
                                    </p>
                                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                        Redirecting to login page...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

