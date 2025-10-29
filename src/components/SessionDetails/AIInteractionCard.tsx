import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AIInteraction } from '../../types/sessionReplay.types';

interface Props {
    interaction: AIInteraction;
    isExpanded: boolean;
    onToggle: () => void;
}

export const AIInteractionCard: React.FC<Props> = ({ interaction, isExpanded, onToggle }) => {
    return (
        <div className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-3 bg-white dark:bg-secondary-800">
            <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-2 flex-wrap">
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                    )}
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        {new Date(interaction.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                        {interaction.model}
                    </span>
                    {interaction.provider && (
                        <span className="text-xs px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded">
                            {interaction.provider}
                        </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                        {interaction.tokens?.input || 0}↑ {interaction.tokens?.output || 0}↓
                    </span>
                    <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                        ${interaction.cost?.toFixed(4) || '0.0000'}
                    </span>
                </div>
                <span className="text-xs text-secondary-400 ml-2 flex-shrink-0">
                    {interaction.latency}ms
                </span>
            </div>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    <div>
                        <div className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1">
                            Prompt
                        </div>
                        <pre className="text-xs bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">
                            {interaction.prompt}
                        </pre>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1">
                            Response
                        </div>
                        <pre className="text-xs bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">
                            {interaction.response}
                        </pre>
                    </div>
                    {interaction.parameters && Object.keys(interaction.parameters).length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1">
                                Parameters
                            </div>
                            <pre className="text-xs bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(interaction.parameters, null, 2)}
                            </pre>
                        </div>
                    )}
                    {interaction.requestMetadata && Object.keys(interaction.requestMetadata).length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1">
                                Request Metadata
                            </div>
                            <pre className="text-xs bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(interaction.requestMetadata, null, 2)}
                            </pre>
                        </div>
                    )}
                    {interaction.responseMetadata && Object.keys(interaction.responseMetadata).length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1">
                                Response Metadata
                            </div>
                            <pre className="text-xs bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(interaction.responseMetadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

