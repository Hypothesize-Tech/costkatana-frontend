import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingService } from '../../services/billing.service';
import { apiClient } from '../../config/api';
import { detectUserCountry } from '../../services/geolocation.service';
import { getPaymentMethodsByCountry } from '../../utils/paymentMethods.config';

interface RazorpayPaymentMethodFormProps {
    setAsDefault: boolean;
    onSuccess: () => void;
    onError?: (error: any) => void;
    onCancel?: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const RazorpayPaymentMethodForm: React.FC<RazorpayPaymentMethodFormProps> = ({
    setAsDefault,
    onSuccess,
    onError,
    onCancel,
}) => {
    const { showNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(true);
    const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userCountry, setUserCountry] = useState<string | null>(null);
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

    const handleAddPaymentMethod = async () => {
        if (!razorpayKeyId || !window.Razorpay || isProcessing) {
            return;
        }

        setIsProcessing(true);
        try {
            // Get payment methods based on user's country
            const paymentMethods = getPaymentMethodsByCountry(userCountry);

            // Create a minimal order for payment method collection
            // Razorpay requires minimum 1.00 in base currency (1 USD or 1 INR)
            const minimalAmount = userCountry === 'IN' ? 1.00 : 1.00; // $1.00 or ₹1.00
            const currency = userCountry === 'IN' ? 'INR' : 'USD';

            const orderResponse = await apiClient.post('/billing/payment-methods/razorpay/create-order', {
                amount: minimalAmount,
                currency,
            });

            const { orderId, keyId: orderKeyId, currency: orderCurrency, amount: orderAmount } = orderResponse.data.data;

            // Initialize Razorpay checkout
            const options: any = {
                key: orderKeyId || razorpayKeyId,
                amount: orderAmount, // Amount in paise/cents
                currency: orderCurrency,
                name: 'Cost Katana',
                description: 'Add Payment Method',
                order_id: orderId,
                // Configure payment methods based on country
                method: paymentMethods.length > 1
                    ? {
                        netbanking: paymentMethods.includes('netbanking'),
                        wallet: paymentMethods.includes('wallet'),
                        upi: paymentMethods.includes('upi'),
                        card: paymentMethods.includes('card'),
                        emi: paymentMethods.includes('emi'),
                    }
                    : {
                        card: true,
                    },
                handler: async (response: any) => {
                    try {
                        // Save payment method on backend
                        await BillingService.saveRazorpayPaymentMethod(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature,
                            setAsDefault
                        );

                        showNotification('Payment method added successfully', 'success');
                        onSuccess();
                    } catch (error: any) {
                        console.error('Error saving payment method:', error);
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to save payment method';
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
                    color: '#06ec9e', // Primary color
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
            console.error('Error initiating payment method collection:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment method collection';
            showNotification(errorMessage, 'error');
            onError?.(error);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="spinner" />
                <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Loading Razorpay...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="card p-3 sm:p-4 md:p-5 lg:p-6">
                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-light-text dark:text-dark-text mb-2 sm:mb-3 md:mb-4">
                    Add Payment Method
                </h4>
                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3 sm:mb-4 md:mb-5">
                    Click the button below to securely add a payment method through Razorpay.
                    A minimal charge may be required to verify your payment method.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="btn-outline flex-1 text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleAddPaymentMethod}
                        disabled={!razorpayKeyId || !window.Razorpay || isProcessing}
                        className="btn btn-primary flex-1 text-sm sm:text-base"
                    >
                        {isProcessing ? 'Processing...' : 'Add Payment Method'}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    Your payment information is secure and encrypted
                </p>
            </div>
        </div>
    );
};

