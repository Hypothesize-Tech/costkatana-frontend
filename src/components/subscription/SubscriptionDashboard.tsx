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

export const SubscriptionDashboard: React.FC = () => {
    const { showNotification } = useNotifications();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { data: subscription, isLoading: subLoading } = useQuery(
        ['subscription'],
        () => SubscriptionService.getSubscription(),
        {
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    );

    const { data: usage, isLoading: usageLoading } = useQuery(
        ['subscription-usage'],
        () => SubscriptionService.getUsageAnalytics(),
        {
            enabled: !!subscription,
            refetchInterval: 60000, // Refetch every minute
        }
    );

    const { data: spendingSummary, isLoading: spendingLoading } = useQuery(
        ['user-spending-summary'],
        () => SubscriptionService.getUserSpendingSummary(),
        {
            enabled: !!subscription,
            refetchInterval: 60000, // Refetch every minute
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
        return (
            <div className="flex items-center justify-center p-12">
                <div className="spinner" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="card p-8 text-center">
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    No subscription found
                </p>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="btn-primary"
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
        <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="card p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                        </h2>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(subscription.status)}
                            {subscription.isTrial && trialDaysRemaining !== null && (
                                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {trialDaysRemaining} days remaining
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-light-text dark:text-dark-text">
                            {subscription.billing.amount === 0
                                ? 'Free'
                                : `$${subscription.billing.amount}`}
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            /{subscription.billing.interval}
                        </div>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-primary-200/20 dark:border-primary-800/20">
                    <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                Payment Method
                            </div>
                            <div className="flex items-center gap-2">
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
                                            className="h-5 w-auto object-contain rounded-lg"
                                        />
                                    ) : null;
                                })()}
                                <span className="text-sm font-medium text-light-text dark:text-dark-text">
                                    {!subscription.paymentMethod || subscription.paymentMethod.paymentGateway === 'none'
                                        ? 'No payment method'
                                        : `${subscription.paymentMethod.paymentGateway.charAt(0).toUpperCase() + subscription.paymentMethod.paymentGateway.slice(1)}${subscription.paymentMethod.lastFour ? ` •••• ${subscription.paymentMethod.lastFour}` : ''}`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                {subscription.billing.cancelAtPeriodEnd ? 'Cancels on' : 'Next billing'}
                            </div>
                            <div className="text-sm font-medium text-light-text dark:text-dark-text">
                                {subscription.billing.nextBillingDate
                                    ? formatDate(subscription.billing.nextBillingDate)
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-primary-200/20 dark:border-primary-800/20">
                    {subscription.plan !== 'enterprise' && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="btn btn-primary flex-1"
                        >
                            {subscription.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                        </button>
                    )}
                    {subscription.status === 'active' && !subscription.billing.cancelAtPeriodEnd && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="btn btn-outline"
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
                            className="btn btn-primary flex-1"
                        >
                            Reactivate Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Meters */}
            {usage && (
                <div className="card p-6">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                        Usage Overview
                    </h3>
                    <div className="space-y-6">
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
                        {usage.workflows && (
                            <UsageMeter
                                label="Workflows"
                                used={usage.workflows.used}
                                limit={usage.workflows.limit}
                                color={
                                    usage.workflows.percentage >= 90
                                        ? 'danger'
                                        : usage.workflows.percentage >= 75
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
                <div className="card p-6">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                        Spending Details
                    </h3>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex items-center gap-3 mb-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Cost
                                </span>
                            </div>
                            <p className="text-xl font-display font-bold gradient-text-primary">
                                {formatCurrency(spendingSummary.totalCost || 0)}
                            </p>
                        </div>
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex items-center gap-3 mb-2">
                                <HashtagIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Tokens
                                </span>
                            </div>
                            <p className="text-xl font-display font-bold gradient-text-primary">
                                {formatNumber(spendingSummary.totalTokens || 0)}
                            </p>
                        </div>
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex items-center gap-3 mb-2">
                                <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Requests
                                </span>
                            </div>
                            <p className="text-xl font-display font-bold gradient-text-primary">
                                {formatNumber(spendingSummary.totalRequests || 0)}
                            </p>
                        </div>
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="flex items-center gap-3 mb-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    Avg Cost/Req
                                </span>
                            </div>
                            <p className="text-xl font-display font-bold gradient-text-primary">
                                {formatCurrency(spendingSummary.averageCostPerRequest || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Feature Breakdown */}
                    {spendingSummary.features && spendingSummary.features.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-display font-bold gradient-text-primary mb-4">
                                Spending by Feature
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {spendingSummary.features.slice(0, 6).map((feature: any) => (
                                    <div
                                        key={feature.feature}
                                        className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2 rounded-lg">
                                                <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h5 className="text-base font-display font-bold gradient-text-primary">
                                                {feature.feature}
                                            </h5>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Cost:
                                                </span>
                                                <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                    {formatCurrency(feature.cost || 0)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Tokens:
                                                </span>
                                                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {formatNumber(feature.tokens || 0)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Requests:
                                                </span>
                                                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
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
                        <div className="mb-6">
                            <h4 className="text-lg font-display font-bold gradient-text-primary mb-4">
                                Spending by Service
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.services.slice(0, 10).map((service: any) => (
                                    <div
                                        key={service.service}
                                        className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                            {service.service}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(service.requests || 0)} requests
                                            </span>
                                            <span className="text-sm font-display font-bold gradient-text-primary">
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
                        <div className="mb-6">
                            <h4 className="text-lg font-display font-bold gradient-text-primary mb-4">
                                Spending by Model
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.models.slice(0, 10).map((model: any) => (
                                    <div
                                        key={model.model}
                                        className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-[200px]">
                                            {model.model}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(model.requests || 0)} requests
                                            </span>
                                            <span className="text-sm font-display font-bold gradient-text-primary">
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
                            <h4 className="text-lg font-display font-bold gradient-text-primary mb-4">
                                Spending by Project
                            </h4>
                            <div className="space-y-2">
                                {spendingSummary.projects.slice(0, 10).map((project: any) => (
                                    <div
                                        key={project.projectId}
                                        className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                    >
                                        <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-[200px]">
                                            {project.projectName || project.projectId}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatNumber(project.requests || 0)} requests
                                            </span>
                                            <span className="text-sm font-display font-bold gradient-text-primary">
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

