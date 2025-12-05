import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SUBSCRIPTION_PLANS } from '../../utils/constant';
import { SubscriptionService } from '../../services/subscription.service';
import { UpgradePlanModal } from '../subscription/UpgradePlanModal';
import { SubscriptionPlan, BillingInterval } from '../../types/subscription.types';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getContactLink } from '../../utils/contact-utils';
import { SubscriptionPlansShimmer } from '../shimmer/SubscriptionPlansShimmer';

export const SubscriptionPlans: React.FC = () => {
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const { data: currentSubscription, isLoading } = useQuery(
        ['subscription'],
        () => SubscriptionService.getSubscription(),
        {
            retry: false,
        }
    );

    const handleUpgrade = (plan: SubscriptionPlan) => {
        if (plan === 'enterprise' || (plan as string).toLowerCase() === 'enterprise') {
            // Contact sales for enterprise
            window.open(getContactLink('Contact Sales', 'Enterprise Plan Inquiry'), '_blank');
            return;
        }

        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const formatLimit = (limit: number, unit: string = '') => {
        if (limit === -1) return 'Unlimited';
        if (limit >= 1_000_000) return `${(limit / 1_000_000).toFixed(1)}M${unit}`;
        if (limit >= 1_000) return `${(limit / 1_000).toFixed(0)}K${unit}`;
        return `${limit.toLocaleString()}${unit}`;
    };

    const plans = Object.values(SUBSCRIPTION_PLANS);

    if (isLoading) {
        return <SubscriptionPlansShimmer />;
    }

    return (
        <div className="px-4 sm:px-6 py-8 sm:py-12 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 sm:mb-12 text-center">
                    <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold font-display gradient-text-primary">
                        Choose Your Plan
                    </h1>
                    <p className="mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl text-light-text-secondary dark:text-dark-text-secondary px-4">
                        Select the perfect plan for your AI cost optimization needs
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex relative gap-2 sm:gap-4 items-center p-1 pt-6 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`btn px-4 sm:px-6 py-2 text-sm sm:text-base !rounded-xl ${billingInterval === 'monthly'
                                ? 'btn-primary'
                                : 'btn-outline !border-2 !border-[#009454] dark:!border-[#06ec9e] [border-image:none]'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`px-4 sm:px-6 py-2 relative text-sm sm:text-base !rounded-xl ${billingInterval === 'yearly'
                                ? 'btn-primary'
                                : 'btn-outline !border-2 !border-[#009454] dark:!border-[#06ec9e] [border-image:none]'
                                }`}
                        >
                            Yearly
                            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg z-10">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 pt-6 sm:pt-8 mb-8 sm:mb-12 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();
                        const isEnterprise = plan.name.toLowerCase() === 'enterprise'.toLowerCase();
                        const isPopular = (plan as any).popular;

                        return (
                            <div
                                key={plan.name}
                                className={`card p-8 pt-12 relative transition-all h-full flex flex-col ${isPopular
                                    ? ' !overflow-visible':'card-hover'
                                    } ${isCurrentPlan ? 'bg-primary-500/10' : ''}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 z-20 transform -translate-x-1/2">
                                        <span className="inline-flex justify-center items-center px-5 py-2 text-sm font-bold text-white whitespace-nowrap bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-xl backdrop-blur-sm">
                                            <SparklesIcon className="w-4 h-4 mr-1.5" />
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="mb-2 text-2xl font-bold text-light-text dark:text-dark-text">
                                        {plan.displayName}
                                    </h3>
                                    <div className="flex gap-2 items-baseline">
                                        <span className="text-4xl font-bold text-light-text dark:text-dark-text">
                                            {isEnterprise
                                                ? 'Custom'
                                                : `$${billingInterval === 'monthly' ? plan.price : plan.yearlyPrice}`}
                                        </span>
                                        {!isEnterprise && (
                                            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                                /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                    </div>
                                    {plan.trialDays > 0 && (
                                        <div className="mt-2 text-sm font-semibold text-primary-500">
                                            {plan.trialDays}-day free trial
                                        </div>
                                    )}
                                </div>

                                {/* Limits Summary */}
                                <div className="mb-6 space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Tokens
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.tokensPerMonth, ' tokens')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Requests
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.requestsPerMonth, ' requests')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Logs
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.logsPerMonth, ' logs')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Projects
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.projects)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Workflows
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.workflows)}
                                        </span>
                                    </div>
                                    {plan.limits.cortexDailyUsage > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="flex gap-1 items-center text-light-text-secondary dark:text-dark-text-secondary">
                                                <SparklesIcon className="w-4 h-4 text-primary-500" />
                                                Cortex
                                            </span>
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {formatLimit(plan.limits.cortexDailyUsage, '/day')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="flex-grow mb-8 space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex gap-2 items-start text-sm">
                                            <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* AI Models Access */}
                                <div className="mb-6">
                                    <div className="flex gap-2 items-center mb-2">
                                        <span className="text-sm font-semibold text-light-text dark:text-dark-text">
                                            {((plan.allowedModels as readonly string[]) || []).some((m: string) => m === '*')
                                                ? 'All Models'
                                                : `${(plan.allowedModels as readonly string[]).length} Models`}
                                        </span>
                                        {((plan.allowedModels as readonly string[]) || []).some((m: string) => m === 'custom') && (
                                            <span className="px-2 py-0.5 text-xs font-semibold text-primary-500 bg-primary-500/20 rounded-full">
                                                + Custom
                                            </span>
                                        )}
                                    </div>
                                    {((plan.allowedModels as readonly string[]) || []).some((m: string) => m === '*') ? (
                                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Access to all supported AI providers including OpenAI, Claude, Gemini, Grok, and more
                                        </div>
                                    ) : plan.allowedModels.length > 0 && (
                                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Limited to cheaper models: Claude Haiku, GPT-3.5 Turbo, Gemini Flash
                                        </div>
                                    )}
                                </div>

                                {/* Seats Information */}
                                {plan.limits.seats !== undefined && plan.limits.seats > 0 && (
                                    <div className="p-3 mb-6 rounded-lg border bg-primary-500/5 border-primary-500/10">
                                        <div className="mb-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                            Team Seats
                                        </div>
                                        <div className="text-sm font-semibold text-light-text dark:text-dark-text">
                                            {plan.limits.seats && plan.limits.seats > 0 ? `${plan.limits.seats} included` : 'Unlimited'}
                                            {plan.limits.seats && plan.limits.seats > 0 && (plan as any).overage?.seatsPerUser > 0 && (
                                                <span className="ml-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    (${(plan as any).overage.seatsPerUser}/user/month additional)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Overage Info */}
                                {(plan as any).overage && (
                                    <div className="p-3 mb-6 rounded-lg border bg-primary-500/10 border-primary-500/20">
                                        <div className="mb-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                            Overage Pricing
                                        </div>
                                        <div className="text-sm font-semibold text-light-text dark:text-dark-text">
                                            {(plan as any).overage.tokensPerMillion > 0 && (
                                                <div>${(plan as any).overage.tokensPerMillion}/1M tokens</div>
                                            )}
                                            {(plan as any).overage.seatsPerUser > 0 && (
                                                <div>${(plan as any).overage.seatsPerUser}/user/month</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.name as SubscriptionPlan)}
                                    disabled={isCurrentPlan}
                                    className={`btn w-full mt-auto ${isCurrentPlan
                                        ? 'cursor-not-allowed bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-tertiary dark:text-dark-text-tertiary'
                                        : isPopular
                                            ? 'btn-primary'
                                            : 'btn-outline'
                                        }`}
                                >
                                    {isCurrentPlan
                                        ? 'Current Plan'
                                        : isEnterprise
                                            ? 'Contact Sales'
                                            : 'Upgrade Now'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Feature Comparison Table */}
                <div className="p-8 mb-12 card">
                    <h2 className="mb-8 text-3xl font-bold text-center text-light-text dark:text-dark-text">
                        Feature Comparison
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary-200/20 dark:border-primary-800/20">
                                    <th className="px-6 py-4 font-semibold text-left text-light-text dark:text-dark-text">
                                        Feature
                                    </th>
                                    {plans.map((plan) => (
                                        <th
                                            key={plan.name}
                                            className={`text-center py-4 px-6 font-semibold text-light-text dark:text-dark-text ${(plan as any).popular ? 'bg-primary-500/10' : ''
                                                }`}
                                        >
                                            {plan.displayName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                                {/* User Restrictions Section */}
                                <tr>
                                    <td className="px-6 py-4 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>User Restrictions</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Number of Seats
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {plan.limits.seats === -1 ? 'Custom' : plan.limits.seats === 1 ? '1' : `${plan.limits.seats}`}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Tokens per Month
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {formatLimit(plan.limits.tokensPerMonth)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Requests per Month
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {formatLimit(plan.limits.requestsPerMonth)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Logs per Month
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {formatLimit(plan.limits.logsPerMonth)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Number of Projects
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {formatLimit(plan.limits.projects)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Number of Workflows
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {plan.limits.workflows === -1 ? 'Unlimited' : formatLimit(plan.limits.workflows)}
                                                {plan.limits.workflows === 100 && plan.limits.seats > 1 && ' /user'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Template Prompts
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-green-500">Unlimited</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        AI Models Access
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {((plan.allowedModels as readonly string[]) || []).some((m: string) => m === '*')
                                                    ? 'All Models'
                                                    : ((plan.allowedModels as readonly string[]) || []).some((m: string) => m === 'custom')
                                                        ? 'All + Custom'
                                                        : 'Cheaper Models Only'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Analytics & Optimization Section */}
                                <tr>
                                    <td className="px-6 py-4 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Analytics & Optimization</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Usage Tracking
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Advanced Metrics
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Predictive Analytics
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Batch Processing
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Gateway & Security Section */}
                                <tr>
                                    <td className="px-6 py-4 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Gateway & Security</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Unified Endpoint
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Failover & Reliability
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Security & Moderation
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        <div className="flex gap-2 items-center">
                                            <span>Cortex Meta-Language</span>
                                            <span className="px-2 py-0.5 text-xs font-semibold text-primary-500 bg-primary-500/20 rounded-full flex items-center gap-1">
                                                <SparklesIcon className="w-3 h-3" />
                                                REVOLUTIONARY
                                            </span>
                                        </div>
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.limits.cortexDailyUsage === 0 ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <CheckIcon className="w-6 h-6 text-primary-500" />
                                                    <span className="mt-1 text-xs text-primary-500">
                                                        {plan.limits.cortexDailyUsage === -1
                                                            ? 'Unlimited'
                                                            : `${plan.limits.cortexDailyUsage}/day`}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Cross-Lingual Processing
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.name === 'Free' ? (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                                            ) : (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Support Channels Section */}
                                <tr>
                                    <td className="px-6 py-4 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Support Channels</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Support Type
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <span className="font-semibold text-light-text dark:text-dark-text">
                                                {plan.name === 'Enterprise' ? 'Discord & Slack' : 'Community Forum'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                        Priority Support
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            {plan.features.some((f) =>
                                                f.toLowerCase().includes('priority')
                                            ) ? (
                                                <CheckIcon className="mx-auto w-6 h-6 text-primary-500" />
                                            ) : (
                                                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upgrade Modal */}
                {showUpgradeModal && selectedPlan && (
                    <UpgradePlanModal
                        currentPlan={currentSubscription?.plan || 'free'}
                        onClose={() => {
                            setShowUpgradeModal(false);
                            setSelectedPlan(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

