import React, { useState } from 'react';
import { ModelComparisonTable } from '@/components/pricing/ModelComparisonTable';
import { CostCalculator } from '@/components/pricing/CostCalculator';
import {
    TableCellsIcon,
    CalculatorIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

type TabType = 'table' | 'calculator';

export default function ModelComparison() {
    const [activeTab, setActiveTab] = useState<TabType>('table');

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-6 max-w-7xl">
                {/* Header */}
                <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display gradient-text-primary">
                                    Model Comparison
                                </h1>
                                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-secondary-600 dark:text-secondary-300">
                                    Compare AI models side-by-side and calculate costs for your use case
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'table'
                                    ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white shadow-lg'
                                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                }`}
                        >
                            <TableCellsIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Comparison Table</span>
                            <span className="sm:hidden">Table</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'calculator'
                                    ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white shadow-lg'
                                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                }`}
                        >
                            <CalculatorIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Cost Calculator</span>
                            <span className="sm:hidden">Calculator</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 lg:p-8">
                    {activeTab === 'table' ? (
                        <ModelComparisonTable />
                    ) : (
                        <CostCalculator />
                    )}
                </div>
            </div>
        </div>
    );
}

