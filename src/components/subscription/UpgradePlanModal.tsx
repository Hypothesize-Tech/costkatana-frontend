import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '../../services/subscription.service';
import { SUBSCRIPTION_PLANS } from '../../utils/constant';
import { SubscriptionPlan, BillingInterval, PaymentGateway } from '../../types/subscription.types';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import stripeLogo from '../../assets/stripe-logo.png';
import paypalLogo from '../../assets/paypal-logo.webp';
import razorpayLogo from '../../assets/razorpay-logo.png';
import { PayPalButton } from './PayPalButton';
import { StripePaymentForm } from './StripePaymentForm';
import { RazorpayPaymentForm } from './RazorpayPaymentForm';

interface UpgradePlanModalProps {
    currentPlan: SubscriptionPlan;
    onClose: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
    currentPlan,
    onClose,
}) => {
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('plus');
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('stripe');
    const [discountCode, setDiscountCode] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const upgradeMutation = useMutation(
        (data: any) => SubscriptionService.upgradeSubscription(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['subscription']);
                showNotification('Subscription upgraded successfully!', 'success');
                onClose();
            },
            onError: (error: any) => {
                showNotification(
                    error.response?.data?.message || 'Failed to upgrade subscription',
                    'error'
                );
            },
        }
    );

    const handleUpgrade = () => {
        const currentPlanLower = (currentPlan || '').toLowerCase();
        const selectedPlanLower = (selectedPlan || '').toLowerCase();

        if (selectedPlanLower === currentPlanLower) {
            showNotification('You are already on this plan', 'warning');
            return;
        }

        if (selectedPlanLower === 'enterprise') {
            showNotification('Please contact sales for Enterprise plans', 'info');
            return;
        }

        setShowPaymentForm(true);
    };

    const plans = Object.values(SUBSCRIPTION_PLANS).filter(
        (plan) => plan.name.toLowerCase() !== 'free' && plan.name.toLowerCase() !== 'enterprise'
    );

    const selectedPlanKey = selectedPlan?.toLowerCase() as keyof typeof SUBSCRIPTION_PLANS;
    const selectedPlanDetails = selectedPlanKey ? SUBSCRIPTION_PLANS[selectedPlanKey] : SUBSCRIPTION_PLANS.plus;
    const price =
        billingInterval === 'monthly'
            ? selectedPlanDetails.price
            : selectedPlanDetails.yearlyPrice;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-8">
                <button
                    onClick={onClose}
                    className="btn absolute top-4 right-4 p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">
                    Upgrade Your Plan
                </h2>

                {!showPaymentForm ? (
                    <>
                        {/* Billing Interval Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-8 p-1 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary">
                            <button
                                onClick={() => setBillingInterval('monthly')}
                                className={`btn px-6 py-2 rounded-lg font-semibold transition-all ${billingInterval === 'monthly'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingInterval('yearly')}
                                className={`btn px-6 py-2 rounded-lg font-semibold transition-all ${billingInterval === 'yearly'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                                    }`}
                            >
                                Yearly
                                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                    Save 20%
                                </span>
                            </button>
                        </div>

                        {/* Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    onClick={() => setSelectedPlan(plan.name as SubscriptionPlan)}
                                    className={`card p-6 cursor-pointer transition-all ${(selectedPlan || '').toLowerCase() === plan.name.toLowerCase()
                                        ? 'ring-2 ring-primary-500 scale-105'
                                        : 'hover:scale-102'
                                        } ${(plan as any).popular ? 'border-primary-500/50' : ''}`}
                                >
                                    {(plan as any).popular && (
                                        <div className="mb-2">
                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                                        {plan.displayName}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-light-text dark:text-dark-text">
                                            ${billingInterval === 'monthly' ? plan.price : plan.yearlyPrice}
                                        </span>
                                        <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                            /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                                        </span>
                                    </div>
                                    <ul className="space-y-2 mb-6">
                                        {plan.features.slice(0, 5).map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {(selectedPlan || '').toLowerCase() === plan.name.toLowerCase() && (
                                        <div className="mt-4 p-2 rounded-lg bg-primary-500/10 text-center text-sm font-semibold text-primary-500">
                                            Selected
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Discount Code */}
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-semibold text-light-text dark:text-dark-text">
                                Discount Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="Enter discount code"
                                className="w-full input"
                            />
                        </div>

                        {/* Payment Gateway Selection */}
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-semibold text-light-text dark:text-dark-text">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {(['stripe', 'razorpay', 'paypal'] as PaymentGateway[]).map((gateway) => {
                                    const getLogo = () => {
                                        switch (gateway) {
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
                                        <button
                                            key={gateway}
                                            onClick={() => setSelectedGateway(gateway)}
                                            className={`btn p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${selectedGateway === gateway
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-primary-200/30 dark:border-primary-800/30 hover:border-primary-400/50'
                                                }`}
                                        >
                                            {logo && (
                                                <img
                                                    src={logo}
                                                    alt={gateway}
                                                    className="h-8 w-auto object-contain rounded-lg"
                                                />
                                            )}
                                            <div className="text-xs font-semibold text-light-text dark:text-dark-text capitalize">
                                                {gateway}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="card p-4 mb-6 bg-primary-500/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                    Plan
                                </span>
                                <span className="font-semibold text-light-text dark:text-dark-text">
                                    {selectedPlanDetails.displayName}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                    Billing
                                </span>
                                <span className="font-semibold text-light-text dark:text-dark-text">
                                    {billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}
                                </span>
                            </div>
                            {discountCode && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                        Discount
                                    </span>
                                    <span className="font-semibold text-green-500">Applied</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-primary-200/20 dark:border-primary-800/20">
                                <span className="text-lg font-bold text-light-text dark:text-dark-text">
                                    Total
                                </span>
                                <span className="text-2xl font-bold text-primary-500">
                                    ${price}/{billingInterval === 'monthly' ? 'mo' : 'yr'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="btn btn-outline flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={upgradeMutation.isLoading}
                                className="btn btn-primary flex-1"
                            >
                                {upgradeMutation.isLoading ? 'Processing...' : 'Continue to Payment'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                            Payment Information
                        </h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                            {selectedGateway === 'paypal'
                                ? 'Complete your subscription with PayPal'
                                : selectedGateway === 'stripe'
                                    ? 'Complete your subscription with Stripe'
                                    : selectedGateway === 'razorpay'
                                        ? 'Complete your subscription with Razorpay'
                                        : 'Please select a payment method'}
                        </p>

                        {selectedGateway === 'stripe' ? (
                            <div className="space-y-4">
                                <StripePaymentForm
                                    amount={price}
                                    currency={selectedPlanDetails.currency || 'USD'}
                                    plan={selectedPlan}
                                    billingInterval={billingInterval}
                                    onSuccess={() => {
                                        queryClient.invalidateQueries(['subscription']);
                                        showNotification('Subscription upgraded successfully!', 'success');
                                        onClose();
                                    }}
                                    onError={(error: any) => {
                                        showNotification(
                                            error.message || 'Failed to complete Stripe payment',
                                            'error'
                                        );
                                    }}
                                />
                                <button
                                    onClick={() => setShowPaymentForm(false)}
                                    className="btn btn-outline w-full"
                                >
                                    Back
                                </button>
                            </div>
                        ) : selectedGateway === 'paypal' ? (
                            <div className="space-y-4">
                                <PayPalButton
                                    amount={price}
                                    currency={selectedPlanDetails.currency || 'USD'}
                                    plan={selectedPlan}
                                    billingInterval={billingInterval}
                                    onSuccess={(_subscriptionId: string) => {
                                        queryClient.invalidateQueries(['subscription']);
                                        showNotification('Subscription upgraded successfully!', 'success');
                                        onClose();
                                    }}
                                    onError={(error: any) => {
                                        showNotification(
                                            error.message || 'Failed to complete PayPal payment',
                                            'error'
                                        );
                                    }}
                                />
                                <button
                                    onClick={() => setShowPaymentForm(false)}
                                    className="btn btn-outline w-full"
                                >
                                    Back
                                </button>
                            </div>
                        ) : selectedGateway === 'razorpay' ? (
                            <div className="space-y-4">
                                <RazorpayPaymentForm
                                    amount={price}
                                    currency={selectedPlanDetails.currency || 'USD'}
                                    plan={selectedPlan}
                                    billingInterval={billingInterval}
                                    onSuccess={() => {
                                        queryClient.invalidateQueries(['subscription']);
                                        showNotification('Subscription upgraded successfully!', 'success');
                                        onClose();
                                    }}
                                    onError={(error: any) => {
                                        showNotification(
                                            error.message || 'Failed to complete Razorpay payment',
                                            'error'
                                        );
                                    }}
                                />
                                <button
                                    onClick={() => setShowPaymentForm(false)}
                                    className="btn btn-outline w-full"
                                >
                                    Back
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                Please select a payment method to continue
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
