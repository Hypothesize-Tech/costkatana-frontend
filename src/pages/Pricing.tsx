import React, { useState } from "react";
import { PriceComparison } from "../components/pricing";
import { SubscriptionPlans } from "../components/pricing/SubscriptionPlans";

type PricingTab = 'subscription' | 'model-pricing';

const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PricingTab>('subscription');

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

      {/* Tab Content */}
      {activeTab === 'subscription' ? <SubscriptionPlans /> : <PriceComparison />}
    </div>
  );
};

export default Pricing;
