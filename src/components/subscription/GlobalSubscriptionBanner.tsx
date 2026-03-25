import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionService } from '../../services/subscription.service';
import type { Subscription } from '../../types/subscription.types';
import { SubscriptionPaymentBanner } from './SubscriptionPaymentBanner';
import { FreePlanReminderBanner } from './FreePlanReminderBanner';
import { resolvePaymentUrgency } from '../../utils/subscriptionPaymentUrgency';

type SubscriptionQueryResult =
  | { kind: 'ok'; subscription: Subscription | null }
  | { kind: 'error' };

/**
 * Global subscription messaging in the app shell (all authenticated routes using Layout):
 * 1. Urgent billing problem — amber alert.
 * 2. Free plan reminder — softer strip (case-insensitive plan name).
 * 3. If the subscription API fails — fallback strip with link to pricing.
 *
 * Sticky under the app header so it stays visible while scrolling long pages (e.g. Dashboard chat).
 */
export function GlobalSubscriptionBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: result, isLoading } = useQuery(
    ['subscription', user?.id],
    async (): Promise<SubscriptionQueryResult> => {
      try {
        const subscription = await SubscriptionService.getSubscription();
        return { kind: 'ok', subscription: subscription ?? null };
      } catch {
        return { kind: 'error' };
      }
    },
    {
      enabled: !!user?.id,
      staleTime: 0,
      retry: 1,
    }
  );

  const subscription =
    result?.kind === 'ok' ? result.subscription : undefined;
  const loadFailed = result?.kind === 'error';

  const hasPaymentAlert =
    !!subscription && !!resolvePaymentUrgency(subscription)?.show;

  if (!user?.id || isLoading) {
    return null;
  }

  const showFreeStrip =
    !hasPaymentAlert &&
    !!subscription &&
    String(subscription.plan ?? '').toLowerCase() === 'free' &&
    (subscription.status === 'active' || subscription.status === 'trialing');

  const showErrorStrip = !hasPaymentAlert && loadFailed;

  if (!hasPaymentAlert && !showFreeStrip && !showErrorStrip) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-[100] mb-4 space-y-3 border-b border-primary-200/25 bg-white/90 py-3 shadow-sm backdrop-blur-md dark:border-primary-700/30 dark:bg-gray-950/90"
      data-testid="global-subscription-banner"
    >
      <SubscriptionPaymentBanner
        subscription={subscription}
        onManageBilling={() => navigate('/profile?tab=subscription')}
      />
      {!hasPaymentAlert && (
        <FreePlanReminderBanner
          subscription={subscription}
          loadFailed={showErrorStrip}
          onViewPlans={() => navigate('/pricing')}
        />
      )}
    </div>
  );
}
