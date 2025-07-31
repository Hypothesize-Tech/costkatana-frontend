// src/components/usage/UsageUpload.tsx
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
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <CloudArrowUpIcon className="h-5 w-5 mr-2" />
        Import Usage
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Import Usage Data
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* File Upload Area */}
                <div
                  className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300"
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
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop your file here, or{" "}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        CSV, JSON, or Excel files up to 10MB
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Template Download */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Download CSV template
                  </button>
                </div>

                {/* Upload Result */}
                {uploadResult && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      uploadResult.failed > 0 ? "bg-yellow-50" : "bg-green-50"
                    }`}
                  >
                    <div className="flex">
                      {uploadResult.failed > 0 ? (
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      )}
                      <div className="ml-3 flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            uploadResult.failed > 0
                              ? "text-yellow-800"
                              : "text-green-800"
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

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
