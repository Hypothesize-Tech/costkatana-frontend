import React, { useState, useEffect } from 'react';
import {
    ClipboardDocumentListIcon,
    ArrowPathIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { GoogleConnection } from '../../../services/google.service';

interface FormViewerProps {
    connection: GoogleConnection;
    formId?: string;
}

interface FormResponse {
    responseId: string;
    createTime: string;
    answers: Record<string, any>;
}

export const FormViewer: React.FC<FormViewerProps> = ({ connection, formId }) => {
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (formId) {
            loadFormResponses();
        }
    }, [connection, formId]);

    const loadFormResponses = async () => {
        if (!formId) return;

        try {
            setLoading(true);
            const response = await fetch(
                `/api/google/forms/${formId}/responses?connectionId=${connection._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setResponses(result.data || []);
            }
        } catch (error) {
            console.error('Failed to load form responses:', error);
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
                        <ClipboardDocumentListIcon className="w-5 h-5" />
                        Forms
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadFormResponses}
                            disabled={loading || !formId}
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

            {/* Form Responses */}
            <div className="flex-1 overflow-auto p-4">
                {!formId ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                        <ClipboardDocumentListIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Select or create a form to view responses</p>
                        <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Create New Form
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : responses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <ClipboardDocumentListIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No responses yet</p>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                            <div className="flex items-center gap-2 text-secondary-900 dark:text-white">
                                <ChartBarIcon className="w-5 h-5" />
                                <span className="font-semibold">{responses.length} Responses</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {responses.map((response, index) => (
                                <div
                                    key={response.responseId}
                                    className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-secondary-900 dark:text-white">
                                            Response #{index + 1}
                                        </span>
                                        <span className="text-xs text-secondary-500">
                                            {new Date(response.createTime).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                                        {Object.keys(response.answers || {}).length} answers
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {formId && (
                <div className="p-4 border-t border-primary-200/30 dark:border-primary-500/20 flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        Export Responses
                    </button>
                    <a
                        href={`https://docs.google.com/forms/d/${formId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        Open in Google Forms
                    </a>
                </div>
            )}
        </div>
    );
};

