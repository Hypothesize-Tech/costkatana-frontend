import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { KeyVaultService, CreateProviderKeyRequest } from '../../services/keyVault.service';

interface CreateProviderKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const providerOptions = [
  { value: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { value: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { value: 'google', label: 'Google AI', placeholder: 'AIza...' },
  { value: 'cohere', label: 'Cohere', placeholder: 'co-...' },
  { value: 'aws-bedrock', label: 'AWS Bedrock', placeholder: 'AKIA...' },
  { value: 'deepseek', label: 'DeepSeek', placeholder: 'sk-...' },
  { value: 'grok', label: 'GroK', placeholder: 'gsk_...' }
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
      <div className="flex items-center justify-center min-h-screen pt-4 px-3 sm:px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom glass rounded-xl sm:rounded-2xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-6 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-h-[90vh] overflow-y-auto">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn w-8 h-8 sm:w-9 sm:h-9 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="text-center sm:text-left mb-4 sm:mb-6 pr-8 sm:pr-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                      Add Provider Key
                    </h3>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Store your master API key from an AI provider securely in the vault.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name */}
                <div>
                  <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                  <label className="block font-display font-semibold gradient-text-primary mb-2">
                    Provider *
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                    className="input w-full"
                  >
                    {providerOptions.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                      className="btn absolute inset-y-0 right-0 pr-3 flex items-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 transition-colors duration-300"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.apiKey && (
                    <p className="mt-2 text-sm gradient-text-danger">{errors.apiKey}</p>
                  )}
                  <div className="glass p-3 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl mt-2">
                    <p className="text-xs font-body text-success-600 dark:text-success-400 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Your API key will be encrypted and stored securely.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                  <div className="glass p-4 rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-danger/10 dark:bg-gradient-danger/20">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center shadow-lg">
                        <AlertCircle className="h-3 w-3 text-white" />
                      </div>
                      <div className="font-body text-sm gradient-text-danger">{errors.general}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-primary-200/30">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-ghost text-sm sm:text-base w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProviderKeyMutation.isPending}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                  >
                    {createProviderKeyMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" />
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