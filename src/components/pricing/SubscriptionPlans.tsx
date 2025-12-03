import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SUBSCRIPTION_PLANS } from '../../utils/constant';
import { SubscriptionService } from '../../services/subscription.service';
import { UpgradePlanModal } from '../subscription/UpgradePlanModal';
import { SubscriptionPlan, BillingInterval } from '../../types/subscription.types';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getContactLink } from '../../utils/contact-utils';

export const SubscriptionPlans: React.FC = () => {
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const { data: currentSubscription } = useQuery(
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

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold font-display gradient-text-primary mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        Select the perfect plan for your AI cost optimization needs
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 p-1 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary relative pt-6">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`btn px-6 py-2 !rounded-xl ${billingInterval === 'monthly'
                                ? 'btn-primary'
                                : 'btn-outline !border-2 !border-[#009454] dark:!border-[#06ec9e] [border-image:none]'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`px-6 py-2 relative !rounded-xl ${billingInterval === 'yearly'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 pt-8">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();
                        const isEnterprise = plan.name.toLowerCase() === 'enterprise'.toLowerCase();
                        const isPopular = (plan as any).popular;

                        return (
                            <div
                                key={plan.name}
                                className={`card p-8 pt-12 relative transition-all h-full flex flex-col ${isPopular
                                    ? ' !overflow-visible'
                                    : 'card-hover'
                                    } ${isCurrentPlan ? 'bg-primary-500/10' : ''}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                        <span className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl whitespace-nowrap backdrop-blur-sm">
                                            <SparklesIcon className="w-4 h-4 mr-1.5" />
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                                        {plan.displayName}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
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
                                        <div className="mt-2 text-sm text-primary-500 font-semibold">
                                            {plan.trialDays}-day free trial
                                        </div>
                                    )}
                                </div>

                                {/* Limits Summary */}
                                <div className="mb-6 space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Tokens
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.tokensPerMonth, ' tokens')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Requests
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.requestsPerMonth, ' requests')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Logs
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.logsPerMonth, ' logs')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Projects
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.projects)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                            Workflows
                                        </span>
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {formatLimit(plan.limits.workflows)}
                                        </span>
                                    </div>
                                    {plan.limits.cortexDailyUsage > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
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
                                <ul className="space-y-2 mb-8 flex-grow">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* AI Models Access */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
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
                                    <div className="mb-6 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
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
                                    <div className="mb-6 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
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
                                        ? 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-tertiary dark:text-dark-text-tertiary cursor-not-allowed'
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
                <div className="card p-8 mb-12">
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-8 text-center">
                        Feature Comparison
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary-200/20 dark:border-primary-800/20">
                                    <th className="text-left py-4 px-6 font-semibold text-light-text dark:text-dark-text">
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
                                    <td className="py-4 px-6 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>User Restrictions</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Analytics & Optimization</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
                                        Usage Tracking
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Gateway & Security Section */}
                                <tr>
                                    <td className="py-4 px-6 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Gateway & Security</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
                                        Unified Endpoint
                                    </td>
                                    {plans.map((plan) => (
                                        <td
                                            key={plan.name}
                                            className={`text-center py-4 px-6 ${(plan as any).popular ? 'bg-primary-500/5' : ''
                                                }`}
                                        >
                                            <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
                                        <div className="flex items-center gap-2">
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
                                                    <span className="text-xs text-primary-500 mt-1">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Support Channels Section */}
                                <tr>
                                    <td className="py-4 px-6 font-bold text-light-text dark:text-dark-text bg-primary-500/10" colSpan={5}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                                            <span>Support Channels</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                    <td className="py-4 px-6 text-light-text-secondary dark:text-dark-text-secondary">
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
                                                <CheckIcon className="w-6 h-6 text-primary-500 mx-auto" />
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

