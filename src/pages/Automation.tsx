import React, { useState } from 'react';
import AutomationDashboard from '../components/automation/AutomationDashboard';
import AutomationConnectionManager from '../components/automation/AutomationConnectionManager';
import { ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Automation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'connections'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
                }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Dash</span>
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'connections'
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
                }`}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span className="hidden xs:inline">Connections</span>
              <span className="xs:hidden">Conn</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <AutomationDashboard />}
        {activeTab === 'connections' && <AutomationConnectionManager />}
      </div>
    </div>
  );
};

export default Automation;

