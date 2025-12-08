import React, { useState, useEffect } from 'react';
import {
    TableCellsIcon,
    ArrowPathIcon,
    PlusIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { GoogleConnection } from '../../../services/google.service';

interface SheetViewerProps {
    connection: GoogleConnection;
    sheetId?: string;
}

export const SheetViewer: React.FC<SheetViewerProps> = ({ connection, sheetId }) => {
    const [data, setData] = useState<any[][]>([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('Sheet1!A1:Z100');

    useEffect(() => {
        if (sheetId) {
            loadSheetData();
        }
    }, [connection, sheetId]);

    const loadSheetData = async () => {
        if (!sheetId) return;

        try {
            setLoading(true);
            const response = await fetch(
                `/api/google/sheets/${sheetId}/data?connectionId=${connection._id}&range=${range}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setData(result.data.values || []);
            }
        } catch (error) {
            console.error('Failed to load sheet data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <TableCellsIcon className="w-5 h-5" />
                        Sheets
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadSheetData}
                            disabled={loading || !sheetId}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {sheetId && (
                    <div className="flex gap-2 items-center">
                        <label className="text-sm text-secondary-600 dark:text-secondary-400">Range:</label>
                        <input
                            type="text"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            placeholder="e.g., Sheet1!A1:Z100"
                            className="flex-1 px-3 py-1 text-sm rounded border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800"
                        />
                        <button
                            onClick={loadSheetData}
                            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Load
                        </button>
                    </div>
                )}
            </div>

            {/* Sheet Data */}
            <div className="flex-1 overflow-auto p-4">
                {!sheetId ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                        <TableCellsIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Select or create a sheet to view data</p>
                        <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Create New Sheet
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <TableCellsIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No data found in sheet</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="min-w-full border-collapse border border-primary-200 dark:border-primary-700">
                            <tbody>
                                {data.slice(0, 20).map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex === 0 ? 'bg-primary-100 dark:bg-primary-900/30' : ''}>
                                        {row.map((cell, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="border border-primary-200 dark:border-primary-700 px-3 py-2 text-sm text-secondary-900 dark:text-white"
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length > 20 && (
                            <p className="text-sm text-secondary-500 mt-2 text-center">
                                Showing first 20 rows of {data.length}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            {sheetId && (
                <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export to CSV
                    </button>
                    <a
                        href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        Open in Google Sheets
                    </a>
                </div>
            )}
        </div>
    );
};

