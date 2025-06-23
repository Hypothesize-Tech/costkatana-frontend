// src/components/usage/UsageExport.tsx
import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { usageService } from '@/services/usage.service';

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
        format: 'csv' as 'csv' | 'json' | 'pdf',
        includeMetadata: true,
        includePrompts: false,
        groupBy: 'none' as 'none' | 'day' | 'service' | 'model',
    });

    const { showNotification } = useNotifications();

    const handleExport = async (): Promise<void> => {
        setIsExporting(true);
        try {
            const blob: Blob = await usageService.exportUsage({
                format: exportConfig.format as 'csv' | 'json' | 'pdf',
                startDate: filters.startDate,
                endDate: filters.endDate,
                service: filters.service,
                model: filters.model,
            });

            const filename = 'usage-export-' + new Date().toISOString() + '.' + exportConfig.format;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showNotification('Export completed successfully!', 'success');
            setShowModal(false);
        } catch (error) {
            showNotification('Failed to export data', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Usage Data</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Export Format
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['csv', 'json', 'pdf'] as const).map((format) => (
                                            <button
                                                key={format}
                                                onClick={() => setExportConfig({ ...exportConfig, format })}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${exportConfig.format === format
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {format.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Options
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportConfig.includeMetadata}
                                                onChange={(e) => setExportConfig({ ...exportConfig, includeMetadata: e.target.checked })}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Include metadata</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportConfig.includePrompts}
                                                onChange={(e) => setExportConfig({ ...exportConfig, includePrompts: e.target.checked })}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Include prompts & responses</span>
                                        </label>
                                    </div>
                                </div>

                                {exportConfig.format === 'csv' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Group By
                                        </label>
                                        <select
                                            value={exportConfig.groupBy}
                                            onChange={(e) => setExportConfig({ ...exportConfig, groupBy: e.target.value as any })}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                                    <ul className="mt-1 list-disc list-inside text-xs">
                                        <li>Date range: {filters.startDate || 'All time'} to {filters.endDate || 'Present'}</li>
                                        {filters.service && <li>Service: {filters.service}</li>}
                                        {filters.model && <li>Model: {filters.model}</li>}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <>
                                            <LoadingSpinner size="small" className="mr-2" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
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