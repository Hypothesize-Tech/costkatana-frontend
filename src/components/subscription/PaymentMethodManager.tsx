import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '../../services/billing.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { CreditCardIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import stripeLogo from '../../assets/stripe-logo.png';
import paypalLogo from '../../assets/paypal-logo.webp';
import razorpayLogo from '../../assets/razorpay-logo.png';

export const PaymentMethodManager: React.FC = () => {
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [showAddForm, setShowAddForm] = useState(false);

    const { data: paymentMethods, isLoading } = useQuery(
        ['payment-methods'],
        () => BillingService.getPaymentMethods()
    );

    const removeMutation = useMutation(
        (id: string) => BillingService.removePaymentMethod(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['payment-methods']);
                showNotification('Payment method removed successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to remove payment method', 'error');
            },
        }
    );

    const handleRemove = (id: string) => {
        if (window.confirm('Are you sure you want to remove this payment method?')) {
            removeMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                    Payment Methods
                </h2>
                <button onClick={() => setShowAddForm(true)} className="btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Payment Method
                </button>
            </div>

            {!paymentMethods || paymentMethods.length === 0 ? (
                <div className="card p-12 text-center">
                    <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        No payment methods added
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        Add Payment Method
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => {
                        const getLogo = () => {
                            switch (method.paymentGateway?.toLowerCase()) {
                                case 'stripe':
                                    return stripeLogo;
                                case 'paypal':
                                    return paypalLogo;
                                case 'razorpay':
                                    return razorpayLogo;
                                default:
                                    return null;
                            }
                        };

                        const logo = getLogo();

                        return (
                            <div key={method.id} className="card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {logo ? (
                                            <img
                                                src={logo}
                                                alt={method.paymentGateway}
                                                className="h-10 w-auto object-contain rounded-lg"
                                            />
                                        ) : (
                                            <CreditCardIcon className="w-8 h-8 text-primary-500" />
                                        )}
                                        <div>
                                            <div className="font-semibold text-light-text dark:text-dark-text capitalize">
                                                {method.paymentGateway}
                                            </div>
                                            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                {method.type === 'card' && method.cardDetails
                                                    ? `${method.cardDetails.brand} •••• ${method.cardDetails.lastFour}`
                                                    : method.type}
                                            </div>
                                        </div>
                                    </div>
                                    {method.isDefault && (
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                                            Default
                                        </span>
                                    )}
                                </div>
                                {method.cardDetails && (
                                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                        Expires {method.cardDetails.expMonth}/{method.cardDetails.expYear}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    {!method.isDefault && (
                                        <button className="btn-outline text-sm flex-1">
                                            Set as Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemove(method.id)}
                                        className="p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors text-red-500"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md card p-8">
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                            Add Payment Method
                        </h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                            Payment method integration will be handled by the selected payment gateway SDK.
                            This is a placeholder for the actual payment form.
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="btn-outline flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    showNotification('Payment method integration coming soon', 'info');
                                    setShowAddForm(false);
                                }}
                                className="btn-primary flex-1"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

