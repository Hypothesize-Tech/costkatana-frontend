import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingService } from '../../services/billing.service';
import { apiClient } from '../../config/api';
import { detectUserCountry } from '../../services/geolocation.service';
import { getPaymentMethodsByCountry } from '../../utils/paymentMethods.config';
import { SubscriptionSuccessModal } from './SubscriptionSuccessModal';

interface RazorpayPaymentFormProps {
    amount: number;
    currency?: string;
    plan: string;
    billingInterval: 'monthly' | 'yearly';
    discountCode?: string;
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
    discountCode,
    onSuccess,
    onError,
    disabled = false,
}) => {
    const { showNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(true);
    const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<{ currency: string; convertedAmount?: number } | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<{ amount: number; currency: string } | null>(null);
    const razorpayLoaded = useRef(false);

    useEffect(() => {
        const loadRazorpayConfig = async () => {
            try {
                // Detect user's country
                const country = await detectUserCountry();
                setUserCountry(country);

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
            // Get payment methods based on user's country
            const paymentMethods = getPaymentMethodsByCountry(userCountry);

            // Create order on backend
            const orderResponse = await apiClient.post('/user/subscription/create-razorpay-order', {
                plan,
                billingInterval,
                amount,
                currency,
                country: userCountry, // Pass country to backend
                discountCode: discountCode || undefined, // Pass discount code if available
            });

            const { orderId, keyId: orderKeyId, currency: orderCurrency, convertedAmount } = orderResponse.data.data;

            // Store order data for display
            setOrderData({
                currency: orderCurrency,
                convertedAmount: convertedAmount,
            });

            // Initialize Razorpay checkout with country-specific payment methods
            // Razorpay method configuration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/checkout-options/
            const options: any = {
                key: orderKeyId || razorpayKeyId,
                amount: orderResponse.data.data.amount, // Amount in paise/cents
                currency: orderCurrency,
                name: 'Cost Katana',
                description: `Subscription: ${plan} (${billingInterval})`,
                order_id: orderId,
                // Configure payment methods based on country
                // For India: show all methods, for others: show only cards
                method: paymentMethods.length > 1
                    ? {
                        // For India: enable all payment methods
                        netbanking: paymentMethods.includes('netbanking'),
                        wallet: paymentMethods.includes('wallet'),
                        upi: paymentMethods.includes('upi'),
                        card: paymentMethods.includes('card'),
                        emi: paymentMethods.includes('emi'),
                    }
                    : {
                        // For non-India: only cards
                        card: true,
                    },
                handler: async (response: any) => {
                    try {
                        // Verify and confirm payment on backend
                        await apiClient.post('/user/subscription/confirm-razorpay-payment', {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            plan,
                            billingInterval,
                            discountCode: discountCode || undefined,
                        });

                        // Show success modal with confetti
                        const finalAmount = orderData?.convertedAmount || amount;
                        const finalCurrency = orderData?.currency || currency;
                        setSuccessData({
                            amount: finalAmount,
                            currency: finalCurrency,
                        });
                        setShowSuccessModal(true);

                        // Call onSuccess after a short delay to allow modal to show
                        setTimeout(() => {
                            onSuccess();
                        }, 100);
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
                                {orderData?.currency === 'INR' && orderData?.convertedAmount
                                    ? `₹${orderData.convertedAmount.toFixed(2)}`
                                    : `$${amount.toFixed(2)}`
                                }
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
                {isProcessing
                    ? 'Processing...'
                    : orderData?.currency === 'INR' && orderData?.convertedAmount
                        ? `Pay ₹${orderData.convertedAmount.toFixed(2)}`
                        : `Pay $${amount.toFixed(2)}`
                }
            </button>

            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
                Your payment information is secure and encrypted
            </p>

            {/* Success Modal */}
            {successData && (
                <SubscriptionSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        setSuccessData(null);
                    }}
                    plan={plan}
                    billingInterval={billingInterval}
                    amount={successData.amount}
                    currency={successData.currency}
                />
            )}
        </div>
    );
};

