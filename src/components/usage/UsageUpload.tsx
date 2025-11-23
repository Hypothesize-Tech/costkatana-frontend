import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { uploadService } from "../../services/upload.service";
import { useNotifications } from "@/contexts/NotificationContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface UsageUploadProps {
  onUploadComplete?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const UsageUpload: React.FC<UsageUploadProps> = ({
  onUploadComplete,
  isOpen: controlledIsOpen,
  onClose,
  trigger,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledIsOpen !== undefined ? (onClose || (() => { })) : setInternalIsOpen;
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotifications();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!uploadService.validateFileType(selectedFile, "usage")) {
      showNotification(
        "Invalid file type. Please upload a CSV, JSON, or Excel file.",
        "error",
      );
      return;
    }

    if (!uploadService.validateFileSize(selectedFile)) {
      showNotification("File too large. Maximum size is 10MB.", "error");
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadUsageFile(file);
      setUploadResult(result.data);

      if (result.data.failed > 0) {
        showNotification(
          `Upload completed with ${result.data.failed} errors. ${result.data.imported} records imported successfully.`,
          "warning",
        );
      } else {
        showNotification(
          `Successfully imported ${result.data.imported} usage records!`,
          "success",
        );
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      showNotification(
        "Failed to upload file. Please check the format and try again.",
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await uploadService.downloadTemplate("usage", "csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "usage-template.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification("Template downloaded successfully", "success");
    } catch (error) {
      showNotification("Failed to download template", "error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : controlledIsOpen === undefined ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center btn btn-secondary"
        >
          <CloudArrowUpIcon className="mr-2 w-5 h-5" />
          Import Usage
        </button>
      ) : null}

      {isOpen && (
        <div className="overflow-y-auto fixed inset-0 z-[100]">
          <div className="flex justify-center items-end px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 backdrop-blur-sm transition-opacity bg-black/50 z-[100]"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative z-[101] inline-block overflow-hidden text-left align-bottom rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl transition-all transform glass bg-gradient-light-panel dark:bg-gradient-dark-panel sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                      <CloudArrowUpIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">
                      Import Usage Data
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors duration-300 [touch-action:manipulation] active:scale-95"
                  >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* File Upload Area */}
                <div
                  className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${isDragging
                    ? "bg-gradient-to-r shadow-lg border-primary-500 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20"
                    : "border-primary-300/50 glass"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadService.getAcceptedFormats("usage")}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file ? (
                    <>
                      <CloudArrowUpIcon className="mx-auto w-12 h-12 text-secondary-500 dark:text-secondary-400" />
                      <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                        Drag and drop your file here, or{" "}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="font-medium transition-colors duration-300 btn text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                        CSV, JSON, or Excel files up to 10MB
                      </p>
                    </>
                  ) : (
                    <div className="flex justify-between items-center p-4 rounded-xl border glass border-primary-200/30">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-8 h-8 text-primary-500" />
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-secondary-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-1 rounded-lg transition-all duration-300 btn text-secondary-500 dark:text-secondary-400 hover:text-danger-500 dark:hover:text-danger-400 hover:bg-danger-50/50 dark:hover:bg-danger-900/20"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Template Download */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-sm font-medium transition-colors duration-300 btn text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Download CSV template
                  </button>
                </div>

                {/* Upload Result */}
                {uploadResult && (
                  <div
                    className={`mt-6 p-4 glass rounded-xl border ${uploadResult.failed > 0
                      ? "border-warning-300/30 bg-gradient-to-r from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20"
                      : "border-success-300/30 bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20"
                      }`}
                  >
                    <div className="flex">
                      {uploadResult.failed > 0 ? (
                        <ExclamationCircleIcon className="w-5 h-5 text-warning-500" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-success-500" />
                      )}
                      <div className="flex-1 ml-3">
                        <h4
                          className={`text-sm font-medium ${uploadResult.failed > 0
                            ? "text-warning-700 dark:text-warning-300"
                            : "text-success-700 dark:text-success-300"
                            }`}
                        >
                          Upload Complete
                        </h4>
                        <div className="mt-2 text-sm">
                          <p>Processed: {uploadResult.processed} rows</p>
                          <p>Imported: {uploadResult.imported} records</p>
                          {uploadResult.failed > 0 && (
                            <p>Failed: {uploadResult.failed} records</p>
                          )}
                        </div>
                        {uploadResult.errors?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Errors:</p>
                            <ul className="mt-1 text-xs list-disc list-inside">
                              {uploadResult.errors
                                .slice(0, 3)
                                .map((error: any, index: number) => (
                                  <li key={index}>
                                    Row {error.row}: {error.error}
                                  </li>
                                ))}
                              {uploadResult.errors.length > 3 && (
                                <li>
                                  ...and {uploadResult.errors.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r border-t border-primary-200/30 dark:border-primary-700/30 glass from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation]"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5" />
                      Upload
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
                >
                  {uploadResult ? "Close" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
