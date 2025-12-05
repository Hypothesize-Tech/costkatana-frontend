import React, { useEffect, useState } from 'react';
import { loadStripe as loadStripeSDK, StripeElementsOptions } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { useNotifications } from '../../contexts/NotificationContext';
import { BillingService } from '../../services/billing.service';
import { apiClient } from '../../config/api';

interface StripePaymentFormProps {
    amount: number;
    currency?: string;
    plan: string;
    billingInterval: 'monthly' | 'yearly';
    onSuccess: () => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

const StripeCardForm: React.FC<{
    amount: number;
    currency: string;
    plan: string;
    billingInterval: 'monthly' | 'yearly';
    onSuccess: () => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}> = ({ amount, plan, billingInterval, onSuccess, onError, disabled }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { showNotification } = useNotifications();
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const createSetupIntent = async () => {
            try {
                const response = await apiClient.post('/user/subscription/create-stripe-setup-intent');
                setClientSecret(response.data.data.clientSecret);
                setIsLoading(false);
            } catch (error: any) {
                console.error('Error creating setup intent:', error);
                showNotification('Failed to initialize payment form', 'error');
                onError?.(error);
                setIsLoading(false);
            }
        };

        createSetupIntent();
    }, [showNotification, onError]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret || disabled) {
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Confirm setup intent with card details
            const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (confirmError) {
                throw confirmError;
            }

            if (!setupIntent || !setupIntent.payment_method) {
                throw new Error('Payment method not created');
            }

            // Confirm payment and create subscription
            await apiClient.post('/user/subscription/confirm-stripe-payment', {
                setupIntentId: setupIntent.id,
                paymentMethodId: setupIntent.payment_method,
                plan,
                billingInterval,
            });

            showNotification('Payment successful! Subscription upgraded.', 'success');
            onSuccess();
        } catch (error: any) {
            console.error('Error processing payment:', error);
            const errorMessage = error.message || error.response?.data?.message || 'Payment failed';
            showNotification(errorMessage, 'error');
            onError?.(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="spinner" />
                <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">
                    Loading payment form...
                </span>
            </div>
        );
    }

    if (disabled) {
        return (
            <div className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                Stripe payment is currently unavailable
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="card p-3 sm:p-4 md:p-5">
                <label className="block mb-2 text-xs sm:text-sm font-semibold text-light-text dark:text-dark-text">
                    Card Information
                </label>
                <div className="p-2.5 sm:p-3 md:p-4 border border-primary-200/30 dark:border-primary-800/30 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="btn btn-primary flex-1 text-sm sm:text-base"
                >
                    {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>

            <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    Your payment information is secure and encrypted
                </p>
            </div>
        </form>
    );
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
    amount,
    currency = 'USD',
    plan,
    billingInterval,
    onSuccess,
    onError,
    disabled = false,
}) => {
    const { showNotification } = useNotifications();
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        const loadStripeConfig = async () => {
            try {
                const config = await BillingService.getPaymentConfig();
                if (config.stripe?.publishableKey) {
                    const stripe = await loadStripeSDK(config.stripe.publishableKey);
                    setStripePromise(Promise.resolve(stripe));
                    setStripeLoaded(true);
                } else {
                    showNotification('Stripe is not configured', 'error');
                    onError?.(new Error('Stripe publishable key not found'));
                }
            } catch (error: any) {
                console.error('Error loading Stripe config:', error);
                showNotification('Failed to load Stripe configuration', 'error');
                onError?.(error);
            }
        };

        loadStripeConfig();
    }, [showNotification, onError]);

    if (!stripeLoaded || !stripePromise) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="spinner" />
                <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">
                    Loading Stripe...
                </span>
            </div>
        );
    }

    const elementsOptions: StripeElementsOptions = {
        appearance: {
            theme: 'stripe',
        },
        currency: currency.toLowerCase(),
    };

    return (
        <Elements stripe={stripePromise} options={elementsOptions}>
            <StripeCardForm
                amount={amount}
                currency={currency}
                plan={plan}
                billingInterval={billingInterval}
                onSuccess={onSuccess}
                onError={onError}
                disabled={disabled}
            />
        </Elements>
    );
};

