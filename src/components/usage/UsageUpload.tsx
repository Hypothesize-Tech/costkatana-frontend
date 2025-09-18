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
}

export const UsageUpload: React.FC<UsageUploadProps> = ({
  onUploadComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary inline-flex items-center"
      >
        <CloudArrowUpIcon className="h-5 w-5 mr-2" />
        Import Usage
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <div className="inline-block align-bottom glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"></div>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold gradient-text-primary">
                  Import Usage Data
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-primary-300/50 transition-all duration-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${isDragging
                  ? "border-primary-500 bg-gradient-to-r from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 shadow-lg"
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
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary" />
                    <p className="mt-2 text-sm text-light-text-primary dark:text-dark-text-primary">
                      Drag and drop your file here, or{" "}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-300"
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      CSV, JSON, or Excel files up to 10MB
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-4 glass rounded-xl border border-primary-200/30">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-primary-500" />
                      <div className="ml-3 text-left">
                        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          {file.name}
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-1 rounded-lg text-light-text-tertiary dark:text-dark-text-tertiary hover:text-error-500 hover:bg-error-50/50 dark:hover:bg-error-900/20 transition-all duration-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Template Download */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-300"
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
                      <ExclamationCircleIcon className="h-5 w-5 text-warning-500" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-success-500" />
                    )}
                    <div className="ml-3 flex-1">
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

            <div className="glass bg-gradient-to-r from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20 px-6 py-4 border-t border-primary-200/30 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="btn-primary w-full sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-secondary mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
              >
                {uploadResult ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
        </div >
      )}
    </>
  );
};
