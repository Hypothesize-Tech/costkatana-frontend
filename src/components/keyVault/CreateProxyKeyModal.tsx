import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { KeyVaultService, CreateProxyKeyRequest, ProviderKey } from '../../services/keyVault.service';

interface CreateProxyKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerKeys: ProviderKey[];
}

export const CreateProxyKeyModal: React.FC<CreateProxyKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  providerKeys
}) => {
  const [formData, setFormData] = useState<CreateProxyKeyRequest>({
    name: '',
    providerKeyId: '',
    description: '',
    permissions: ['read'],
    budgetLimit: undefined,
    dailyBudgetLimit: undefined,
    monthlyBudgetLimit: undefined,
    rateLimit: undefined,
    allowedIPs: [],
    allowedDomains: []
  });
  const [newIP, setNewIP] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProxyKeyMutation = useMutation({
    mutationFn: KeyVaultService.createProxyKey,
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Failed to create proxy key:', error);
      setErrors({
        general: error.response?.data?.error || 'Failed to create proxy key'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      providerKeyId: '',
      description: '',
      permissions: ['read'],
      budgetLimit: undefined,
      dailyBudgetLimit: undefined,
      monthlyBudgetLimit: undefined,
      rateLimit: undefined,
      allowedIPs: [],
      allowedDomains: []
    });
    setNewIP('');
    setNewDomain('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.providerKeyId) {
      newErrors.providerKeyId = 'Provider key is required';
    }

    if (formData.budgetLimit !== undefined && formData.budgetLimit <= 0) {
      newErrors.budgetLimit = 'Budget limit must be greater than 0';
    }

    if (formData.dailyBudgetLimit !== undefined && formData.dailyBudgetLimit <= 0) {
      newErrors.dailyBudgetLimit = 'Daily budget limit must be greater than 0';
    }

    if (formData.monthlyBudgetLimit !== undefined && formData.monthlyBudgetLimit <= 0) {
      newErrors.monthlyBudgetLimit = 'Monthly budget limit must be greater than 0';
    }

    if (formData.rateLimit !== undefined && formData.rateLimit <= 0) {
      newErrors.rateLimit = 'Rate limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Clean up undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
      ) as CreateProxyKeyRequest;

      createProxyKeyMutation.mutate(cleanedData);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...(formData.permissions || []), permission as any]
      });
    } else {
      setFormData({
        ...formData,
        permissions: (formData.permissions || []).filter(p => p !== permission)
      });
    }
  };

  const addIP = () => {
    if (newIP.trim() && !formData.allowedIPs?.includes(newIP.trim())) {
      setFormData({
        ...formData,
        allowedIPs: [...(formData.allowedIPs || []), newIP.trim()]
      });
      setNewIP('');
    }
  };

  const removeIP = (ip: string) => {
    setFormData({
      ...formData,
      allowedIPs: (formData.allowedIPs || []).filter(i => i !== ip)
    });
  };

  const addDomain = () => {
    if (newDomain.trim() && !formData.allowedDomains?.includes(newDomain.trim())) {
      setFormData({
        ...formData,
        allowedDomains: [...(formData.allowedDomains || []), newDomain.trim()]
      });
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData({
      ...formData,
      allowedDomains: (formData.allowedDomains || []).filter(d => d !== domain)
    });
  };

  if (!isOpen) return null;

  const selectedProviderKey = providerKeys.find(pk => pk._id === formData.providerKeyId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
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
                  Create Proxy Key
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create a controlled access key that provides secure, limited access to your provider keys.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Basic Information</h4>

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
                      placeholder="e.g., WebApp-Backend-Key"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Provider Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Key *
                    </label>
                    <select
                      value={formData.providerKeyId}
                      onChange={(e) => setFormData({ ...formData, providerKeyId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a provider key</option>
                      {providerKeys.map((providerKey) => (
                        <option key={providerKey._id} value={providerKey._id}>
                          {providerKey.name} ({providerKey.provider})
                        </option>
                      ))}
                    </select>
                    {errors.providerKeyId && (
                      <p className="mt-1 text-sm text-red-600">{errors.providerKeyId}</p>
                    )}
                    {selectedProviderKey && (
                      <p className="mt-1 text-xs text-gray-500">
                        This proxy key will use the {selectedProviderKey.provider} API key: {selectedProviderKey.maskedKey}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this proxy key..."
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {['read', 'write', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(formData.permissions || []).includes(permission as any)}
                          onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Limits */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Budget Limits (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Budget ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budgetLimit || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          budgetLimit: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100.00"
                      />
                      {errors.budgetLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.budgetLimit}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Budget ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.dailyBudgetLimit || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dailyBudgetLimit: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10.00"
                      />
                      {errors.dailyBudgetLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.dailyBudgetLimit}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Budget ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthlyBudgetLimit || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          monthlyBudgetLimit: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="300.00"
                      />
                      {errors.monthlyBudgetLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.monthlyBudgetLimit}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rate Limiting */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Rate Limiting (Optional)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requests per minute
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.rateLimit || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        rateLimit: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                    />
                    {errors.rateLimit && (
                      <p className="mt-1 text-sm text-red-600">{errors.rateLimit}</p>
                    )}
                  </div>
                </div>

                {/* Security Restrictions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Security Restrictions (Optional)</h4>

                  {/* Allowed IPs */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed IP Addresses
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="192.168.1.100"
                      />
                      <button
                        type="button"
                        onClick={addIP}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {formData.allowedIPs && formData.allowedIPs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allowedIPs.map((ip) => (
                          <span
                            key={ip}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {ip}
                            <button
                              type="button"
                              onClick={() => removeIP(ip)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allowed Domains */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Domains
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="example.com"
                      />
                      <button
                        type="button"
                        onClick={addDomain}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {formData.allowedDomains && formData.allowedDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allowedDomains.map((domain) => (
                          <span
                            key={domain}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {domain}
                            <button
                              type="button"
                              onClick={() => removeDomain(domain)}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{errors.general}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProxyKeyMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createProxyKeyMutation.isPending ? 'Creating...' : 'Create Proxy Key'}
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