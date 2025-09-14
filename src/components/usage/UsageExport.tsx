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
        className="btn-secondary inline-flex items-center"
      >
        <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
        Export
      </button>

      {showModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <div className="relative p-6 w-full max-w-md glass rounded-xl border border-accent-200/30 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
              <h3 className="mb-4 text-lg font-display font-bold gradient-text-primary">
                Export Usage Data
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
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
                        className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${exportConfig.format === format
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "glass border border-accent-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:border-primary-300/50 hover:shadow-md"
                          }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 glass rounded-xl border border-accent-200/30 hover:border-primary-300/50 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeMetadata}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includeMetadata: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-500 rounded border-accent-300 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Include metadata
                      </span>
                    </label>
                    <label className="flex items-center p-3 glass rounded-xl border border-accent-200/30 hover:border-primary-300/50 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportConfig.includePrompts}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includePrompts: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-500 rounded border-accent-300 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Include prompts & responses
                      </span>
                    </label>
                  </div>
                </div>

                {exportConfig.format === "csv" && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
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
                      className="block py-3 pr-10 pl-4 mt-1 w-full text-sm rounded-xl glass border border-accent-200/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-light-text-primary dark:text-dark-text-primary bg-light-bg-100/50 dark:bg-dark-bg-100/50"
                    >
                      <option value="none">No grouping</option>
                      <option value="day">By day</option>
                      <option value="service">By service</option>
                      <option value="model">By model</option>
                    </select>
                  </div>
                )}

                <div className="p-4 glass rounded-xl border border-accent-200/30 bg-gradient-to-r from-primary-50/20 to-secondary-50/20 dark:from-primary-900/20 dark:to-secondary-900/20">
                  <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Export includes:</p>
                  <ul className="text-xs space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></span>
                      Date range: {filters.startDate || "All time"} to{" "}
                      {filters.endDate || "Present"}
                    </li>
                    {filters.service && (
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full mr-2"></span>
                        Service: {filters.service}
                      </li>
                    )}
                    {filters.model && (
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-accent-400 rounded-full mr-2"></span>
                        Model: {filters.model}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
