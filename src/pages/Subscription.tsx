import React, { useState } from 'react';
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

export const Subscription: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: CreditCardIcon },
    { id: 'billing' as Tab, label: 'Billing History', icon: DocumentTextIcon },
    { id: 'payment-methods' as Tab, label: 'Payment Methods', icon: WalletIcon },
    { id: 'analytics' as Tab, label: 'Usage Analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display gradient-text-primary mb-2">
            Subscription Management
          </h1>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Manage your subscription, billing, and usage
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-primary-200/20 dark:border-primary-800/20">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
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

