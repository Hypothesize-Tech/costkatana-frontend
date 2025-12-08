import React, { useState, useEffect } from 'react';
import {
    PresentationChartBarIcon,
    ArrowPathIcon,
    PlusIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { GoogleConnection } from '../../../services/google.service';

interface SlideViewerProps {
    connection: GoogleConnection;
    presentationId?: string;
}

interface Presentation {
    presentationId: string;
    title: string;
    slides?: Array<{ objectId: string }>;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ connection, presentationId }) => {
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (presentationId) {
            loadPresentation();
        }
    }, [connection, presentationId]);

    const loadPresentation = async () => {
        if (!presentationId) return;

        try {
            setLoading(true);
            const response = await fetch(
                `/api/google/slides/${presentationId}/thumbnails?connectionId=${connection._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setPresentation(result.data);
            }
        } catch (error) {
            console.error('Failed to load presentation:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <PresentationChartBarIcon className="w-5 h-5" />
                        Presentations
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadPresentation}
                            disabled={loading || !presentationId}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Presentation Content */}
            <div className="flex-1 overflow-auto p-4">
                {!presentationId ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                        <PresentationChartBarIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Select or create a presentation to view slides</p>
                        <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Create New Presentation
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : !presentation ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <PresentationChartBarIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Presentation not found</p>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">
                                {presentation.title || 'Untitled Presentation'}
                            </h4>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                {presentation.slides?.length || 0} slides
                            </p>
                        </div>

                        {/* Slide Thumbnails */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {presentation.slides?.map((slide, index) => (
                                <div
                                    key={slide.objectId}
                                    className="aspect-video rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800 flex items-center justify-center hover:border-primary-600 transition-colors cursor-pointer"
                                >
                                    <div className="text-center">
                                        <PresentationChartBarIcon className="w-8 h-8 mx-auto mb-2 text-secondary-400" />
                                        <span className="text-sm text-secondary-600 dark:text-secondary-400">
                                            Slide {index + 1}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {presentationId && (
                <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export to PDF
                    </button>
                    <a
                        href={`https://docs.google.com/presentation/d/${presentationId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        Open in Google Slides
                    </a>
                </div>
            )}
        </div>
    );
};

