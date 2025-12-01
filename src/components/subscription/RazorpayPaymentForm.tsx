import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingService } from '../../services/billing.service';
import { apiClient } from '../../config/api';

interface RazorpayPaymentFormProps {
    amount: number;
    currency?: string;
    plan: string;
    billingInterval: 'monthly' | 'yearly';
    onSuccess: () => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const RazorpayPaymentForm: React.FC<RazorpayPaymentFormProps> = ({
    amount,
    currency = 'USD',
    plan,
    billingInterval,
    onSuccess,
    onError,
    disabled = false,
}) => {
    const { showNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(true);
    const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const razorpayLoaded = useRef(false);

    useEffect(() => {
        const loadRazorpayConfig = async () => {
            try {
                const config = await BillingService.getPaymentConfig();
                if (config.razorpay?.keyId) {
                    setRazorpayKeyId(config.razorpay.keyId);
                } else {
                    showNotification('Razorpay is not configured', 'error');
                    onError?.(new Error('Razorpay key ID not found'));
                    setIsLoading(false);
                    return;
                }

                // Load Razorpay checkout script
                if (!razorpayLoaded.current && !window.Razorpay) {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    script.onload = () => {
                        razorpayLoaded.current = true;
                        setIsLoading(false);
                    };
                    script.onerror = () => {
                        showNotification('Failed to load Razorpay', 'error');
                        onError?.(new Error('Failed to load Razorpay checkout script'));
                        setIsLoading(false);
                    };
                    document.body.appendChild(script);
                } else {
                    setIsLoading(false);
                }
            } catch (error: any) {
                console.error('Error loading Razorpay config:', error);
                showNotification('Failed to load Razorpay configuration', 'error');
                onError?.(error);
                setIsLoading(false);
            }
        };
        loadRazorpayConfig();
    }, [showNotification, onError]);

    const handlePayment = async () => {
        if (!razorpayKeyId || !window.Razorpay || disabled || isProcessing) {
            return;
        }

        setIsProcessing(true);
        try {
            // Create order on backend
            const orderResponse = await apiClient.post('/user/subscription/create-razorpay-order', {
                plan,
                billingInterval,
                amount,
                currency,
            });

            const { orderId, keyId: orderKeyId } = orderResponse.data.data;

            // Initialize Razorpay checkout
            const options = {
                key: orderKeyId || razorpayKeyId,
                amount: orderResponse.data.data.amount, // Amount in paise
                currency: orderResponse.data.data.currency,
                name: 'Cost Katana',
                description: `Subscription: ${plan} (${billingInterval})`,
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        // Verify and confirm payment on backend
                        await apiClient.post('/user/subscription/confirm-razorpay-payment', {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            plan,
                            billingInterval,
                        });

                        showNotification('Payment successful! Subscription upgraded.', 'success');
                        onSuccess();
                    } catch (error: any) {
                        console.error('Error confirming payment:', error);
                        const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
                        showNotification(errorMessage, 'error');
                        onError?.(error);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: '', // Can be filled from user profile if available
                    email: '', // Can be filled from user profile if available
                    contact: '', // Can be filled from user profile if available
                },
                theme: {
                    color: '#6366f1', // Primary color
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', (response: any) => {
                console.error('Payment failed:', response);
                const errorMessage = response.error?.description || 'Payment failed';
                showNotification(errorMessage, 'error');
                onError?.(new Error(errorMessage));
                setIsProcessing(false);
            });
            razorpay.open();
        } catch (error: any) {
            console.error('Error initiating payment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
            showNotification(errorMessage, 'error');
            onError?.(error);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="spinner" />
                <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">
                    Loading Razorpay...
                </span>
            </div>
        );
    }

    if (disabled) {
        return (
            <div className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                Razorpay payment is currently unavailable
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="card p-4">
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                        Payment Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                Plan:
                            </span>
                            <span className="font-semibold text-light-text dark:text-dark-text capitalize">
                                {plan}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                Billing:
                            </span>
                            <span className="font-semibold text-light-text dark:text-dark-text capitalize">
                                {billingInterval}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-primary-200/20 dark:border-primary-800/20">
                            <span className="text-lg font-semibold text-light-text dark:text-dark-text">
                                Total:
                            </span>
                            <span className="text-xl font-bold text-primary-500">
                                ${amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-4">
                    Click the button below to complete your payment securely through Razorpay
                </p>
            </div>

            <button
                onClick={handlePayment}
                disabled={!razorpayKeyId || !window.Razorpay || isProcessing}
                className="btn btn-primary w-full"
            >
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>

            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
                Your payment information is secure and encrypted
            </p>
        </div>
    );
};

