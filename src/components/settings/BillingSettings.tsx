// src/components/settings/BillingSettings.tsx
import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BillingSettingsProps {
    profile: any;
    onUpdate: (data: any) => void;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({ profile }) => {
    const subscription = profile?.subscription || {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date().toISOString(),
    };

    const invoices = [
        {
            id: '1',
            date: '2024-01-01',
            amount: 99.00,
            status: 'paid',
            downloadUrl: '#',
        },
        {
            id: '2',
            date: '2023-12-01',
            amount: 99.00,
            status: 'paid',
            downloadUrl: '#',
        },
    ];

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            features: [
                '100 API calls/month',
                'Basic analytics',
                '1 team member',
                'Community support',
            ],
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 99,
            features: [
                'Unlimited API calls',
                'Advanced analytics',
                '5 team members',
                'Priority support',
                'AI optimization',
                'Custom integrations',
            ],
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            features: [
                'Everything in Pro',
                'Unlimited team members',
                'Dedicated support',
                'SLA guarantee',
                'Custom features',
                'On-premise option',
            ],
        },
    ];

    return (
        <div className="space-y-8">
            {/* Current Plan */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 capitalize">
                                {subscription.plan} Plan
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {subscription.status === 'active' && subscription.plan !== 'free' && (
                                    <>Renews on {formatDate(subscription.currentPeriodEnd)}</>
                                )}
                                {subscription.plan === 'free' && 'Upgrade to unlock more features'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                                {subscription.plan === 'free' ? '$0' : '$99'}
                                <span className="text-base font-normal text-gray-600">/month</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Plans */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-lg border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
                                } p-6`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                                    Most Popular
                                </span>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                                    </span>
                                    {typeof plan.price === 'number' && (
                                        <span className="text-base font-normal text-gray-600">/month</span>
                                    )}
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg
                                                className="h-5 w-5 text-green-500 mt-0.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-2 text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`mt-6 w-full px-4 py-2 text-sm font-medium rounded-md ${subscription.plan === plan.id
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                                        }`}
                                    disabled={subscription.plan === plan.id}
                                >
                                    {subscription.plan === plan.id
                                        ? 'Current Plan'
                                        : plan.id === 'enterprise'
                                            ? 'Contact Sales'
                                            : 'Upgrade'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CreditCardIcon className="h-8 w-8 text-gray-400" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                    Visa ending in 4242
                                </p>
                                <p className="text-sm text-gray-600">Expires 12/24</p>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-500">
                            Update
                        </button>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {formatDate(invoice.date)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {formatCurrency(invoice.amount)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                        <a
                                            href={invoice.downloadUrl}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};