import React, { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    PlusIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { GoogleConnection, googleService } from '../../../services/google.service';
import { GoogleServiceShimmer } from '../../ui/GoogleServiceShimmer';
import { CreateSheetModal } from '../modals/CreateSheetModal';
import GoogleFileAttachmentService from '../../../services/googleFileAttachment.service';
import googleSheetsLogo from '../../../assets/google-sheets-logo.webp';

interface SheetViewerProps {
    connection: GoogleConnection;
    sheetId?: string;
}

interface GoogleSheet {
    id: string;
    name: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
}

export const SheetViewer: React.FC<SheetViewerProps> = ({ connection, sheetId }) => {
    const [sheets, setSheets] = useState<GoogleSheet[]>([]);
    const [data, setData] = useState<any[][]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);
    const [range, setRange] = useState('Sheet1!A1:Z100');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadSheets();
    }, [connection]);

    useEffect(() => {
        if (sheetId) {
            loadSheetData();
        }
    }, [connection, sheetId]);

    const loadSheets = async () => {
        try {
            setLoading(true);
            const sheetsList = await googleService.listSpreadsheets(connection._id);
            setSheets(sheetsList);
        } catch (error) {
            console.error('Failed to load sheets:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Render selected sheet's grid data if selectedSheet is set
    const renderSelectedSheetData = () => {
        if (!selectedSheet) return null;
        return (
            <div className="p-4 border border-primary-200/30 dark:border-primary-500/20 rounded-lg mb-4">
                <h4 className="mb-2 font-semibold text-secondary-900 dark:text-white">
                    {selectedSheet.name}
                </h4>
                <div className="mb-2 text-sm text-secondary-700 dark:text-secondary-200">
                    <span>Created: {new Date(selectedSheet.createdTime).toLocaleString()}</span>
                    <br />
                    <span>Last Modified: {new Date(selectedSheet.modifiedTime).toLocaleString()}</span>
                    <br />
                    <a
                        href={selectedSheet.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                    >
                        Open Sheet in Google
                    </a>
                </div>
                {data.length === 0 ? (
                    <div className="text-secondary-500 text-sm">No data found for this range/sheet.</div>
                ) : (
                    <div className="overflow-auto max-h-64">
                        <table className="min-w-full table-auto border mb-2 border-primary-100 dark:border-primary-800">
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i}>
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-2 py-1 text-xs border-b border-primary-50 dark:border-primary-800 text-secondary-800 dark:text-secondary-100">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button
                    onClick={() => setSelectedSheet(null)}
                    className="mt-2 px-4 py-1 border border-primary-500 rounded text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                    Close
                </button>
            </div>
        );
    };

    // When a sheet is selected, update URL and load its data (demo)
    const handleSelectSheet = async (sheet: GoogleSheet) => {
        setSelectedSheet(sheet);
        try {
            setLoading(true);
            // For demonstration, a real implementation might update route or browser URL as well.
            const response = await fetch(
                `/api/google/sheets/${sheet.id}/data?connectionId=${connection._id}&range=${range}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setData(result.data.values || []);
            } else {
                setData([]);
            }
        } catch (error) {
            setData([]);
            console.error('Failed to load selected sheet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatWithAI = (sheet: GoogleSheet) => {
        try {
            // Convert GoogleSheet to GoogleFileAttachment format
            const googleFile = {
                id: sheet.id,
                name: sheet.name,
                mimeType: 'application/vnd.google-apps.spreadsheet',
                webViewLink: sheet.webViewLink,
                modifiedTime: sheet.modifiedTime,
                createdTime: sheet.createdTime,
                connectionId: connection._id,
            };
            GoogleFileAttachmentService.navigateToChatWithFile(googleFile, connection);
        } catch (error) {
            console.error('Failed to open chat with sheet:', error);
            // Fallback navigation to chat
            window.location.href = '/chat';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <img src={googleSheetsLogo} alt="Google Sheets" className="w-5 h-5 object-contain" />
                        Sheets
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={selectedSheet ? () => handleSelectSheet(selectedSheet) : loadSheetData}
                            disabled={loading || (!sheetId && !selectedSheet)}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                            title="Create new spreadsheet"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {(sheetId || selectedSheet) && (
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
                            onClick={selectedSheet ? () => handleSelectSheet(selectedSheet) : loadSheetData}
                            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Load
                        </button>
                    </div>
                )}
            </div>

            {/* Selected Sheet Data */}
            {renderSelectedSheetData()}

            {/* Sheets List */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <GoogleServiceShimmer count={6} type="list" />
                ) : sheets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                        <img src={googleSheetsLogo} alt="Google Sheets" className="w-12 h-12 mb-2 opacity-50 object-contain" />
                        <p>No spreadsheets found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Create New Sheet
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sheets.map((sheet) => (
                            <div
                                key={sheet.id}
                                className={`p-4 rounded-lg border ${selectedSheet && selectedSheet.id === sheet.id
                                    ? 'border-primary-600'
                                    : 'border-primary-200/30 dark:border-primary-500/20 hover:border-primary-600'} transition-colors cursor-pointer`}
                                onClick={() => handleSelectSheet(sheet)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-secondary-900 dark:text-white">
                                            {sheet.name}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleChatWithAI(sheet);
                                            }}
                                            className="p-1 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 hover:border-primary-400/50 dark:hover:border-primary-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
                                            title="Chat with AI about this spreadsheet"
                                        >
                                            <div className="bg-gradient-primary p-0.5 rounded glow-primary group-hover:scale-110 transition-transform duration-300">
                                                <ChatBubbleLeftRightIcon className="w-3 h-3 text-white" />
                                            </div>
                                        </button>
                                        <span className="text-xs text-secondary-500">
                                            {new Date(sheet.modifiedTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                    <span>Created: {new Date(sheet.createdTime).toLocaleDateString()}</span>
                                    <a
                                        href={sheet.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Open Sheet
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Create New Sheet
                </button>
                <button
                    onClick={loadSheets}
                    className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Create Sheet Modal */}
            {showCreateModal && (
                <CreateSheetModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    connectionId={connection._id}
                    onSheetCreated={loadSheets}
                />
            )}
        </div>
    );
};
