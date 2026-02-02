import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '../../services/subscription.service';
import { UsageMeter } from './UsageMeter';
import { UpgradePlanModal } from './UpgradePlanModal';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import {
    CreditCardIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    HashtagIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import stripeLogo from '../../assets/stripe-logo.png';
import paypalLogo from '../../assets/paypal-logo.webp';
import razorpayLogo from '../../assets/razorpay-logo.png';
import { SubscriptionDashboardShimmer } from '../shimmer/SubscriptionPlansShimmer';

export const SubscriptionDashboard: React.FC = () => {
    const { showNotification } = useNotifications();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { data: subscription, isLoading: subLoading } = useQuery(
        ['subscription'],
        () => SubscriptionService.getSubscription(),
    );

    const { data: usage, isLoading: usageLoading } = useQuery(
        ['subscription-usage'],
        () => SubscriptionService.getUsageAnalytics(),
        {
            enabled: !!subscription,
        }
    );

    const { data: spendingSummary, isLoading: spendingLoading } = useQuery(
        ['user-spending-summary'],
        () => SubscriptionService.getUserSpendingSummary(),
        {
            enabled: !!subscription,
        }
    );

    const getStatusBadge = (status: string) => {
        const badges = {
            active: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CheckCircleIcon className="w-4 h-4" />
                    Active
                </span>
            ),
            trialing: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <ClockIcon className="w-4 h-4" />
                    Trialing
                </span>
            ),
            past_due: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <ClockIcon className="w-4 h-4" />
                    Past Due
                </span>
            ),
            canceled: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <XCircleIcon className="w-4 h-4" />
                    Canceled
                </span>
            ),
            paused: (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    <ClockIcon className="w-4 h-4" />
                    Paused
                </span>
            ),
        };
        return badges[status as keyof typeof badges] || badges.active;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDaysRemaining = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (subLoading || usageLoading || spendingLoading) {
        return <SubscriptionDashboardShimmer />;
    }

    if (!subscription) {
        return (
            <div className="p-6 sm:p-8 text-center card">
                <p className="mb-3 sm:mb-4 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                    No subscription found
                </p>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="btn-primary text-sm sm:text-base"
                >
                    Create Subscription
                </button>
            </div>
        );
    }

    const trialDaysRemaining = subscription.isTrial && subscription.trialEnd
        ? getDaysRemaining(subscription.trialEnd)
        : null;

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Current Plan Card */}
            <div className="p-4 sm:p-5 md:p-6 card">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex-1">
                        <h2 className="mb-2 text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                        </h2>
                        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                            {getStatusBadge(subscription.status)}
                            {subscription.isTrial && trialDaysRemaining !== null && (
                                <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {trialDaysRemaining} days remaining
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
                            {subscription.billing.amount === 0 && subscription.plan === 'free'
                                ? 'Free'
                                : subscription.billing.amount === 0 && subscription.plan === 'enterprise'
                                    ? 'Custom Pricing'
                                    : `$${subscription.billing.amount}`}
                        </div>
                        <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            /{subscription.billing.interval}
                        </div>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t sm:grid-cols-2 border-primary-200/20 dark:border-primary-800/20">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                Payment Method
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 items-center">
                                {subscription.paymentMethod && subscription.paymentMethod.paymentGateway !== 'none' && (() => {
                                    const gateway = subscription.paymentMethod.paymentGateway;
                                    const getLogo = () => {
                                        switch (gateway?.toLowerCase()) {
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
                                    return logo ? (
                                        <img
                                            src={logo}
                                            alt={gateway || 'payment gateway'}
                                            className="object-contain w-auto h-4 sm:h-5 rounded-lg flex-shrink-0"
                                        />
                                    ) : null;
                                })()}
                                <span className="text-xs sm:text-sm font-medium text-light-text dark:text-dark-text truncate">
                                    {!subscription.paymentMethod || subscription.paymentMethod.paymentGateway === 'none'
                                        ? 'No payment method'
                                        : `${subscription.paymentMethod.paymentGateway.charAt(0).toUpperCase() + subscription.paymentMethod.paymentGateway.slice(1)}${subscription.paymentMethod.lastFour ? ` •••• ${subscription.paymentMethod.lastFour}` : ''}`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                {subscription.billing.cancelAtPeriodEnd ? 'Cancels on' : 'Next billing'}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-light-text dark:text-dark-text truncate">
                                {subscription.billing.nextBillingDate
                                    ? formatDate(subscription.billing.nextBillingDate)
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center pt-4 sm:pt-5 md:pt-6 mt-4 sm:mt-5 md:mt-6 border-t border-primary-200/20 dark:border-primary-800/20">
                    {subscription.plan !== 'enterprise' && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="flex-1 btn btn-primary text-sm sm:text-base"
                        >
                            {subscription.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                        </button>
                    )}
                    {subscription.status === 'active' && !subscription.billing.cancelAtPeriodEnd && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="btn btn-outline text-sm sm:text-base"
                        >
                            Cancel Subscription
                        </button>
                    )}
                    {subscription.billing.cancelAtPeriodEnd && (
                        <button
                            onClick={() => {
                                // Reactivate subscription
                                SubscriptionService.reactivateSubscription()
                                    .then(() => {
                                        showNotification('Subscription reactivated', 'success');
                                    })
                                    .catch(() => {
                                        showNotification('Failed to reactivate subscription', 'error');
                                    });
                            }}
                            className="flex-1 btn btn-primary text-sm sm:text-base"
                        >
                            Reactivate Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Meters */}
            {usage && (
                <div className="p-4 sm:p-5 md:p-6 card">
                    <h3 className="mb-4 sm:mb-5 md:mb-6 text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">
                        Usage Overview
                    </h3>
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        {usage.tokens && (
                            <UsageMeter
                                label="Tokens"
                                used={usage.tokens.used}
                                limit={usage.tokens.limit}
                                unit="tokens"
                                color={
                                    usage.tokens.percentage >= 90
                                        ? 'danger'
                                        : usage.tokens.percentage >= 75
                                            ? 'warning'
                                            : 'primary'
                                }
                            />
                        )}
                        {usage.requests && (
                            <UsageMeter
                                label="Requests"
                                used={usage.requests.used}
                                limit={usage.requests.limit}
                                color={
                                    usage.requests.percentage >= 90
                                        ? 'danger'
                                        : usage.requests.percentage >= 75
                                            ? 'warning'
                                            : 'primary'
                                }
                            />
                        )}
                        {usage.logs && (
                            <UsageMeter
                                label="Logs"
                                used={usage.logs.used}
                                limit={usage.logs.limit}
                                color={
                                    usage.logs.percentage >= 90
                                        ? 'danger'
                                        : usage.logs.percentage >= 75
                                            ? 'warning'
                                            : 'primary'
                                }
                            />
                        )}
                        {usage.agentTraces && (
                            <UsageMeter
                                label="Agent Traces"
                                used={usage.agentTraces.used}
                                limit={usage.agentTraces.limit}
                                color={
                                    usage.agentTraces.percentage >= 90
                                        ? 'danger'
                                        : usage.agentTraces.percentage >= 75
                                            ? 'warning'
                                            : 'primary'
                                }
                            />
                        )}
                        {subscription.limits.cortexDailyUsage > 0 && usage.cortex && (
                            <UsageMeter
                                label="Cortex Daily Usage"
                                used={usage.cortex.used}
                                limit={usage.cortex.limit}
                                color={
                                    usage.cortex.percentage >= 90
                                        ? 'danger'
                                        : usage.cortex.percentage >= 75
                                            ? 'warning'
                                            : 'primary'
                                }
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Spending Breakdown */}
            {spendingSummary && (
                <div className="p-4 sm:p-5 md:p-6 card">
                    <h3 className="mb-4 sm:mb-5 md:mb-6 text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">
                        Spending Details
                    </h3>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex gap-2 sm:gap-3 items-center mb-2">
                                <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Cost
                                </span>
                            </div>
                            <p className="text-base sm:text-lg md:text-xl font-bold font-display gradient-text-primary">
                                {formatCurrency(spendingSummary.totalCost || 0)}
                            </p>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex gap-2 sm:gap-3 items-center mb-2">
                                <HashtagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Tokens
                                </span>
                            </div>
                            <p className="text-base sm:text-lg md:text-xl font-bold font-display gradient-text-primary">
                                {formatNumber(spendingSummary.totalTokens || 0)}
                            </p>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex gap-2 sm:gap-3 items-center mb-2">
                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Requests
                                </span>
                            </div>
                            <p className="text-base sm:text-lg md:text-xl font-bold font-display gradient-text-primary">
                                {formatNumber(spendingSummary.totalRequests || 0)}
                            </p>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex gap-2 sm:gap-3 items-center mb-2">
                                <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                    Avg Cost/Req
                                </span>
                            </div>
                            <p className="text-base sm:text-lg md:text-xl font-bold font-display gradient-text-primary">
                                {formatCurrency(spendingSummary.averageCostPerRequest || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Feature Breakdown */}
                    {spendingSummary.features && spendingSummary.features.length > 0 && (
                        <div className="mb-4 sm:mb-5 md:mb-6">
                            <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display gradient-text-primary">
                                Spending by Feature
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {spendingSummary.features.slice(0, 6).map((feature: any) => (
                                    <div
                                        key={feature.feature}
                                        className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl"
                                    >
                                        <div className="flex gap-2 sm:gap-3 items-center mb-2 sm:mb-3">
                                            <div className="p-1.5 sm:p-2 bg-gradient-to-br rounded-lg from-primary-500/20 to-primary-600/20 flex-shrink-0">
                                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h5 className="text-sm sm:text-base font-bold font-display gradient-text-primary truncate">
                                                {feature.feature}
                                            </h5>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Cost:
                                                </span>
                                                <span className="font-semibold font-display text-primary-600 dark:text-primary-400">
                                                    {formatCurrency(feature.cost || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Tokens:
                                                </span>
                                                <span className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                                                    {formatNumber(feature.tokens || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Requests:
                                                </span>
                                                <span className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                                                    {formatNumber(feature.requests || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Breakdown */}
                    {spendingSummary.services && spendingSummary.services.length > 0 && (
                        <div className="mb-4 sm:mb-5 md:mb-6">
                            <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display gradient-text-primary">
                                Spending by Service
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.services.slice(0, 10).map((service: any) => (
                                    <div
                                        key={service.service}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-2.5 sm:p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-xs sm:text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary truncate">
                                            {service.service}
                                        </span>
                                        <div className="flex gap-3 sm:gap-4 items-center">
                                            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(service.requests || 0)} requests
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold font-display gradient-text-primary">
                                                {formatCurrency(service.cost || 0)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Models Breakdown */}
                    {spendingSummary.models && spendingSummary.models.length > 0 && (
                        <div className="mb-4 sm:mb-5 md:mb-6">
                            <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display gradient-text-primary">
                                Spending by Model
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.models.slice(0, 10).map((model: any) => (
                                    <div
                                        key={model.model}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-2.5 sm:p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-xs sm:text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-full sm:max-w-[200px]">
                                            {model.model}
                                        </span>
                                        <div className="flex gap-3 sm:gap-4 items-center">
                                            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(model.requests || 0)} requests
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold font-display gradient-text-primary">
                                                {formatCurrency(model.cost || 0)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Breakdown */}
                    {spendingSummary.projects && spendingSummary.projects.length > 0 && (
                        <div>
                            <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display gradient-text-primary">
                                Spending by Project
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.projects.slice(0, 10).map((project: any) => (
                                    <div
                                        key={project.projectId}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-2.5 sm:p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-xs sm:text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-full sm:max-w-[200px]">
                                            {project.projectName || project.projectId}
                                        </span>
                                        <div className="flex gap-3 sm:gap-4 items-center">
                                            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(project.requests || 0)} requests
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold font-display gradient-text-primary">
                                                {formatCurrency(project.cost || 0)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showUpgradeModal && (
                <UpgradePlanModal
                    currentPlan={subscription.plan}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
            {showCancelModal && (
                <CancelSubscriptionModal
                    subscription={subscription}
                    onClose={() => setShowCancelModal(false)}
                />
            )}
        </div>
    );
};

