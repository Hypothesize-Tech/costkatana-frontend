import React from "react";

export const CostCalculatorShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg">
            <div className="w-6 h-6 rounded skeleton" />
          </div>
          <div>
            <div className="mb-2 w-48 h-7 rounded skeleton" />
            <div className="w-80 h-4 rounded skeleton" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-2 w-24 h-4 rounded skeleton" />
              <div className="w-full h-11 rounded-xl skeleton" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded skeleton" />
                <div className="w-24 h-4 rounded skeleton" />
              </div>
              <div className="mb-1 w-32 h-5 rounded skeleton" />
              <div className="w-24 h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="mb-1 w-32 h-6 rounded skeleton" />
                <div className="w-24 h-4 rounded skeleton" />
              </div>
              <div className="w-20 h-6 rounded skeleton" />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 mb-4 rounded-xl border bg-secondary-50/50 dark:bg-secondary-900/20">
              <div className="text-center">
                <div className="mb-1 w-12 h-3 rounded skeleton mx-auto" />
                <div className="w-16 h-5 rounded skeleton mx-auto" />
              </div>
              <div className="text-center">
                <div className="mb-1 w-12 h-3 rounded skeleton mx-auto" />
                <div className="w-16 h-5 rounded skeleton mx-auto" />
              </div>
            </div>
            <div className="w-full h-8 rounded skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
};

