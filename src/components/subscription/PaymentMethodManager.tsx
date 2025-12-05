import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '../../services/billing.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { CreditCardIcon, PlusIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AddPaymentMethodForm } from './AddPaymentMethodForm';
import { PaymentMethodManagerShimmer } from '../shimmer/PaymentMethodManagerShimmer';
import stripeLogo from '../../assets/stripe-logo.png';
import paypalLogo from '../../assets/paypal-logo.webp';
import razorpayLogo from '../../assets/razorpay-logo.png';
import upiLogo from '../../assets/upi-logo.svg';
import walletLogo from '../../assets/wallet-logo.png';
import bankAccountLogo from '../../assets/bank-account-logo.png';
import bankCardLogo from '../../assets/bank-card.png';

export const PaymentMethodManager: React.FC = () => {
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirmMethod, setDeleteConfirmMethod] = useState<{ id: string; type: string; gateway: string } | null>(null);

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

    const setDefaultMutation = useMutation(
        (id: string) => BillingService.updatePaymentMethod(id, { setAsDefault: true }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['payment-methods']);
                showNotification('Payment method set as default successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to set default payment method', 'error');
            },
        }
    );

    const handleRemove = (id: string, type: string, gateway: string) => {
        setDeleteConfirmMethod({ id, type, gateway });
    };

    const confirmDelete = () => {
        if (deleteConfirmMethod) {
            removeMutation.mutate(deleteConfirmMethod.id);
            setDeleteConfirmMethod(null);
        }
    };

    const handleSetDefault = (id: string) => {
        setDefaultMutation.mutate(id);
    };

    const handleAddSuccess = () => {
        setShowAddForm(false);
        queryClient.invalidateQueries(['payment-methods']);
    };

    if (isLoading) {
        return <PaymentMethodManagerShimmer />;
    }

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                    Payment Methods
                </h2>
                <button onClick={() => setShowAddForm(true)} className="btn btn-primary text-sm sm:text-base w-full sm:w-auto">
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Add Payment Method
                </button>
            </div>

            {!paymentMethods || paymentMethods.length === 0 ? (
                <div className="card p-8 sm:p-10 md:p-12 text-center">
                    <CreditCardIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                    <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-3 sm:mb-4">
                        No payment methods added
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary text-sm sm:text-base">
                        Add Payment Method
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {paymentMethods.map((method) => {
                        const getPaymentMethodLogo = () => {
                            // First check payment method type for specific logos
                            switch (method.type?.toLowerCase()) {
                                case 'upi':
                                    return { src: upiLogo, alt: 'UPI', isSvg: true };
                                case 'wallet':
                                    return { src: walletLogo, alt: 'Wallet', isSvg: false };
                                case 'bank_account':
                                    return { src: bankAccountLogo, alt: 'Bank Account', isSvg: false };
                                case 'card':
                                    return { src: bankCardLogo, alt: 'Card', isSvg: false };
                                case 'paypal_account':
                                    return { src: paypalLogo, alt: 'PayPal', isSvg: false };
                                default:
                                    return null;
                            }
                        };

                        const getGatewayLogo = () => {
                            // Then check payment gateway for gateway logos
                            switch (method.paymentGateway?.toLowerCase()) {
                                case 'stripe':
                                    return { src: stripeLogo, alt: 'Stripe', isSvg: false };
                                case 'paypal':
                                    return { src: paypalLogo, alt: 'PayPal', isSvg: false };
                                case 'razorpay':
                                    return { src: razorpayLogo, alt: 'Razorpay', isSvg: false };
                                default:
                                    return null;
                            }
                        };

                        const getTypeDisplay = () => {
                            if (method.type === 'card' && method.cardDetails) {
                                return `${method.cardDetails.brand} •••• ${method.cardDetails.lastFour}`;
                            }
                            // Format type names nicely
                            const typeMap: Record<string, string> = {
                                'upi': 'UPI',
                                'card': 'Card',
                                'bank_account': 'Bank Account',
                                'wallet': 'Wallet',
                                'paypal_account': 'PayPal Account',
                            };
                            return typeMap[method.type?.toLowerCase() || ''] || method.type?.toUpperCase() || 'UNKNOWN';
                        };

                        const paymentMethodLogo = getPaymentMethodLogo();
                        const gatewayLogo = getGatewayLogo();
                        const typeDisplay = getTypeDisplay();

                        return (
                            <div key={method.id} className="group relative card p-5 sm:p-6 overflow-hidden border border-primary-200/20 dark:border-primary-800/20 hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                                {/* Gradient background effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            {/* Payment Method Type Logo */}
                                            <div className="flex-shrink-0 relative">
                                                {paymentMethodLogo ? (
                                                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 p-2 flex items-center justify-center border border-primary-200/30 dark:border-primary-800/30">
                                                        {paymentMethodLogo.isSvg ? (
                                                            <img
                                                                src={paymentMethodLogo.src}
                                                                alt={paymentMethodLogo.alt}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={paymentMethodLogo.src}
                                                                alt={paymentMethodLogo.alt}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 flex items-center justify-center border border-primary-200/30 dark:border-primary-800/30">
                                                        <CreditCardIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="font-semibold text-base sm:text-lg text-light-text dark:text-dark-text capitalize truncate">
                                                        {method.paymentGateway}
                                                    </div>
                                                    {gatewayLogo && (
                                                        <img
                                                            src={gatewayLogo.src}
                                                            alt={gatewayLogo.alt}
                                                            className="h-4 w-auto object-contain opacity-70"
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-sm sm:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                                    {typeDisplay}
                                                </div>
                                                {method.cardDetails && (
                                                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                                                        Expires {method.cardDetails.expMonth}/{method.cardDetails.expYear}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {method.isDefault && (
                                            <span className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-primary-200/10 dark:border-primary-800/10">
                                        {!method.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(method.id)}
                                                disabled={setDefaultMutation.isLoading}
                                                className="btn-outline text-xs sm:text-sm flex-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-colors"
                                            >
                                                {setDefaultMutation.isLoading ? 'Setting...' : 'Set as Default'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemove(method.id, method.type, method.paymentGateway || '')}
                                            disabled={removeMutation.isLoading}
                                            className="p-2.5 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors text-red-500 disabled:opacity-50 hover:scale-105 active:scale-95"
                                            title="Remove payment method"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto card p-4 sm:p-6 md:p-8">
                        <AddPaymentMethodForm
                            onSuccess={handleAddSuccess}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmMethod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-xl border shadow-2xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-slide-up mx-4">
                        <div className="p-4 sm:p-5 md:p-6">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
                                    <ExclamationTriangleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-danger mb-1 sm:mb-2">
                                        Remove Payment Method
                                    </h3>
                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Are you sure you want to remove this payment method? This action cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirmMethod(null)}
                                    className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-colors text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"
                                    aria-label="Close modal"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-danger-200/20 dark:border-danger-800/20">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {(() => {
                                        const getLogo = () => {
                                            switch (deleteConfirmMethod.type?.toLowerCase()) {
                                                case 'upi':
                                                    return { src: upiLogo, isSvg: true };
                                                case 'wallet':
                                                    return { src: walletLogo, isSvg: false };
                                                case 'bank_account':
                                                    return { src: bankAccountLogo, isSvg: false };
                                                case 'card':
                                                    return { src: bankCardLogo, isSvg: false };
                                                case 'paypal_account':
                                                    return { src: paypalLogo, isSvg: false };
                                                default:
                                                    return null;
                                            }
                                        };
                                        const logo = getLogo();
                                        const typeMap: Record<string, string> = {
                                            'upi': 'UPI',
                                            'card': 'Card',
                                            'bank_account': 'Bank Account',
                                            'wallet': 'Wallet',
                                            'paypal_account': 'PayPal Account',
                                        };
                                        const typeDisplay = typeMap[deleteConfirmMethod.type?.toLowerCase() || ''] || deleteConfirmMethod.type?.toUpperCase() || 'UNKNOWN';

                                        return (
                                            <>
                                                {logo ? (
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 p-1.5 sm:p-2 flex items-center justify-center border border-primary-200/30 dark:border-primary-800/30 flex-shrink-0">
                                                        <img
                                                            src={logo.src}
                                                            alt={deleteConfirmMethod.type}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <CreditCardIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500 flex-shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-sm sm:text-base text-light-text dark:text-dark-text capitalize truncate">
                                                        {deleteConfirmMethod.gateway}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        {typeDisplay}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirmMethod(null)}
                                    className="btn-outline text-xs sm:text-sm md:text-base w-full sm:w-auto"
                                    disabled={removeMutation.isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs sm:text-sm md:text-base w-full sm:w-auto"
                                    disabled={removeMutation.isLoading}
                                >
                                    {removeMutation.isLoading ? 'Removing...' : 'Remove Payment Method'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

