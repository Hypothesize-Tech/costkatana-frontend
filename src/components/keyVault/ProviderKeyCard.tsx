import React from 'react';
import {
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ProviderKey } from '../../services/keyVault.service';

interface ProviderKeyCardProps {
    providerKey: ProviderKey;
    onDelete: () => void;
}

const providerIcons: Record<string, string> = {
    openai: '🤖',
    anthropic: '🧠',
    google: '🔍',
    cohere: '💬',
    'aws-bedrock': '☁️',
    deepseek: '🔍',
    groq: '⚡'
};

const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    cohere: 'Cohere',
    'aws-bedrock': 'AWS Bedrock',
    deepseek: 'DeepSeek',
    groq: 'Groq'
};

export const ProviderKeyCard: React.FC<ProviderKeyCardProps> = ({ providerKey, onDelete }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                        {providerIcons[providerKey.provider] || '🔑'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {providerKey.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {providerNames[providerKey.provider] || providerKey.provider}
                        </p>
                        {providerKey.description && (
                            <p className="text-xs text-gray-400 mt-1">
                                {providerKey.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {providerKey.isActive ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" title="Active" />
                    ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" title="Inactive" />
                    )}
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete provider key"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">API Key:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                        {providerKey.maskedKey}
                    </code>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-700">
                        {formatDate(providerKey.createdAt)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Last Used:</span>
                    <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-700">
                            {formatDate(providerKey.lastUsed)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${providerKey.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {providerKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                        Master Key
                    </span>
                </div>
            </div>
        </div>
    );
};