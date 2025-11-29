import React, { useState, useRef } from "react";
import { billingService } from "../../services/billing.service";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'google-ai' | 'auto'>('auto');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'json') {
      setError('Only CSV and JSON files are supported');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await billingService.uploadBillingFile(
        file,
        provider === 'auto' ? undefined : provider
      );

      if (result.success) {
        setSuccess(true);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1000);
        }
      } else {
        setError(result.error || 'Failed to upload file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
        <h2 className="mb-4 text-2xl font-bold font-display gradient-text-primary">
          Upload Billing File
        </h2>
        <p className="mb-6 text-secondary-600 dark:text-secondary-300">
          Upload your billing CSV or JSON file from OpenAI, Anthropic, or Google to reconcile with tracked usage.
        </p>

        {/* Provider Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Provider (optional - will auto-detect if not specified)
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-4 py-2 rounded-xl border border-primary-200 dark:border-primary-700 bg-white dark:bg-dark-card text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="auto">Auto-detect</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google-ai">Google AI</option>
          </select>
        </div>

        {/* File Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-primary-300 dark:border-primary-600 bg-white dark:bg-dark-card"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileInputChange}
            className="hidden"
            id="billing-file-input"
          />
          <label
            htmlFor="billing-file-input"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <CloudArrowUpIcon className="w-12 h-12 mb-4 text-primary-500" />
            <p className="mb-2 text-lg font-semibold text-secondary-900 dark:text-white">
              Drag and drop your billing file here
            </p>
            <p className="mb-4 text-sm text-secondary-600 dark:text-secondary-300">
              or click to browse
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Supported formats: CSV, JSON (Max 10MB)
            </p>
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-4 rounded-lg border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800">
                <CloudArrowUpIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg border border-danger-200 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/20">
            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 rounded-lg border border-success-200 dark:border-success-700 bg-success-50 dark:bg-success-900/20">
            <p className="text-sm text-success-600 dark:text-success-400">
              File uploaded successfully! Processing has started.
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 w-full px-6 py-3 rounded-xl btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <LoadingSpinner />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Upload and Process</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

