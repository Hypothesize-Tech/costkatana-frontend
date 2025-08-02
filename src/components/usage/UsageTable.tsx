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
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />;
    }

    return sortOrder === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 text-gray-700" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-gray-700" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
    <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable && onSort ? "cursor-pointer select-none" : ""
                  }`}
                onClick={() => column.sortable && handleSort(column.key)}
                onMouseEnter={() => setHoveredColumn(column.key)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && onSort && (
                    <span
                      className={`transition-opacity ${hoveredColumn === column.key || sortField === column.key
                          ? "opacity-100"
                          : "opacity-0"
                        }`}
                    >
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
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
