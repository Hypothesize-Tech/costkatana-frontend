// src/components/alerts/AlertFilter.tsx
import React from "react";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface AlertFilterProps {
  filters: {
    type: string;
    severity: string;
    read: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export const AlertFilter: React.FC<AlertFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="glass rounded-xl p-6 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
          <FunnelIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-display font-semibold gradient-text-primary">Filters</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            <option value="cost_alert">Cost Alert</option>
            <option value="optimization_available">
              Optimization Available
            </option>
            <option value="anomaly_detected">Anomaly Detected</option>
            <option value="usage_limit">Usage Limit</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white mb-2">
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange("severity", e.target.value)}
            className="input"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white mb-2">
            Status
          </label>
          <select
            value={filters.read}
            onChange={(e) => onFilterChange("read", e.target.value)}
            className="input"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onReset}
          className="btn-ghost text-sm font-display font-medium"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};
