import React from 'react';
import { FiCheckCircle, FiClock, FiLoader, FiAlertCircle, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

interface FeatureExtractionStatusProps {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    extractedAt?: Date;
    usageStats?: {
        checksPerformed: number;
        tokensSaved: number;
        costSaved: number;
    };
    onRetry?: () => void;
}

export const FeatureExtractionStatus: React.FC<FeatureExtractionStatusProps> = ({
    status,
    extractedAt,
    usageStats,
    onRetry,
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: FiClock,
                    color: 'text-warning-600 dark:text-warning-400',
                    bgColor: 'bg-warning-50 dark:bg-warning-900/20',
                    borderColor: 'border-warning-200 dark:border-warning-800',
                    label: 'Extraction Pending',
                    description: 'Feature extraction will begin shortly',
                };
            case 'processing':
                return {
                    icon: FiLoader,
                    color: 'text-info-600 dark:text-info-400',
                    bgColor: 'bg-info-50 dark:bg-info-900/20',
                    borderColor: 'border-info-200 dark:border-info-800',
                    label: 'Processing',
                    description: 'AI is analyzing the reference image...',
                    animate: true,
                };
            case 'completed':
                return {
                    icon: FiCheckCircle,
                    color: 'text-success-600 dark:text-success-400',
                    bgColor: 'bg-success-50 dark:bg-success-900/20',
                    borderColor: 'border-success-200 dark:border-success-800',
                    label: 'Extraction Complete',
                    description: extractedAt
                        ? `Completed ${new Date(extractedAt).toLocaleDateString()}`
                        : 'Successfully extracted features',
                };
            case 'failed':
                return {
                    icon: FiAlertCircle,
                    color: 'text-danger-600 dark:text-danger-400',
                    bgColor: 'bg-danger-50 dark:bg-danger-900/20',
                    borderColor: 'border-danger-200 dark:border-danger-800',
                    label: 'Extraction Failed',
                    description: 'Failed to extract features from reference image',
                };
            default:
                return {
                    icon: FiClock,
                    color: 'text-gray-600 dark:text-gray-400',
                    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
                    borderColor: 'border-gray-200 dark:border-gray-800',
                    label: 'Unknown Status',
                    description: '',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`glass rounded-xl p-4 border ${config.borderColor} ${config.bgColor}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    <Icon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color} ${config.animate ? 'animate-spin' : ''
                            }`}
                    />
                    <div className="flex-1">
                        <h4 className={`font-display font-semibold ${config.color}`}>
                            {config.label}
                        </h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {config.description}
                        </p>

                        {/* Cost Savings Display */}
                        {status === 'completed' && usageStats && usageStats.checksPerformed > 0 && (
                            <div className="mt-3 pt-3 border-t border-success-200/50 dark:border-success-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiDollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
                                    <span className="text-sm font-display font-semibold text-success-700 dark:text-success-300">
                                        Cost Savings
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Checks
                                        </p>
                                        <p className="text-lg font-display font-bold text-success-700 dark:text-success-300">
                                            {usageStats.checksPerformed}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Tokens Saved
                                        </p>
                                        <p className="text-lg font-display font-bold text-success-700 dark:text-success-300">
                                            {usageStats.tokensSaved.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Cost Saved
                                        </p>
                                        <p className="text-lg font-display font-bold text-success-700 dark:text-success-300">
                                            ${usageStats.costSaved.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No Usage Yet Message */}
                        {status === 'completed' && usageStats && usageStats.checksPerformed === 0 && (
                            <div className="mt-3 pt-3 border-t border-success-200/50 dark:border-success-800/50">
                                <p className="text-xs text-success-600 dark:text-success-400">
                                    Ready to save costs! Start checking compliance to see savings.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Retry Button for Failed Status */}
                {status === 'failed' && onRetry && (
                    <button
                        onClick={onRetry}
                        className="btn-icon-sm btn-icon-secondary ml-2"
                        title="Retry extraction"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

