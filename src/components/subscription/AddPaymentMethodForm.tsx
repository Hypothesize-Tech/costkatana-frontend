import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RazorpayPaymentMethodForm } from './RazorpayPaymentMethodForm';
import stripeLogo from '../../assets/stripe-logo.png';
import paypalLogo from '../../assets/paypal-logo.webp';
import razorpayLogo from '../../assets/razorpay-logo.png';

interface AddPaymentMethodFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

type PaymentGateway = 'razorpay' | 'stripe' | 'paypal';

export const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
    onSuccess,
    onCancel,
}) => {
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('razorpay');
    const [setAsDefault, setSetAsDefault] = useState(false);

    const handleSuccess = () => {
        onSuccess();
    };

    const gateways = [
        {
            id: 'razorpay' as PaymentGateway,
            name: 'Razorpay',
            logo: razorpayLogo,
            enabled: true,
            description: 'Add payment method via Razorpay',
        },
        {
            id: 'stripe' as PaymentGateway,
            name: 'Stripe',
            logo: stripeLogo,
            enabled: false,
            description: 'Stripe payment methods coming soon',
        },
        {
            id: 'paypal' as PaymentGateway,
            name: 'PayPal',
            logo: paypalLogo,
            enabled: false,
            description: 'PayPal payment methods coming soon',
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">
                    Add Payment Method
                </h3>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
                >
                    <XMarkIcon className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
            </div>

            {/* Gateway Selection */}
            <div className="space-y-3 sm:space-y-4">
                <label className="block text-sm sm:text-base font-semibold text-light-text dark:text-dark-text">
                    Select Payment Gateway
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                    {gateways.map((gateway) => (
                        <button
                            key={gateway.id}
                            onClick={() => gateway.enabled && setSelectedGateway(gateway.id)}
                            disabled={!gateway.enabled}
                            className={`relative card p-3 sm:p-4 md:p-5 text-left transition-all ${gateway.enabled
                                    ? selectedGateway === gateway.id
                                        ? 'ring-2 ring-primary-500 border-primary-500'
                                        : 'hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            {!gateway.enabled && (
                                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                                    Coming Soon
                                </span>
                            )}
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={gateway.logo}
                                    alt={gateway.name}
                                    className="h-8 sm:h-10 w-auto object-contain mb-1.5 sm:mb-2 md:mb-3"
                                />
                                <div className="font-semibold text-xs sm:text-sm md:text-base text-light-text dark:text-dark-text mb-0.5 sm:mb-1">
                                    {gateway.name}
                                </div>
                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    {gateway.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Form */}
            {selectedGateway === 'razorpay' && (
                <div className="space-y-4 sm:space-y-5">
                    <div className="card p-4 sm:p-5">
                        <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={setAsDefault}
                                onChange={(e) => setSetAsDefault(e.target.checked)}
                                className="w-4 h-4 rounded border-primary-300 dark:border-primary-700 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm sm:text-base text-light-text dark:text-dark-text">
                                Set as default payment method
                            </span>
                        </label>
                    </div>
                    <RazorpayPaymentMethodForm
                        setAsDefault={setAsDefault}
                        onSuccess={handleSuccess}
                        onError={(error) => {
                            console.error('Error adding payment method:', error);
                        }}
                        onCancel={onCancel}
                    />
                </div>
            )}

            {(selectedGateway === 'stripe' || selectedGateway === 'paypal') && (
                <div className="card p-6 sm:p-8 text-center">
                    <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        {selectedGateway === 'stripe'
                            ? 'Stripe payment method integration is coming soon. Please use Razorpay for now.'
                            : 'PayPal payment method integration is coming soon. Please use Razorpay for now.'}
                    </p>
                    <button
                        onClick={() => setSelectedGateway('razorpay')}
                        className="btn btn-primary text-sm sm:text-base"
                    >
                        Use Razorpay Instead
                    </button>
                </div>
            )}
        </div>
    );
};

