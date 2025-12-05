import React from "react";

export const CostCalculatorShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Input Section */}
      <div className="p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6">
        <div className="flex flex-col items-start gap-3 mb-4 sm:flex-row sm:items-center sm:gap-3 sm:mb-5 md:mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shrink-0 sm:p-2.5 md:p-3">
            <div className="w-5 h-5 rounded skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="mb-2 w-full h-6 rounded skeleton sm:w-40 sm:h-6.5 md:w-48 md:h-7" />
            <div className="w-full h-3.5 rounded skeleton sm:w-64 sm:h-4 md:w-80 md:h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-2 w-full h-3.5 rounded skeleton sm:w-20 sm:h-4 md:w-24" />
              <div className="w-full h-10 rounded-xl skeleton sm:h-10.5 md:h-11" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2 sm:gap-3.5 sm:mt-5 md:grid-cols-3 md:gap-4 md:mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 sm:p-3.5 md:p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                <div className="w-full h-3.5 rounded skeleton sm:w-20 sm:h-4 md:w-24" />
              </div>
              <div className="mb-1 w-full h-4.5 rounded skeleton sm:w-28 sm:h-5 md:w-32" />
              <div className="w-full h-5 rounded skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6"
          >
            <div className="flex justify-between items-start mb-3 gap-2 sm:mb-3.5 md:mb-4">
              <div className="flex-1 min-w-0">
                <div className="mb-1 w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
                <div className="w-full h-3.5 rounded skeleton sm:w-20 sm:h-4 md:w-24" />
              </div>
              <div className="w-18 h-5 rounded skeleton shrink-0 sm:w-19 sm:h-5.5 md:w-20 md:h-6" />
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 mb-3 rounded-xl border bg-secondary-50/50 dark:bg-secondary-900/20 sm:gap-3.5 sm:p-3.5 sm:mb-3.5 md:gap-4 md:p-4 md:mb-4">
              <div className="text-center">
                <div className="mb-1 w-full h-2.5 rounded skeleton mx-auto sm:w-10 sm:h-3 md:w-12" />
                <div className="w-full h-4 rounded skeleton mx-auto sm:w-14 sm:h-4.5 md:w-16 md:h-5" />
              </div>
              <div className="text-center">
                <div className="mb-1 w-full h-2.5 rounded skeleton mx-auto sm:w-10 sm:h-3 md:w-12" />
                <div className="w-full h-4 rounded skeleton mx-auto sm:w-14 sm:h-4.5 md:w-16 md:h-5" />
              </div>
            </div>
            <div className="w-full h-7 rounded skeleton sm:h-7.5 md:h-8" />
          </div>
        ))}
      </div>
    </div>
  );
};

