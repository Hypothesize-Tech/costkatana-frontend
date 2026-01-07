import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    TableCellsIcon,
    CodeBracketIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface MongoDBResultViewerProps {
    messageId: string; // messageId is part of props
    data: any;
    initialViewType: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'text' | 'error' | 'empty' | 'explain';
    onViewTypeChange: (
        newType:
            | 'table'
            | 'json'
            | 'schema'
            | 'stats'
            | 'chart'
            | 'text'
            | 'error'
            | 'empty'
            | 'explain'
    ) => void;
}

export const MongoDBResultViewer: React.FC<MongoDBResultViewerProps> = ({
    messageId,
    data,
    initialViewType,
    onViewTypeChange,
}) => {
    const [viewType, setViewType] = useState(initialViewType);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Update viewType state when initialViewType prop changes (e.g., when loading history)
    React.useEffect(() => {
        if (initialViewType) {
            setViewType(initialViewType);
        }
    }, [initialViewType, messageId]); // Also add messageId to dep to reset when switching messages

    const handleViewTypeChange = (newType: typeof viewType) => {
        setViewType(newType);
        onViewTypeChange(newType);
    };

    // Export functions, now use messageId to produce unique filenames
    const getExportFilename = (base: string) => {
        const id = messageId ? `-${messageId}` : '';
        return `mongodb-results${id}${base}`;
    };

    const exportAsJSON = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadFile(blob, getExportFilename('.json'));
        setShowExportMenu(false);
    };

    const exportAsCSV = () => {
        const csv = generateCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, getExportFilename('.csv'));
        setShowExportMenu(false);
    };

    const exportAsExcel = () => {
        try {
            // Extract documents from various possible structures
            let documents: any[] = [];

            if (data.documents && Array.isArray(data.documents)) {
                documents = data.documents;
            } else if (data.results && Array.isArray(data.results)) {
                documents = data.results;
            } else if (Array.isArray(data)) {
                documents = data;
            } else if (typeof data === 'object' && data !== null) {
                documents = [data];
            }

            if (documents.length === 0) {
                alert('No data to export');
                setShowExportMenu(false);
                return;
            }

            // Flatten nested objects for Excel (Excel doesn't handle nested objects well)
            const flattenedDocuments = documents.map(doc => {
                const flattened: any = {};
                const flatten = (obj: any, prefix = '') => {
                    Object.keys(obj).forEach(key => {
                        const value = obj[key];
                        const newKey = prefix ? `${prefix}.${key}` : key;

                        if (value === null || value === undefined) {
                            flattened[newKey] = '';
                        } else if (Array.isArray(value)) {
                            flattened[newKey] = JSON.stringify(value);
                        } else if (
                            typeof value === 'object' &&
                            value.constructor === Object
                        ) {
                            flatten(value, newKey);
                        } else {
                            flattened[newKey] = value;
                        }
                    });
                };
                flatten(doc);
                return flattened;
            });

            // Create a workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(flattenedDocuments);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'MongoDB Results');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
                cellStyles: true,
            });

            // Create blob and download
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            downloadFile(blob, getExportFilename('.xlsx'));
            setShowExportMenu(false);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel. Please try again.');
            setShowExportMenu(false);
        }
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const generateCSV = (data: any): string => {
        let documents: any[] = [];

        // Extract documents from various possible structures
        if (data.documents && Array.isArray(data.documents)) {
            documents = data.documents;
        } else if (data.results && Array.isArray(data.results)) {
            documents = data.results;
        } else if (Array.isArray(data)) {
            documents = data;
        } else if (typeof data === 'object' && data !== null) {
            documents = [data];
        }

        if (documents.length === 0) {
            return '';
        }

        // Get all unique keys from all documents
        const keys = Array.from(
            new Set(documents.flatMap(doc => Object.keys(doc)))
        );

        // CSV header
        let csv = keys.map(key => `"${key}"`).join(',') + '\n';

        // CSV rows
        documents.forEach(doc => {
            const row = keys.map(key => {
                const value = doc[key];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') {
                    const jsonStr = JSON.stringify(value).replace(/"/g, '""');
                    return `"${jsonStr}"`;
                }
                const str = String(value).replace(/"/g, '""');
                return `"${str}"`;
            });
            csv += row.join(',') + '\n';
        });

        return csv;
    };

    const renderTable = () => {
        if (!data || !Array.isArray(data)) {
            return (
                <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                    No data to display
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                    No results found
                </div>
            );
        }

        // Get all unique keys from all objects
        const keys = Array.from(
            new Set(data.flatMap(item => Object.keys(item)))
        ).slice(0, 10); // Limit to 10 columns

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                    <thead className="bg-secondary-50 dark:bg-secondary-800">
                        <tr>
                            {keys.map(key => (
                                <th
                                    key={key}
                                    className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
                                >
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-secondary-900/50 divide-y divide-secondary-200 dark:divide-secondary-700">
                        {data.slice(0, 50).map((item, rowIndex) => (
                            <tr
                                key={`${messageId}-${rowIndex}`} // use messageId in React row key for uniqueness
                                className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                            >
                                {keys.map(key => (
                                    <td
                                        key={key}
                                        className="px-4 py-3 text-sm text-secondary-900 dark:text-secondary-100"
                                    >
                                        {renderCellValue(item[key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length > 50 && (
                    <div className="text-center py-4 text-sm text-secondary-600 dark:text-secondary-400">
                        Showing 50 of {data.length} results
                    </div>
                )}
            </div>
        );
    };

    const renderCellValue = (value: any): React.ReactNode => {
        if (value === null || value === undefined) {
            return <span className="text-secondary-400 italic">null</span>;
        }
        if (typeof value === 'object') {
            return (
                <code className="text-xs">
                    {JSON.stringify(value).substring(0, 50)}...
                </code>
            );
        }
        if (typeof value === 'boolean') {
            return (
                <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {String(value)}
                </span>
            );
        }
        return String(value).substring(0, 100);
    };

    const renderJSON = () => {
        return (
            <div className="bg-secondary-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                <pre className="text-sm text-green-400 font-mono" data-message-id={messageId}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        );
    };

    const renderSchema = () => {
        if (!data || typeof data !== 'object') {
            return (
                <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                    Invalid schema data
                </div>
            );
        }

        const renderSchemaNode = (obj: any, depth: number = 0): React.ReactNode => {
            if (typeof obj !== 'object' || obj === null) {
                return null;
            }

            return (
                <div className="space-y-2">
                    {Object.entries(obj).map(
                        ([key, value]: [string, any]) => (
                            <div
                                key={`${messageId}-schema-${depth}-${key}`}
                                style={{ marginLeft: `${depth * 20}px` }}
                                className="py-1"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                                        {key}
                                    </span>
                                    {value.type && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            {value.type}
                                        </span>
                                    )}
                                    {value.nullable !== undefined && (
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                value.nullable
                                                    ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                    : 'bg-green-500/10 text-green-600 dark:text-green-400'
                                            }`}
                                        >
                                            {value.nullable ? 'nullable' : 'required'}
                                        </span>
                                    )}
                                </div>
                                {value.description && (
                                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                        {value.description}
                                    </p>
                                )}
                                {value.fields &&
                                    renderSchemaNode(value.fields, depth + 1)}
                            </div>
                        )
                    )}
                </div>
            );
        };

        return (
            <div className="overflow-auto max-h-[600px]" data-message-id={messageId}>
                {renderSchemaNode(data.schema || data)}
            </div>
        );
    };

    const renderStats = () => {
        if (!data || typeof data !== 'object') {
            return (
                <div className="text-center py-8 text-secondary-600 dark:text-secondary-400">
                    No stats available
                </div>
            );
        }

        const stats = data.stats || data;
        const statEntries = Object.entries(stats).filter(
            ([_, value]) => typeof value === 'number' || typeof value === 'string'
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statEntries.map(([key, value]) => (
                    <div
                        key={`${messageId}-stat-${key}`}
                        className="glass rounded-lg p-4 border border-primary-200/30 dark:border-primary-500/20"
                    >
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                            {key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                            {typeof value === 'number' && value > 1024 * 1024
                                ? `${(value / 1024 / 1024).toFixed(2)} MB`
                                : typeof value === 'number' && value > 1024
                                ? `${(value / 1024).toFixed(2)} KB`
                                : (value as string | number).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderChart = () => {
        return (
            <div className="text-center py-12 text-secondary-600 dark:text-secondary-400">
                <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Chart visualization coming soon</p>
                <p className="text-sm">
                    This feature will automatically generate charts from numeric data
                </p>
            </div>
        );
    };

    const renderContent = () => {
        switch (viewType) {
            case 'table':
                return renderTable();
            case 'json':
                return renderJSON();
            case 'schema':
                return renderSchema();
            case 'stats':
                return renderStats();
            case 'chart':
                return renderChart();
            default:
                return renderJSON();
        }
    };

    // Helper function for the themed export icon bg
    const exportButtonClasses =
        'flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors';

    // Styled export menu button for consistency with your app theme
    const exportMenuButtonClasses =
        'w-full px-4 py-2 flex items-center gap-2 text-left text-sm hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-colors text-secondary-700 dark:text-secondary-200';

    return (
        <div className="space-y-4" data-message-id={messageId}>
            {/* View Type Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewTypeChange('table')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewType === 'table'
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                        }`}
                        title="Table View"
                        data-message-id={messageId}
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleViewTypeChange('json')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewType === 'json'
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                        }`}
                        title="JSON View"
                        data-message-id={messageId}
                    >
                        <CodeBracketIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleViewTypeChange('schema')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewType === 'schema'
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                        }`}
                        title="Schema View"
                        data-message-id={messageId}
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleViewTypeChange('stats')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewType === 'stats'
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                        }`}
                        title="Stats View"
                        data-message-id={messageId}
                    >
                        <ChartBarIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Export Button */}
                {
                    <div className="relative" data-message-id={messageId}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className={exportButtonClasses}
                            data-message-id={messageId}
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Export
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-xl py-2 z-10">
                                <button
                                    onClick={exportAsJSON}
                                    className={exportMenuButtonClasses}
                                    data-message-id={messageId}
                                >
                                    <DocumentTextIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                    Export as JSON
                                </button>
                                <button
                                    onClick={exportAsCSV}
                                    className={exportMenuButtonClasses}
                                    data-message-id={messageId}
                                >
                                    <TableCellsIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={exportAsExcel}
                                    className={exportMenuButtonClasses}
                                    data-message-id={messageId}
                                >
                                    <DocumentDuplicateIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                    Export as Excel
                                </button>
                            </div>
                        )}
                    </div>
                }
            </div>

            {/* Content */}
            <div className="border border-primary-200/30 dark:border-primary-500/20 rounded-lg overflow-hidden" data-message-id={messageId}>
                {renderContent()}
            </div>
        </div>
    );
};
