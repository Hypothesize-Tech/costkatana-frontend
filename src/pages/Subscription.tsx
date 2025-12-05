import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubscriptionDashboard } from '../components/subscription/SubscriptionDashboard';
import { BillingHistory } from '../components/subscription/BillingHistory';
import { PaymentMethodManager } from '../components/subscription/PaymentMethodManager';
import { UsageAnalytics } from '../components/subscription/UsageAnalytics';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';

type Tab = 'overview' | 'billing' | 'payment-methods' | 'analytics';

const VALID_TABS: Tab[] = ['overview', 'billing', 'payment-methods', 'analytics'];

export const Subscription: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize activeTab from URL or default to 'overview'
  const getInitialTab = (): Tab => {
    const tabParam = searchParams.get('tab') as Tab;
    return (tabParam && VALID_TABS.includes(tabParam)) ? tabParam : 'overview';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: CreditCardIcon },
    { id: 'billing' as Tab, label: 'Billing History', icon: DocumentTextIcon },
    { id: 'payment-methods' as Tab, label: 'Payment Methods', icon: WalletIcon },
    { id: 'analytics' as Tab, label: 'Usage Analytics', icon: ChartBarIcon },
  ];

  // Handle URL parameter changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab;
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display gradient-text-primary mb-1 sm:mb-2">
            Subscription Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Manage your subscription, billing, and usage
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-5 md:mb-6 border-b border-primary-200/20 dark:border-primary-800/20 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                    }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">
                    {tab.id === 'overview' ? 'Overview' :
                      tab.id === 'billing' ? 'Billing' :
                        tab.id === 'payment-methods' ? 'Payment' : 'Analytics'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <SubscriptionDashboard />}
          {activeTab === 'billing' && <BillingHistory />}
          {activeTab === 'payment-methods' && <PaymentMethodManager />}
          {activeTab === 'analytics' && <UsageAnalytics />}
        </div>
      </div>
    </div>
  );
};

