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
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const UsageExport: React.FC<UsageExportProps> = ({ filters = {}, isOpen: controlledIsOpen, onClose, trigger }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(false);

  const showModal = controlledIsOpen !== undefined ? controlledIsOpen : internalShowModal;
  const setShowModal = controlledIsOpen !== undefined ? (onClose || (() => { })) : setInternalShowModal;
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
      {trigger ? (
        <div onClick={() => setShowModal(true)}>{trigger}</div>
      ) : controlledIsOpen === undefined ? (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center btn btn-secondary"
        >
          <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
          Export
        </button>
      ) : null}

      {showModal && (
        <div className="overflow-y-auto fixed inset-0 z-[100]">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/50 z-[100]"
              onClick={() => setShowModal(false)}
            />

            <div className="relative z-[101] p-4 sm:p-6 w-full max-w-md rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                  <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">
                  Export Usage Data
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {(["csv", "json", "pdf"] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() =>
                          setExportConfig({
                            ...exportConfig,
                            format: format as "csv" | "json" | "excel",
                          })
                        }
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95 ${exportConfig.format === format
                          ? "bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40"
                          : "glass border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-600 dark:text-secondary-300 hover:border-[#06ec9e]/50 hover:shadow-md"
                          }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                    Options
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 transition-all duration-300 cursor-pointer glass hover:border-[#06ec9e]/50 hover:bg-[#06ec9e]/5 dark:hover:bg-[#06ec9e]/10">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeMetadata}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includeMetadata: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-[#06ec9e] border-primary-300 dark:border-primary-700 focus:ring-[#06ec9e] focus:ring-2 [touch-action:manipulation]"
                      />
                      <span className="ml-3 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                        Include metadata
                      </span>
                    </label>
                    <label className="flex items-center p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 transition-all duration-300 cursor-pointer glass hover:border-[#06ec9e]/50 hover:bg-[#06ec9e]/5 dark:hover:bg-[#06ec9e]/10">
                      <input
                        type="checkbox"
                        checked={exportConfig.includePrompts}
                        onChange={(e) =>
                          setExportConfig({
                            ...exportConfig,
                            includePrompts: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-[#06ec9e] border-primary-300 dark:border-primary-700 focus:ring-[#06ec9e] focus:ring-2 [touch-action:manipulation]"
                      />
                      <span className="ml-3 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                        Include prompts & responses
                      </span>
                    </label>
                  </div>
                </div>

                {exportConfig.format === "csv" && (
                  <div>
                    <label className="block mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                    >
                      <option value="none">No grouping</option>
                      <option value="day">By day</option>
                      <option value="service">By service</option>
                      <option value="model">By model</option>
                    </select>
                  </div>
                )}

                <div className="p-3 sm:p-4 bg-gradient-to-r rounded-xl border border-primary-200/30 dark:border-primary-500/20 glass from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
                  <p className="mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">Export includes:</p>
                  <ul className="space-y-1.5 text-xs text-secondary-600 dark:text-secondary-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#06ec9e] rounded-full"></span>
                      Date range: {filters.startDate || "All time"} to{" "}
                      {filters.endDate || "Present"}
                    </li>
                    {filters.service && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Service: {filters.service}
                      </li>
                    )}
                    {filters.model && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#009454] rounded-full"></span>
                        Model: {filters.model}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t border-primary-200/30 dark:border-primary-700/30">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation]"
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-5 h-5" />
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
