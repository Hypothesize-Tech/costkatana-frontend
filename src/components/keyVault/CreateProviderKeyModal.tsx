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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom card card-gradient rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl backdrop-blur-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-primary-200/30">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                    <span className="text-white text-xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold gradient-text">
                      Add Provider Key
                    </h3>
                  </div>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Store your master API key from an AI provider securely in the vault.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block font-display font-semibold gradient-text mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Production-OpenAI-Master-Key"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm gradient-text-danger">{errors.name}</p>
                  )}
                </div>

                {/* Provider */}
                <div>
                  <label className="block font-display font-semibold gradient-text mb-2">
                    Provider *
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                    className="input w-full"
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
                  <label className="block font-display font-semibold gradient-text mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="input w-full pr-12"
                      placeholder={selectedProvider?.placeholder || 'Enter your API key'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 transition-colors duration-300"
                    >
                      {showApiKey ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.apiKey && (
                    <p className="mt-2 text-sm gradient-text-danger">{errors.apiKey}</p>
                  )}
                  <div className="glass p-3 rounded-xl border border-success-200/30 mt-2">
                    <p className="text-xs font-body text-success-600 dark:text-success-400 flex items-center gap-2">
                      <span className="text-sm">🔒</span>
                      Your API key will be encrypted and stored securely.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-display font-semibold gradient-text mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="input w-full resize-none"
                    placeholder="Brief description of this provider key..."
                  />
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="glass p-4 rounded-xl border border-danger-200/30 bg-gradient-danger/10">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center glow-danger">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <div className="font-body text-sm gradient-text-danger">{errors.general}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-primary-200/30">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-ghost hover:scale-105 transition-transform duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProviderKeyMutation.isPending}
                    className="btn-primary hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {createProviderKeyMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>🔐</span>
                        Create Provider Key
                      </span>
                    )}
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