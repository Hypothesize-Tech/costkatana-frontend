import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function AlreadyOptimizedBanner() {
  return (
    <div className="glass rounded-2xl border border-success-200/30 bg-gradient-success/5 p-5 sm:p-6 md:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-success flex items-center justify-center shadow-lg flex-shrink-0">
        <CheckBadgeIcon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-success-600 dark:text-success-400">
          You're running lean — nothing to act on.
        </h3>
        <p className="font-body text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mt-1">
          We've checked your spend patterns and don't see a high-impact change
          worth your time right now. We'll surface the next one the moment it
          matters.
        </p>
      </div>
    </div>
  );
}
