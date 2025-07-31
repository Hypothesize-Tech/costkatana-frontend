import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { TrainingDataset, trainingService, ExportFormat } from '../../services/training.service';

interface ExportDatasetModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: TrainingDataset | null;
}

const EXPORT_FORMATS = [
    {
        id: 'openai-jsonl',
        name: 'OpenAI JSONL',
        description: 'Compatible with OpenAI fine-tuning API',
        example: '{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}'
    },
    {
        id: 'anthropic-jsonl',
        name: 'Anthropic JSONL',
        description: 'Compatible with Claude fine-tuning',
        example: '{"prompt": "Human: ...\\n\\nAssistant:", "completion": " ..."}'
    },
    {
        id: 'huggingface-jsonl',
        name: 'HuggingFace JSONL',
        description: 'Compatible with HuggingFace transformers',
        example: '{"text": "<|user|>...<|assistant|>...<|end|>", "input": "...", "output": "..."}'
    },
    {
        id: 'custom',
        name: 'Custom JSON',
        description: 'Raw data with all metadata',
        example: '{"requestId": "...", "prompt": "...", "completion": "...", "score": 5, "cost": 0.001}'
    }
];

export const ExportDatasetModal: React.FC<ExportDatasetModalProps> = ({
    isOpen,
    onClose,
    dataset
}) => {
    const [selectedFormat, setSelectedFormat] = useState<string>('openai-jsonl');
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handlePreview = async () => {
        if (!dataset) return;

        try {
            const preview = await trainingService.datasets.previewDataset(dataset._id, selectedFormat);
            setPreviewData(preview);
            setShowPreview(true);
        } catch (error) {
            console.error('Failed to load preview:', error);
        }
    };

    const handleExport = async () => {
        if (!dataset) return;

        setIsExporting(true);
        try {
            const exportFormat: ExportFormat = {
                format: selectedFormat as any,
                includeMetadata
            };

            const blob = await trainingService.datasets.exportDataset(dataset._id, exportFormat);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const extension = selectedFormat.includes('jsonl') ? 'jsonl' : 'json';
            link.download = `${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedFormat}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error('Failed to export dataset:', error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen || !dataset) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Export Dataset
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Export "{dataset.name}" for fine-tuning ({dataset.requestIds.length} requests)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!showPreview ? (
                        <>
                            {/* Format Selection */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Select Export Format</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {EXPORT_FORMATS.map((format) => (
                                        <div
                                            key={format.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedFormat === format.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedFormat(format.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name="format"
                                                    value={format.id}
                                                    checked={selectedFormat === format.id}
                                                    onChange={() => setSelectedFormat(format.id)}
                                                    className="text-blue-600"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{format.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                                                {format.example}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Export Options</h3>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="includeMetadata"
                                        checked={includeMetadata}
                                        onChange={(e) => setIncludeMetadata(e.target.checked)}
                                        className="text-blue-600"
                                    />
                                    <label htmlFor="includeMetadata" className="text-sm text-gray-700">
                                        Include metadata (request ID, score, cost, tokens)
                                    </label>
                                </div>
                            </div>

                            {/* Dataset Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-gray-900 mb-3">Dataset Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Requests:</span>
                                        <span className="ml-2 font-medium">{dataset.stats.totalRequests}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Avg Score:</span>
                                        <span className="ml-2 font-medium">{dataset.stats.averageScore.toFixed(1)}★</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Tokens:</span>
                                        <span className="ml-2 font-medium">
                                            {dataset.stats.totalTokens > 1000
                                                ? `${(dataset.stats.totalTokens / 1000).toFixed(1)}k`
                                                : dataset.stats.totalTokens
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Cost:</span>
                                        <span className="ml-2 font-medium">
                                            ${dataset.stats.totalCost < 0.01
                                                ? (dataset.stats.totalCost * 1000).toFixed(2) + 'k'
                                                : dataset.stats.totalCost.toFixed(3)
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePreview}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    <EyeIcon className="h-4 w-4" />
                                    <span>Preview</span>
                                </button>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                        disabled={isExporting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isExporting}
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        <span>{isExporting ? 'Exporting...' : 'Export Dataset'}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Preview ({previewData?.format})
                                    </h3>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Back to Export
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                    Showing {previewData?.previewRecords} of {previewData?.totalRecords} records
                                </div>

                                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                        {previewData?.preview?.slice(0, 5).map((record: any) =>
                                            JSON.stringify(record, null, 2)
                                        ).join('\n\n')}
                                    </pre>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isExporting}
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        <span>{isExporting ? 'Exporting...' : 'Export Dataset'}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};