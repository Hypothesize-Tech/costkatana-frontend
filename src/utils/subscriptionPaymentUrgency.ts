import type { Subscription, SubscriptionStatus } from '../types/subscription.types';

export type PaymentUrgencyKind =
  | 'status'
  | 'grace_period'
  | 'overdue_recurring'
  | 'missing_payment_method';

const PROBLEM_STATUSES: SubscriptionStatus[] = [
  'past_due',
  'unpaid',
  'incomplete',
  'canceled',
  'paused',
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether to show the urgent (amber) subscription payment banner.
 * Covers Stripe-style statuses plus: grace period, overdue recurring charge (monthly/yearly),
 * and paid plans with no payment method on file.
 */
export function resolvePaymentUrgency(
  subscription: Subscription | null | undefined
): {
  show: boolean;
  kind: PaymentUrgencyKind;
  statusForCopy?: SubscriptionStatus;
} | null {
  if (!subscription) return null;

  const status = subscription.status;
  if (PROBLEM_STATUSES.includes(status)) {
    return { show: true, kind: 'status', statusForCopy: status };
  }

  if (subscription.plan === 'free') {
    return null;
  }

  if (status !== 'active' && status !== 'trialing') {
    return null;
  }

  if (subscription.gracePeriodEnd || subscription.gracePeriodReason) {
    return { show: true, kind: 'grace_period' };
  }

  const amount = subscription.billing?.amount ?? 0;
  const gateway = subscription.paymentMethod?.paymentGateway;
  if (amount > 0 && (!gateway || gateway === 'none')) {
    return { show: true, kind: 'missing_payment_method' };
  }

  const interval = subscription.billing?.interval;
  if (interval === 'monthly' || interval === 'yearly') {
    const next = subscription.billing?.nextBillingDate;
    if (next) {
      const nextDate = new Date(next);
      if (nextDate.getTime() + ONE_DAY_MS < Date.now()) {
        return { show: true, kind: 'overdue_recurring' };
      }
    }
  }

  return null;
}

export function getPaymentUrgencyCopy(urgency: {
  kind: PaymentUrgencyKind;
  statusForCopy?: SubscriptionStatus;
  subscription: Subscription;
}): { title: string; description: string; primaryCta: string } {
  const { kind, statusForCopy, subscription } = urgency;

  if (kind === 'status' && statusForCopy) {
    const map: Record<
      string,
      { title: string; description: string; primaryCta: string }
    > = {
      past_due: {
        title: 'Payment failed',
        description:
          'Your last payment did not go through. Update your payment method to keep full access and avoid interruption.',
        primaryCta: 'Update payment',
      },
      unpaid: {
        title: 'Subscription unpaid',
        description:
          'Your subscription has an outstanding balance. Pay now to restore service and continue using all features.',
        primaryCta: 'Pay now',
      },
      incomplete: {
        title: 'Complete your subscription',
        description:
          'Your subscription setup is not finished. Complete payment to activate your plan.',
        primaryCta: 'Complete payment',
      },
      canceled: {
        title: 'Subscription canceled',
        description:
          'Your subscription is no longer active. Resubscribe to regain access to paid features and limits.',
        primaryCta: 'Resubscribe',
      },
      paused: {
        title: 'Subscription paused',
        description:
          'Your subscription is paused. Resume billing or subscribe again to continue.',
        primaryCta: 'Resume plan',
      },
    };
    return (
      map[statusForCopy] ?? {
        title: 'Action required',
        description: 'Please review your subscription and billing settings.',
        primaryCta: 'Open billing',
      }
    );
  }

  if (kind === 'grace_period') {
    const reason = subscription.gracePeriodReason?.trim();
    return {
      title: 'Payment or verification needed',
      description:
        reason ||
        'Your account is in a billing grace period. Complete payment to avoid losing access to your paid plan.',
      primaryCta: 'Pay now',
    };
  }

  if (kind === 'missing_payment_method') {
    return {
      title: 'Add a payment method',
      description:
        'Your paid plan requires a valid payment method. Add a card or other method to stay subscribed.',
      primaryCta: 'Add payment',
    };
  }

  const intervalLabel =
    subscription.billing?.interval === 'yearly' ? 'annual' : 'monthly';

  return {
    title: 'Subscription payment overdue',
    description: `We have not received your latest ${intervalLabel} charge. Pay now to keep your ${subscription.plan} plan and avoid interruption.`,
    primaryCta: 'Pay now',
  };
}
