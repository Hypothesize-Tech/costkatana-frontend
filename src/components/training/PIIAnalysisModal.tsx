import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShieldExclamationIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';
import { trainingService, TrainingDataset, PIIDetectionBatch } from '../../services/training.service';

interface PIIAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: TrainingDataset | null;
    onDatasetUpdated: (dataset: TrainingDataset) => void;
}

export const PIIAnalysisModal: React.FC<PIIAnalysisModalProps> = ({
    isOpen,
    onClose,
    dataset,
    onDatasetUpdated,
}) => {
    const [analysisResult, setAnalysisResult] = useState<PIIDetectionBatch | null>(null);
    const [loading, setLoading] = useState(false);
    const [sanitizing, setSanitizing] = useState(false);

    useEffect(() => {
        if (isOpen && dataset) {
            analyzePII();
        }
    }, [isOpen, dataset]);

    const analyzePII = async () => {
        if (!dataset) return;

        setLoading(true);
        try {
            const result = await trainingService.datasets.analyzePII(dataset._id);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Failed to analyze PII:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSanitize = async (action: 'mask' | 'remove' | 'replace') => {
        if (!dataset) return;

        setSanitizing(true);
        try {
            const updatedDataset = await trainingService.datasets.sanitizePII(dataset._id, action);
            onDatasetUpdated(updatedDataset);

            // Re-analyze after sanitization
            await analyzePII();

            // Show success message
            alert(`Successfully ${action}ed PII data. Dataset has been updated.`);
        } catch (error) {
            console.error(`Failed to ${action} PII:`, error);
            alert(`Failed to ${action} PII data. Please try again.`);
        } finally {
            setSanitizing(false);
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-100 border-green-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getPiiTypeColor = (type: string) => {
        const colors = {
            email: 'bg-blue-100 text-blue-800',
            phone: 'bg-purple-100 text-purple-800',
            ssn: 'bg-red-100 text-red-800',
            creditCard: 'bg-orange-100 text-orange-800',
            name: 'bg-green-100 text-green-800',
            address: 'bg-indigo-100 text-indigo-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <ShieldExclamationIcon className="h-6 w-6 text-red-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            PII Analysis - {dataset?.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Analyzing dataset for PII...</p>
                            <p className="text-sm text-gray-500">This may take a moment for large datasets</p>
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-6">
                            {/* Overall Risk Assessment */}
                            <div className={`p-4 rounded-lg border ${getRiskColor(analysisResult.overallRiskAssessment)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium">
                                        Overall Risk: {analysisResult.overallRiskAssessment.toUpperCase()}
                                    </h3>
                                    <div className="text-sm">
                                        {analysisResult.totalWithPII} of {analysisResult.totalProcessed} items contain PII
                                        ({Math.round((analysisResult.totalWithPII / analysisResult.totalProcessed) * 100)}%)
                                    </div>
                                </div>

                                {analysisResult.overallRiskAssessment === 'high' && (
                                    <div className="text-sm">
                                        ⚠️ High-risk PII detected. Immediate action recommended before training.
                                    </div>
                                )}
                            </div>

                            {/* PII Type Breakdown */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">PII Types Detected</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(analysisResult.summary.piiTypeBreakdown).map(([type, count]) => (
                                        <span
                                            key={type}
                                            className={`px-2 py-1 rounded text-sm ${getPiiTypeColor(type)}`}
                                        >
                                            {type.toUpperCase()}: {count}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {analysisResult.summary.recommendedActions.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                                    <ul className="space-y-2">
                                        {analysisResult.summary.recommendedActions.map((recommendation, index) => (
                                            <li key={index} className="text-sm text-blue-800">
                                                • {recommendation}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sanitization Actions */}
                            {analysisResult.totalWithPII > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="font-medium text-gray-900 mb-4">Sanitization Options</h4>
                                    <p className="text-gray-600 mb-4">
                                        Choose how to handle the detected PII in your dataset:
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <EyeSlashIcon className="h-5 w-5 text-blue-500" />
                                                <h5 className="font-medium">Mask PII</h5>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Replace PII with placeholder tokens (e.g., [EMAIL], [PHONE])
                                            </p>
                                            <button
                                                onClick={() => handleSanitize('mask')}
                                                disabled={sanitizing}
                                                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {sanitizing ? 'Processing...' : 'Mask PII'}
                                            </button>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <TrashIcon className="h-5 w-5 text-red-500" />
                                                <h5 className="font-medium">Remove Items</h5>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Remove all items that contain PII from the dataset
                                            </p>
                                            <button
                                                onClick={() => handleSanitize('remove')}
                                                disabled={sanitizing}
                                                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {sanitizing ? 'Processing...' : 'Remove Items'}
                                            </button>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <ShieldExclamationIcon className="h-5 w-5 text-green-500" />
                                                <h5 className="font-medium">Smart Replace</h5>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Replace PII with realistic synthetic alternatives
                                            </p>
                                            <button
                                                onClick={() => handleSanitize('replace')}
                                                disabled={sanitizing}
                                                className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {sanitizing ? 'Processing...' : 'Smart Replace'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* High-Risk Items Preview */}
                            {analysisResult.summary.highRiskItems > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-800 mb-2">
                                        High-Risk Items: {analysisResult.summary.highRiskItems}
                                    </h4>
                                    <p className="text-sm text-red-700">
                                        These items contain sensitive information like SSN, credit cards, or multiple PII types.
                                        Review and sanitize before training.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShieldExclamationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Failed to analyze PII. Please try again.</p>
                            <button
                                onClick={analyzePII}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Retry Analysis
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
