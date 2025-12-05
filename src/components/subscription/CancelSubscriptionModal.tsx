import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '../../services/subscription.service';
import { Subscription } from '../../types/subscription.types';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CancelSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
}

const CANCEL_REASONS = [
  'Too expensive',
  'Not using enough',
  'Missing features',
  'Found alternative',
  'Temporary pause',
  'Other',
];

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  subscription,
  onClose,
}) => {
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);

  const cancelMutation = useMutation(
    (data: any) => SubscriptionService.cancelSubscription(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['subscription']);
        showNotification(
          cancelAtPeriodEnd
            ? 'Subscription will be canceled at the end of the billing period'
            : 'Subscription canceled successfully',
          'success'
        );
        onClose();
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to cancel subscription',
          'error'
        );
      },
    }
  );

  const handleCancel = () => {
    if (step === 'reason') {
      if (!selectedReason) {
        showNotification('Please select a reason', 'warning');
        return;
      }
      setStep('confirm');
    } else {
      cancelMutation.mutate({
        reason: selectedReason,
        feedback: feedback || undefined,
        cancelAtPeriodEnd,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto card p-4 sm:p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors z-10"
        >
          <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {step === 'reason' ? (
          <>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                Cancel Subscription
              </h2>
            </div>

            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-4 sm:mb-5 md:mb-6">
              We're sorry to see you go. Please help us understand why you're canceling.
            </p>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                    selectedReason === reason
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-primary-200/30 dark:border-primary-800/30 hover:border-primary-400/50'
                  }`}
                >
                  <div className="text-sm sm:text-base font-medium text-light-text dark:text-dark-text">
                    {reason}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="block mb-2 text-xs sm:text-sm font-semibold text-light-text dark:text-dark-text">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={4}
                className="w-full input text-sm sm:text-base"
              />
            </div>

            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancelAtPeriodEnd}
                  onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded border-primary-500 text-primary-500 focus:ring-primary-500 flex-shrink-0"
                />
                <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Continue access until{' '}
                  {subscription.billing.nextBillingDate
                    ? new Date(subscription.billing.nextBillingDate).toLocaleDateString()
                    : 'end of period'}
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button onClick={onClose} className="btn btn-outline flex-1 text-sm sm:text-base">
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={!selectedReason}
                className="btn btn-danger flex-1 text-sm sm:text-base"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text mb-3 sm:mb-4">
              Confirm Cancellation
            </h2>

            <div className="card p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 bg-yellow-500/10 border-yellow-500/30">
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-3 sm:mb-4">
                Are you sure you want to cancel your subscription?
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <li>• You'll lose access to premium features</li>
                <li>• Your data will be retained for 30 days</li>
                <li>
                  • You can reactivate anytime before{' '}
                  {subscription.billing.nextBillingDate
                    ? new Date(subscription.billing.nextBillingDate).toLocaleDateString()
                    : 'the end of your billing period'}
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setStep('reason')}
                className="btn btn-outline flex-1 text-sm sm:text-base"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isLoading}
                className="btn btn-danger flex-1 text-sm sm:text-base"
              >
                {cancelMutation.isLoading ? 'Canceling...' : 'Yes, Cancel Subscription'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

