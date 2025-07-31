// src/components/usage/UsageExport.tsx
import React, { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "@/contexts/NotificationContext";
import { usageService } from "@/services/usage.service";

interface UsageExportProps {
  filters?: {
    service?: string;
    model?: string;
    startDate?: string;
    endDate?: string;
  };
}

export const UsageExport: React.FC<UsageExportProps> = ({ filters = {} }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: "csv" as "csv" | "json" | "excel",
    includeMetadata: true,
    includePrompts: false,
    groupBy: "none" as "none" | "day" | "service" | "model",
  });

  const { showNotification } = useNotifications();

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const blob: Blob = await usageService.exportUsage({
        format: exportConfig.format as "csv" | "json" | "excel",
        startDate: filters.startDate,
        endDate: filters.endDate,
        service: filters.service,
        model: filters.model,
      });

      const filename =
        "usage-export-" + new Date().toISOString() + "." + exportConfig.format;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification("Export completed successfully!", "success");
      setShowModal(false);
    } catch (error) {
      showNotification("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
        Export
      </button>

      {showModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            />

            <div className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-xl">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Export Usage Data
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["csv", "json", "pdf"] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() =>
                          setExportConfig({
                            ...exportConfig,
                            format: format as "csv" | "json" | "excel",
                          })
                        }
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          exportConfig.format === format
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeMetadata}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includeMetadata: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include metadata
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includePrompts}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includePrompts: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include prompts & responses
                      </span>
                    </label>
                  </div>
                </div>

                {exportConfig.format === "csv" && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Group By
                    </label>
                    <select
                      value={exportConfig.groupBy}
                      onChange={(e) =>
                        setExportConfig({
                          ...exportConfig,
                          groupBy: e.target.value as any,
                        })
                      }
                      className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="none">No grouping</option>
                      <option value="day">By day</option>
                      <option value="service">By service</option>
                      <option value="model">By model</option>
                    </select>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>Export includes:</p>
                  <ul className="mt-1 text-xs list-disc list-inside">
                    <li>
                      Date range: {filters.startDate || "All time"} to{" "}
                      {filters.endDate || "Present"}
                    </li>
                    {filters.service && <li>Service: {filters.service}</li>}
                    {filters.model && <li>Model: {filters.model}</li>}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="mr-2 w-4 h-4" />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
