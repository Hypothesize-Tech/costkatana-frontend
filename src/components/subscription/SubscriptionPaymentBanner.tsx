import React, { useCallback, useEffect, useState } from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  CreditCardIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/24/outline';
import type { Subscription } from '../../types/subscription.types';
import { UpgradePlanModal } from './UpgradePlanModal';
import {
  getPaymentUrgencyCopy,
  resolvePaymentUrgency,
} from '../../utils/subscriptionPaymentUrgency';

const SNOOZE_STORAGE_KEY = 'ck_subscription_payment_banner_snooze_until';
const SNOOZE_MS = 60 * 60 * 1000; // 1 hour — re-show reminder until paid

export interface SubscriptionPaymentBannerProps {
  subscription: Subscription | null | undefined;
  onManageBilling: () => void;
}

const isSnoozed = (): boolean => {
  try {
    const raw = localStorage.getItem(SNOOZE_STORAGE_KEY);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    return !Number.isNaN(until) && Date.now() < until;
  } catch {
    return false;
  }
};

export const SubscriptionPaymentBanner: React.FC<SubscriptionPaymentBannerProps> = ({
  subscription,
  onManageBilling,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [hiddenBySnooze, setHiddenBySnooze] = useState(false);

  const urgency = subscription ? resolvePaymentUrgency(subscription) : null;

  useEffect(() => {
    setHiddenBySnooze(isSnoozed());
  }, [subscription?.status, subscription?.updatedAt, subscription?.gracePeriodEnd]);

  const onDismiss = useCallback(() => {
    try {
      localStorage.setItem(SNOOZE_STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      /* ignore */
    }
    setHiddenBySnooze(true);
  }, []);

  if (!subscription || !urgency?.show) {
    return null;
  }

  if (hiddenBySnooze) {
    return null;
  }

  const { title, description, primaryCta } = getPaymentUrgencyCopy({
    kind: urgency.kind,
    statusForCopy: urgency.statusForCopy,
    subscription,
  });

  return (
    <>
      <div
        role="alert"
        className="relative overflow-hidden rounded-xl border shadow-lg ring-2 ring-amber-400/30 dark:ring-amber-500/25 glass border-amber-400/40 dark:border-amber-600/40 bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-red-50/50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-red-950/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-red-500/5 pointer-events-none" />
        <div className="relative flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <ExclamationTriangleIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-display text-amber-950 dark:text-amber-100">
                {title}
              </h3>
              <p className="mt-1 text-sm font-body text-amber-900/90 dark:text-amber-200/90">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 md:flex-shrink-0 md:items-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold font-display text-white shadow-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all"
            >
              <CreditCardIcon className="h-5 w-5" />
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={onManageBilling}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold font-display border border-amber-700/30 dark:border-amber-400/40 text-amber-950 dark:text-amber-100 hover:bg-amber-500/15 transition-all"
            >
              <ArrowRightCircleIcon className="h-5 w-5" />
              Manage billing
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-600/25 dark:border-amber-500/30 px-3 py-2 text-sm font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-500/15 self-end sm:self-center whitespace-nowrap"
              aria-label="Snooze subscription alert for one hour"
            >
              <XMarkIcon className="h-4 w-4 flex-shrink-0" aria-hidden />
              Snooze 1 hour
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <UpgradePlanModal
          currentPlan={subscription.plan}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
