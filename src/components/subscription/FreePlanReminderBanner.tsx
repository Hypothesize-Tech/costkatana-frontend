import React, { useCallback, useEffect, useState } from 'react';
import { SparklesIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Subscription } from '../../types/subscription.types';

const SNOOZE_KEY = 'ck_free_plan_reminder_snooze_until';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    return !Number.isNaN(until) && Date.now() < until;
  } catch {
    return false;
  }
}

export interface FreePlanReminderBannerProps {
  subscription: Subscription | null | undefined;
  /** True when GET /user/subscription failed — show a small fallback strip. */
  loadFailed?: boolean;
  onViewPlans: () => void;
}

/**
 * Soft reminder for users on the free tier (active / trialing).
 * Shown globally so the subscription area is never “invisible” for healthy free accounts.
 * The urgent payment banner takes precedence when billing is in a problem state.
 */
export const FreePlanReminderBanner: React.FC<FreePlanReminderBannerProps> = ({
  subscription,
  loadFailed = false,
  onViewPlans,
}) => {
  const [hiddenBySnooze, setHiddenBySnooze] = useState(false);

  useEffect(() => {
    setHiddenBySnooze(isSnoozed());
  }, [subscription?.plan, subscription?.updatedAt]);

  const onSnooze = useCallback(() => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      /* ignore */
    }
    setHiddenBySnooze(true);
  }, []);

  if (hiddenBySnooze) return null;

  if (loadFailed) {
    return (
      <div
        role="status"
        className="relative overflow-hidden rounded-xl border shadow-md glass border-secondary-400/30 bg-secondary-950/20 dark:bg-secondary-900/30"
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Couldn’t load subscription details. You can still open plans and billing.
          </p>
          <button
            type="button"
            onClick={onViewPlans}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold font-display text-white bg-gradient-primary hover:opacity-95 shrink-0"
          >
            View plans
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  const plan = String(subscription.plan ?? '').toLowerCase();
  const show =
    plan === 'free' &&
    (subscription.status === 'active' || subscription.status === 'trialing');

  if (!show) return null;

  return (
    <div
      role="status"
      className="relative overflow-hidden rounded-xl border shadow-md glass border-primary-400/25 dark:border-primary-500/30 bg-gradient-to-r from-primary-950/30 via-primary-900/20 to-transparent dark:from-primary-950/50 dark:via-primary-900/35"
    >
      <div className="relative flex flex-col gap-3 p-4 sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300">
            <SparklesIcon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold font-display text-light-text dark:text-dark-text">
              You’re on the Free plan
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Upgrade when you need higher limits, more projects, or premium models.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-shrink-0 md:justify-end">
          <button
            type="button"
            onClick={onViewPlans}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold font-display text-white bg-gradient-primary hover:opacity-95 transition-opacity"
          >
            View plans
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSnooze}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-500/30 px-3 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-500/10"
            aria-label="Snooze free plan reminder for seven days"
          >
            <XMarkIcon className="h-4 w-4 flex-shrink-0" aria-hidden />
            Snooze 7 days
          </button>
        </div>
      </div>
    </div>
  );
};
