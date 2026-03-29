import React, { useState } from "react";
import { PriceComparison } from "../components/pricing";
import { SubscriptionPlans } from "../components/pricing/SubscriptionPlans";
import { useExperiment } from "../hooks/useExperiment";

type PricingTab = 'subscription' | 'model-pricing';

/**
 * Hypothesis: variant_a highlights annual savings more prominently.
 * Success metric: trackConversion("plan_interest") or Mixpanel funnel to checkout.
 */
const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PricingTab>('subscription');
  const { variant, isVariantA, trackConversion, isLoading: expLoading } =
    useExperiment("pricing_page_v2");

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-gradient-light-ambient/80 dark:bg-gradient-dark-ambient/80 backdrop-blur-lg border-b border-primary-200/20 dark:border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'subscription'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('model-pricing')}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'model-pricing'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
            >
              Model Pricing
            </button>
          </div>
        </div>
      </div>

      {!expLoading && isVariantA && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
          <div className="rounded-xl border border-primary-300/40 bg-primary-500/10 dark:bg-primary-900/20 px-4 py-3 text-sm text-light-text-primary dark:text-dark-text-primary">
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              Experiment ({variant}):
            </span>{" "}
            You are seeing the savings-forward subscription layout.{" "}
            <button
              type="button"
              className="underline text-primary-600 dark:text-primary-400 font-medium"
              onClick={() => trackConversion(1, { surface: "pricing_banner" })}
            >
              Tell us you are interested
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'subscription' ? <SubscriptionPlans /> : <PriceComparison />}
    </div>
  );
};

export default Pricing;
