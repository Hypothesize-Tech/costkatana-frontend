import React, { useEffect, useRef, useState } from 'react';
import { loadScript } from '@paypal/paypal-js';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingService } from '../../services/billing.service';

interface PayPalButtonProps {
    amount: number;
    currency?: string;
    plan: string;
    billingInterval: 'monthly' | 'yearly';
    discountCode?: string;
    onSuccess: (subscriptionId: string) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
    amount,
    currency = 'USD',
    plan,
    billingInterval,
    discountCode,
    onSuccess,
    onError,
    disabled = false,
}) => {
    const { showNotification } = useNotifications();
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<any>(null);
    const isMountedRef = useRef(true);
    const isInitializingRef = useRef(false);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasInitializedRef = useRef(false);
    const lastInitParamsRef = useRef<string>('');

    // Store callbacks in refs to prevent re-initialization
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    // Update refs when callbacks change
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    }, [onSuccess, onError]);

    const configLoadedRef = useRef(false);

    // Load PayPal config only once on mount
    useEffect(() => {
        // Prevent multiple calls
        if (configLoadedRef.current || paypalClientId) {
            return;
        }

        let isMounted = true;

        const loadPayPalConfig = async () => {
            try {
                configLoadedRef.current = true;
                setLoading(true);
                setError(null);
                console.log('Starting to load PayPal config from backend...');

                // Add timeout to prevent infinite loading
                const configPromise = BillingService.getPaymentConfig();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('PayPal configuration request timed out after 10 seconds')), 10000);
                });

                // Get PayPal client ID from backend with timeout
                const config = await Promise.race([configPromise, timeoutPromise]) as any;
                console.log('PayPal config received:', config);

                if (!isMounted) {
                    console.warn('Component unmounted during config load, cleaning up...');
                    setLoading(false);
                    return;
                }

                if (config.paypal?.clientId) {
                    console.log('PayPal client ID found:', config.paypal.clientId);
                    setPaypalClientId(config.paypal.clientId);
                } else {
                    console.warn('PayPal client ID not found in config:', config);
                    const errorMsg = 'PayPal is not configured on the server. Please ensure PAYPAL_CLIENT_ID is set in the backend environment variables.';
                    setError(errorMsg);
                    if (isMounted) {
                        showNotification('PayPal is not configured', 'error');
                        onErrorRef.current?.(new Error('PayPal client ID not found'));
                    }
                }
            } catch (error: any) {
                if (!isMounted) {
                    return;
                }
                console.error('Error loading PayPal config:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                const errorMsg = error.response?.data?.message || 'Failed to load PayPal configuration. Please try again or use another payment method.';
                setError(errorMsg);
                showNotification('Failed to load PayPal configuration', 'error');
                onErrorRef.current?.(error);
                // Reset flag on error to allow retry
                configLoadedRef.current = false;
            } finally {
                if (isMounted) {
                    console.log('Setting loading to false in finally block');
                    setLoading(false);
                    console.log('Loading set to false');
                }
            }
        };

        loadPayPalConfig();

        return () => {
            isMounted = false;
            // Reset the flag so if component remounts, it can retry
            // This handles React StrictMode double-mounting in dev
            configLoadedRef.current = false;
        };
        // Only run once on mount, or if paypalClientId changes from null to a value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Set mounted to true on mount
        isMountedRef.current = true;

        // Cleanup on unmount
        return () => {
            isMountedRef.current = false;
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (buttonsRef.current) {
                try {
                    buttonsRef.current.close();
                } catch (e) {
                    // Ignore cleanup errors - component may already be destroyed
                }
                buttonsRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // Create a key from props that affect PayPal initialization
        const initKey = `${paypalClientId}-${currency}-${plan}-${billingInterval}-${amount}`;

        // If the key changed, allow re-initialization
        if (lastInitParamsRef.current !== initKey && lastInitParamsRef.current !== '') {
            hasInitializedRef.current = false;
            setPaypalLoaded(false);
            if (buttonsRef.current) {
                try {
                    buttonsRef.current.close();
                } catch (e) {
                    // Ignore cleanup errors
                }
                buttonsRef.current = null;
            }
        }

        // Prevent re-initialization if already initialized with same params or currently initializing
        if (!paypalClientId || paypalLoaded || disabled || isInitializingRef.current || (hasInitializedRef.current && lastInitParamsRef.current === initKey)) {
            return;
        }

        // Wait for the container to be available
        const checkAndInitialize = (retryCount = 0) => {
            console.log('checkAndInitialize called', { retryCount, hasContainer: !!buttonContainerRef.current });

            // Max 20 retries (2 seconds)
            if (retryCount > 20) {
                console.error('PayPal initialization timeout - container not found after 20 retries');
                if (isMountedRef.current) {
                    const errorMsg = 'PayPal initialization timeout. Container not available. Please refresh the page.';
                    setError(errorMsg);
                    showNotification('PayPal initialization timeout', 'error');
                    isInitializingRef.current = false;
                }
                return;
            }

            if (!isMountedRef.current) {
                console.warn('Component unmounted during initialization check');
                return;
            }

            if (!buttonContainerRef.current) {
                console.log(`Container not ready, retrying... (${retryCount + 1}/20)`);
                // Retry after a short delay if container is not ready
                retryTimeoutRef.current = setTimeout(() => {
                    checkAndInitialize(retryCount + 1);
                }, 100);
                return;
            }

            console.log('Container is ready, proceeding with initialization');

            // Mark as initializing to prevent multiple calls
            isInitializingRef.current = true;
            hasInitializedRef.current = true;
            lastInitParamsRef.current = initKey;

            const initializePayPal = async () => {
                try {
                    console.log('Starting PayPal initialization...', {
                        hasContainer: !!buttonContainerRef.current,
                        clientId: paypalClientId,
                        currency,
                    });

                    if (!isMountedRef.current || !buttonContainerRef.current) {
                        console.warn('Container not ready or component unmounted');
                        return;
                    }

                    // Check if PayPal SDK is already loaded
                    let paypal = (window as any).paypal;

                    if (!paypal) {
                        console.log('Loading PayPal SDK...');

                        const loadScriptPromise = loadScript({
                            clientId: paypalClientId,
                            vault: true,
                            intent: 'subscription',
                            currency: currency,
                        });

                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('PayPal SDK load timeout after 10 seconds')), 10000);
                        });

                        try {
                            paypal = await Promise.race([loadScriptPromise, timeoutPromise]) as any;
                        } catch (error) {
                            console.error('PayPal SDK load failed:', error);
                            throw error;
                        }

                        // If loadScript returns null, check window.paypal again
                        if (!paypal) {
                            console.log('loadScript returned null, checking window.paypal...');
                            paypal = (window as any).paypal;
                        }
                    } else {
                        console.log('PayPal SDK already loaded from window.paypal');
                    }

                    console.log('PayPal SDK loaded:', !!paypal, 'Has Buttons:', !!paypal?.Buttons);

                    if (!isMountedRef.current || !buttonContainerRef.current) {
                        console.warn('Component unmounted or container removed during SDK load');
                        return;
                    }

                    // Clear any existing buttons
                    if (buttonsRef.current) {
                        try {
                            buttonsRef.current.close();
                        } catch (e) {
                            console.log('Error closing existing button:', e);
                        }
                        buttonsRef.current = null;
                    }

                    if (!paypal || !paypal.Buttons) {
                        throw new Error('PayPal SDK not loaded correctly - Buttons API not available');
                    }

                    if (!isMountedRef.current || !buttonContainerRef.current) {
                        console.warn('Component unmounted or container removed before button creation');
                        return;
                    }

                    console.log('Creating PayPal button...');

                    buttonsRef.current = paypal.Buttons({
                        style: {
                            layout: 'vertical',
                            color: 'blue',
                            shape: 'rect',
                            label: 'subscribe',
                        },
                        createSubscription: async (_data: any, _actions: any) => {
                            try {
                                // Backend creates a PayPal billing plan and returns the plan ID
                                // The frontend SDK uses this plan ID to create the subscription when user approves
                                const { apiClient } = await import('../../config/api');
                                const response = await apiClient.post('/user/subscription/create-paypal-plan', {
                                    discountCode: discountCode || undefined,
                                    plan,
                                    billingInterval,
                                    amount,
                                    currency,
                                });

                                const result = response.data;
                                const subscriptionId = result.data?.subscriptionId;

                                if (!subscriptionId) {
                                    throw new Error('Subscription ID not returned from server');
                                }

                                // Return subscription ID to PayPal SDK
                                // PayPal SDK will use this ID to show the approval flow for the created subscription
                                return subscriptionId;
                            } catch (error: any) {
                                console.error('Error creating PayPal subscription plan:', error);
                                if (isMountedRef.current) {
                                    showNotification(error.message || 'Failed to create subscription plan', 'error');
                                    onErrorRef.current?.(error);
                                }
                                throw error;
                            }
                        },
                        onApprove: async (data: any, _actions: any) => {
                            try {
                                // Subscription approved - send to backend to complete upgrade
                                const { apiClient } = await import('../../config/api');
                                await apiClient.post('/user/subscription/approve-paypal', {
                                    subscriptionId: data.subscriptionID,
                                    plan,
                                    billingInterval,
                                });

                                if (isMountedRef.current) {
                                    showNotification('PayPal subscription approved! Processing...', 'success');
                                    onSuccessRef.current(data.subscriptionID);
                                }
                            } catch (error: any) {
                                console.error('Error processing PayPal approval:', error);
                                if (isMountedRef.current) {
                                    const errorMessage = error.response?.data?.message || error.message || 'Failed to process subscription approval';
                                    showNotification(errorMessage, 'error');
                                    onErrorRef.current?.(error);
                                }
                            }
                        },
                        onError: (err: any) => {
                            console.error('PayPal button error:', err);
                            if (isMountedRef.current) {
                                // Check if it's the zoid destroyed error
                                if (err?.message?.includes('zoid destroyed')) {
                                    console.warn('PayPal component was destroyed, this is usually safe to ignore');
                                    return;
                                }
                                showNotification('PayPal payment error occurred', 'error');
                                onErrorRef.current?.(err);
                            }
                        },
                        onCancel: () => {
                            if (isMountedRef.current) {
                                showNotification('PayPal subscription cancelled', 'info');
                            }
                        },
                    });

                    if (!isMountedRef.current || !buttonContainerRef.current) {
                        return;
                    }

                    console.log('Rendering PayPal button to container...');

                    // Add timeout for button rendering
                    const renderTimeout = setTimeout(() => {
                        if (!paypalLoaded && isMountedRef.current) {
                            console.error('PayPal button render timeout after 15 seconds');
                            const timeoutError = new Error('PayPal button rendering timed out. Please refresh and try again.');
                            setError(timeoutError.message);
                            showNotification('PayPal initialization timeout', 'error');
                            onErrorRef.current?.(timeoutError);
                            isInitializingRef.current = false;
                        }
                    }, 15000);

                    try {
                        await buttonsRef.current.render(buttonContainerRef.current);
                        clearTimeout(renderTimeout);
                        console.log('PayPal button rendered successfully');

                        if (isMountedRef.current) {
                            setPaypalLoaded(true);
                            setError(null);
                            isInitializingRef.current = false;
                            console.log('PayPal initialization complete');
                        }
                    } catch (renderError: any) {
                        clearTimeout(renderTimeout);
                        console.error('PayPal button render failed:', renderError);
                        throw renderError;
                    }
                } catch (error: any) {
                    console.error('Error initializing PayPal:', error);
                    console.error('Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                        isMounted: isMountedRef.current,
                        hasContainer: !!buttonContainerRef.current,
                    });

                    if (isMountedRef.current) {
                        // Check if it's the zoid destroyed error
                        if (error?.message?.includes('zoid destroyed')) {
                            console.warn('PayPal component was destroyed during initialization, retrying...');
                            isInitializingRef.current = false;
                            hasInitializedRef.current = false; // Allow retry
                            lastInitParamsRef.current = ''; // Reset to allow retry
                            // Retry after a delay
                            setTimeout(() => {
                                if (isMountedRef.current && !paypalLoaded && paypalClientId) {
                                    checkAndInitialize(0);
                                }
                            }, 500);
                            return;
                        }
                        const errorMsg = error.message || 'Failed to initialize PayPal. Please try again or use another payment method.';
                        setError(errorMsg);
                        showNotification(`Failed to load PayPal: ${errorMsg}`, 'error');
                        onErrorRef.current?.(error);
                        isInitializingRef.current = false;
                        hasInitializedRef.current = false; // Allow retry on error
                        lastInitParamsRef.current = ''; // Reset to allow retry
                    }
                }
            };

            initializePayPal();
        };

        // Start checking for container availability
        checkAndInitialize();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            // Reset initialization flags to allow retry on remount (React StrictMode)
            isInitializingRef.current = false;
            hasInitializedRef.current = false;
            lastInitParamsRef.current = '';
        };
        // Only re-run if paypalClientId or relevant payment params change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paypalClientId, currency, plan, billingInterval, amount, disabled]);

    // Always render the container so ref is available
    return (
        <div className="w-full relative">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 space-y-2 sm:space-y-3 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm rounded-lg z-10">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Loading PayPal...
                    </span>
                </div>
            )}

            {error && !loading && (
                <div className="p-4 sm:p-5 md:p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                PayPal Payment Unavailable
                            </h4>
                            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {disabled && !loading && !error && (
                <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                    PayPal payment is currently unavailable
                </div>
            )}

            {/* Always render the container so ref is available for PayPal initialization */}
            <div
                ref={buttonContainerRef}
                className={`paypal-button-container ${!paypalLoaded && paypalClientId && !loading && !error ? 'min-h-[200px] flex items-center justify-center' : 'min-h-[50px]'}`}
            >
                {!paypalLoaded && paypalClientId && !loading && !error && !disabled && (
                    <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            Initializing PayPal...
                        </span>
                    </div>
                )}
            </div>

            {!paypalLoaded && paypalClientId && !loading && !error && (
                <div className="mt-2 text-xs text-center text-light-text-tertiary dark:text-dark-text-tertiary px-2">
                    If the PayPal button doesn't appear, please refresh the page or try another payment method.
                </div>
            )}
        </div>
    );
};

