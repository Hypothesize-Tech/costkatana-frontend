import React from 'react';
import { BookOpenIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Define ChatSource interface locally
interface ChatSource {
    title: string;
    url: string;
    type: 'web' | 'document' | 'api' | 'database';
    description?: string;
}

interface SourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
    sources: ChatSource[];
}

const getSourceIcon = (type: string) => {
    switch (type) {
        case 'web':
            return '🌐';
        case 'document':
            return '📄';
        case 'api':
            return '🔌';
        case 'database':
            return '🗄️';
        default:
            return '📋';
    }
};

const getSourceTypeStyle = (type: string) => {
    switch (type) {
        case 'web':
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
        case 'document':
            return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
        case 'api':
            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
        default:
            return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
};

export const SourcesModal: React.FC<SourcesModalProps> = ({
    isOpen,
    onClose,
    sources
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
                    <h3 className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary inline-flex items-center gap-2">
                        <BookOpenIcon className="w-5 h-5" />
                        Sources & References
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {sources.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                No sources available for this response.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sources.map((source, index) => (
                                <div
                                    key={index}
                                    className="glass p-4 rounded-xl border border-primary-200/30 hover:border-primary-300/50 transition-all duration-300 group"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Source Icon */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-accent/20 flex items-center justify-center text-lg">
                                            {getSourceIcon(source.type)}
                                        </div>

                                        {/* Source Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
                                                        {source.title}
                                                    </h4>
                                                    {source.description && (
                                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-2">
                                                            {source.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                        <span className={`px-2 py-1 rounded-full font-medium ${getSourceTypeStyle(source.type)}`}>
                                                            {source.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => window.open(source.url, '_blank')}
                                                    className="flex-shrink-0 p-2 rounded-lg bg-gradient-primary text-white hover:scale-105 transition-all duration-300 shadow-lg glow-primary"
                                                    title="Open source in new tab"
                                                >
                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* URL */}
                                            <div className="mt-2 p-2 bg-primary-50/50 dark:bg-primary-900/30 rounded-lg border border-primary-200/20">
                                                <p className="text-xs font-mono text-light-text-muted dark:text-dark-text-muted break-all">
                                                    {source.url}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-primary-200/30">
                    <button
                        onClick={onClose}
                        className="btn-primary px-6 py-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SourcesModal;
