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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom glass rounded-2xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel px-6 pt-6 pb-6 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost p-2 rounded-lg hover:bg-danger-500/10 hover:text-danger-500 transition-all"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🔑</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold gradient-text-primary">
                      Create Proxy Key
                    </h3>
                  </div>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Create a controlled access key that provides secure, limited access to your provider keys.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    <h4 className="text-lg font-display font-bold gradient-text-primary">Basic Information</h4>
                  </div>

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
                      placeholder="e.g., WebApp-Backend-Key"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm gradient-text-danger">{errors.name}</p>
                    )}
                  </div>

                  {/* Provider Key */}
                  <div>
                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                      Provider Key *
                    </label>
                    <select
                      value={formData.providerKeyId}
                      onChange={(e) => setFormData({ ...formData, providerKeyId: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Select a provider key</option>
                      {providerKeys.map((providerKey) => (
                        <option key={providerKey._id} value={providerKey._id}>
                          {providerKey.name} ({providerKey.provider})
                        </option>
                      ))}
                    </select>
                    {errors.providerKeyId && (
                      <p className="mt-2 text-sm gradient-text-danger">{errors.providerKeyId}</p>
                    )}
                    {selectedProviderKey && (
                      <div className="glass p-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl mt-2">
                        <p className="text-xs font-body text-primary-600 dark:text-primary-400">
                          This proxy key will use the <span className="font-semibold">{selectedProviderKey.provider}</span> API key: <code className="bg-primary-100/50 dark:bg-primary-900/50 px-2 py-1 rounded text-xs">{selectedProviderKey.maskedKey}</code>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="input w-full resize-none"
                      placeholder="Brief description of this proxy key..."
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                    <h4 className="text-lg font-display font-bold gradient-text-primary">Permissions</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['read', 'write', 'admin'].map((permission) => (
                      <label key={permission} className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl cursor-pointer hover:border-primary-300/50 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(formData.permissions || []).includes(permission as any)}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-primary-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="font-display font-semibold gradient-text-primary capitalize">{permission}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Limits */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    <h4 className="text-lg font-display font-bold gradient-text-primary">Budget Limits (Optional)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                        className="input w-full"
                        placeholder="100.00"
                      />
                      {errors.budgetLimit && (
                        <p className="mt-2 text-sm gradient-text-danger">{errors.budgetLimit}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                        className="input w-full"
                        placeholder="10.00"
                      />
                      {errors.dailyBudgetLimit && (
                        <p className="mt-2 text-sm gradient-text-danger">{errors.dailyBudgetLimit}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                        className="input w-full"
                        placeholder="300.00"
                      />
                      {errors.monthlyBudgetLimit && (
                        <p className="mt-2 text-sm gradient-text-danger">{errors.monthlyBudgetLimit}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rate Limiting */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <h4 className="text-lg font-display font-bold gradient-text-primary">Rate Limiting (Optional)</h4>
                  </div>
                  <div>
                    <label className="block font-display font-semibold gradient-text-primary mb-2">
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
                      className="input w-full"
                      placeholder="1000"
                    />
                    {errors.rateLimit && (
                      <p className="mt-2 text-sm gradient-text-danger">{errors.rateLimit}</p>
                    )}
                  </div>
                </div>

                {/* Security Restrictions */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                    <h4 className="text-lg font-display font-bold gradient-text-primary">Security Restrictions (Optional)</h4>
                  </div>

                  {/* Allowed IPs */}
                  <div className="mb-6">
                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                      Allowed IP Addresses
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        className="input flex-1"
                        placeholder="192.168.1.100"
                      />
                      <button
                        type="button"
                        onClick={addIP}
                        className="btn btn-ghost w-12 h-12 flex items-center justify-center"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {formData.allowedIPs && formData.allowedIPs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allowedIPs.map((ip) => (
                          <span
                            key={ip}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-sm"
                          >
                            {ip}
                            <button
                              type="button"
                              onClick={() => removeIP(ip)}
                              className="btn btn-ghost p-1 h-auto min-w-0 text-primary-600 hover:text-danger-500"
                              aria-label="Remove IP"
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
                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                      Allowed Domains
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="input flex-1"
                        placeholder="example.com"
                      />
                      <button
                        type="button"
                        onClick={addDomain}
                        className="btn btn-ghost w-12 h-12 flex items-center justify-center"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {formData.allowedDomains && formData.allowedDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allowedDomains.map((domain) => (
                          <span
                            key={domain}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-sm"
                          >
                            {domain}
                            <button
                              type="button"
                              onClick={() => removeDomain(domain)}
                              className="btn btn-ghost p-1 h-auto min-w-0 text-success-600 hover:text-danger-500"
                              aria-label="Remove domain"
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
                  <div className="glass p-4 rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-danger/10">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center shadow-lg">
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
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProxyKeyMutation.isPending}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createProxyKeyMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>🔑</span>
                        Create Proxy Key
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