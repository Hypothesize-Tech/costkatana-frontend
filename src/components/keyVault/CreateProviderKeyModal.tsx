import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { KeyVaultService, CreateProviderKeyRequest } from '../../services/keyVault.service';

interface CreateProviderKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const providerOptions = [
    { value: 'openai', label: 'OpenAI', icon: '🤖', placeholder: 'sk-...' },
    { value: 'anthropic', label: 'Anthropic', icon: '🧠', placeholder: 'sk-ant-...' },
    { value: 'google', label: 'Google AI', icon: '🔍', placeholder: 'AIza...' },
    { value: 'cohere', label: 'Cohere', icon: '💬', placeholder: 'co-...' },
    { value: 'aws-bedrock', label: 'AWS Bedrock', icon: '☁️', placeholder: 'AKIA...' },
    { value: 'deepseek', label: 'DeepSeek', icon: '🔍', placeholder: 'sk-...' },
    { value: 'groq', label: 'Groq', icon: '⚡', placeholder: 'gsk_...' }
];

export const CreateProviderKeyModal: React.FC<CreateProviderKeyModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState<CreateProviderKeyRequest>({
        name: '',
        provider: 'openai',
        apiKey: '',
        description: ''
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createProviderKeyMutation = useMutation({
        mutationFn: KeyVaultService.createProviderKey,
        onSuccess: () => {
            onSuccess();
            resetForm();
        },
        onError: (error: any) => {
            console.error('Failed to create provider key:', error);
            setErrors({
                general: error.response?.data?.error || 'Failed to create provider key'
            });
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            provider: 'openai',
            apiKey: '',
            description: ''
        });
        setErrors({});
        setShowApiKey(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.apiKey.trim()) {
            newErrors.apiKey = 'API key is required';
        } else {
            // Basic validation for different providers
            const selectedProvider = providerOptions.find(p => p.value === formData.provider);
            if (selectedProvider?.placeholder && !formData.apiKey.startsWith(selectedProvider.placeholder.split('...')[0])) {
                newErrors.apiKey = `API key should start with "${selectedProvider.placeholder.split('...')[0]}"`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            createProviderKeyMutation.mutate(formData);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    const selectedProvider = providerOptions.find(p => p.value === formData.provider);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-white rounded-md text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Add Provider Key
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Store your master API key from an AI provider securely in the vault.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Production-OpenAI-Master-Key"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Provider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Provider *
                                    </label>
                                    <select
                                        value={formData.provider}
                                        onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {providerOptions.map((provider) => (
                                            <option key={provider.value} value={provider.value}>
                                                {provider.icon} {provider.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        API Key *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={formData.apiKey}
                                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={selectedProvider?.placeholder || 'Enter your API key'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showApiKey ? (
                                                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.apiKey && (
                                        <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Your API key will be encrypted and stored securely.
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Brief description of this provider key..."
                                    />
                                </div>

                                {/* General Error */}
                                {errors.general && (
                                    <div className="rounded-md bg-red-50 p-4">
                                        <div className="text-sm text-red-700">{errors.general}</div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createProviderKeyMutation.isPending}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createProviderKeyMutation.isPending ? 'Creating...' : 'Create Provider Key'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};