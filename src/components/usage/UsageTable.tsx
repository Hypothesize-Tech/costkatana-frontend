// src/components/usage/UsageTable.tsx
import React, { useState } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { Usage } from "../../types";
import { UsageItem } from "./UsageItem";
import { UsageEmpty } from "./UsageEmpty";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface UsageTableProps {
  usages: Usage[];
  isLoading: boolean;
  onUsageClick: (usage: Usage) => void;
  onOptimize?: (usage: Usage) => void;
  onSimulate?: (usage: Usage) => void;
  onSort?: (field: string, order: "asc" | "desc") => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onImport?: () => void;
}

export const UsageTable: React.FC<UsageTableProps> = ({
  usages,
  isLoading,
  onUsageClick,
  onOptimize,
  onSimulate,
  onSort,
  sortField,
  sortOrder,
  hasFilters,
  onClearFilters,
  onImport,
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const columns = [
    { key: "prompt", label: "Prompt", sortable: false },
    { key: "service", label: "Service", sortable: true },
    { key: "model", label: "Model", sortable: true },
    { key: "totalTokens", label: "Tokens", sortable: true },
    { key: "cost", label: "Cost", sortable: true },
    { key: "responseTime", label: "Response Time", sortable: true },
  ];

  const handleSort = (field: string) => {
    if (!onSort) return;

    if (sortField === field) {
      onSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary" />;
    }

    return sortOrder === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 text-primary-500" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-primary-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (usages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <UsageEmpty
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
          onImport={onImport}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
      <table className="min-w-full divide-y divide-accent-200/30">
        <thead className="glass bg-gradient-to-r from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-4 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider ${column.sortable && onSort ? "cursor-pointer select-none hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors duration-300" : ""
                  }`}
                onClick={() => column.sortable && handleSort(column.key)}
                onMouseEnter={() => setHoveredColumn(column.key)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <div className="flex items-center space-x-2">
                  <span>{column.label}</span>
                  {column.sortable && onSort && (
                    <span
                      className={`transition-all duration-300 ${hoveredColumn === column.key || sortField === column.key
                        ? "opacity-100 scale-110"
                        : "opacity-0 scale-95"
                        }`}
                    >
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th scope="col" className="relative px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="glass divide-y divide-accent-200/30">
          {usages.map((usage) => (
            <UsageItem
              key={usage._id}
              usage={usage}
              onClick={onUsageClick}
              onOptimize={onOptimize}
              onSimulate={onSimulate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
