import React, { useState } from 'react';
import {
    ArrowDownTrayIcon,
    DocumentArrowDownIcon,
    TableCellsIcon,
    SparklesIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { AdminDashboardService } from '../../services/adminDashboard.service';
import { useNotification } from '../../contexts/NotificationContext';

interface ExportReportsProps {
    startDate?: string;
    endDate?: string;
    sections?: string[];
}

export const ExportReports: React.FC<ExportReportsProps> = ({
    startDate,
    endDate,
    sections,
}) => {
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<string | null>(null);
    const { showNotification } = useNotification();

    const handleExport = async (format: 'csv' | 'excel' | 'json') => {
        try {
            setExporting(true);
            setExportFormat(format);

            const reportConfig = {
                format,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                sections,
                includeCharts: false,
            };

            const reportData = await AdminDashboardService.exportReport(reportConfig);

            // Create blob and download
            let blob: Blob;
            let filename: string;
            let mimeType: string;

            if (format === 'json') {
                blob = new Blob([reportData as string], { type: 'application/json' });
                filename = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (format === 'csv') {
                blob = new Blob([reportData as string], { type: 'text/csv' });
                filename = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            } else {
                blob = new Blob([reportData as ArrayBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                filename = `admin-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showNotification(`Report exported successfully as ${format.toUpperCase()}`, 'success');
        } catch (error: any) {
            console.error('Error exporting report:', error);
            showNotification(
                error.response?.data?.message || 'Failed to export report',
                'error'
            );
        } finally {
            setExporting(false);
            setExportFormat(null);
        }
    };

    const exportButtons = [
        {
            format: 'csv' as const,
            label: 'Export CSV',
            icon: TableCellsIcon,
            gradient: 'from-blue-500 to-blue-600',
            description: 'Comma-separated values',
        },
        {
            format: 'excel' as const,
            label: 'Export Excel',
            icon: ArrowDownTrayIcon,
            gradient: 'from-green-500 to-green-600',
            description: 'Excel spreadsheet',
        },
        {
            format: 'json' as const,
            label: 'Export JSON',
            icon: DocumentArrowDownIcon,
            gradient: 'from-purple-500 to-purple-600',
            description: 'JSON data format',
        },
    ];

    return (
        <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-display font-bold gradient-text">
                        Export Reports
                    </h3>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                        Download dashboard data
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                {exportButtons.map((button) => {
                    const Icon = button.icon;
                    const isExporting = exporting && exportFormat === button.format;

                    return (
                        <button
                            key={button.format}
                            onClick={() => handleExport(button.format)}
                            disabled={exporting}
                            className="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-display font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
                            style={{
                                background: exporting && exportFormat === button.format
                                    ? `linear-gradient(135deg, var(--primary-500), var(--primary-600))`
                                    : `linear-gradient(135deg, ${button.gradient.split(' ')[1]}, ${button.gradient.split(' ')[3]})`
                            }}
                            title={button.description}
                        >
                            {isExporting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-white">Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Icon className="w-5 h-5 text-white" />
                                    <span className="text-white">{button.label}</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
