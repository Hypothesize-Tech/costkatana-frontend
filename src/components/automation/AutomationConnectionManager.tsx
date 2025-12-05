import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
  BoltIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { AutomationConnection, AutomationConnectionFormData, AutomationPlatform } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ZapierSetupGuide } from './ZapierSetupGuide';
import { MakeSetupGuide } from './MakeSetupGuide';
import { N8nSetupGuide } from './N8nSetupGuide';
import { userService } from '../../services/user.service';
import { WorkflowQuotaStatusComponent } from './WorkflowQuotaStatus';

const AutomationConnectionManager: React.FC = () => {
  const [connections, setConnections] = useState<AutomationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [editingConnection, setEditingConnection] = useState<AutomationConnection | null>(null);
  const [formData, setFormData] = useState<AutomationConnectionFormData>({
    platform: 'zapier',
    name: '',
    description: '',
    apiKey: ''
  });
  const [apiKey, setApiKey] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    loadConnections();
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const keys = await userService.getDashboardApiKeys();
      // Note: API keys are only shown once when created
      // User needs to copy it from Settings > API Keys
      // For now, we'll show a message to get it from settings
      if (keys && keys.length > 0) {
        // We can't get the full key, but we can show the masked version
        // User should get the full key from Settings
        setApiKey(''); // Will show message to get from settings
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await automationService.getConnections();
      if (response.success) {
        setConnections(response.data);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      showToast('Failed to load connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name.trim()) {
        showToast('Name is required', 'error');
        return;
      }

      const response = await automationService.createConnection(formData);
      if (response.success) {
        showToast('Connection created successfully', 'success');
        setShowForm(false);
        setFormData({ platform: 'zapier', name: '', description: '', apiKey: '' });
        loadConnections();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create connection', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingConnection) return;

    try {
      const response = await automationService.updateConnection(editingConnection.id, formData);
      if (response.success) {
        showToast('Connection updated successfully', 'success');
        setEditingConnection(null);
        setShowForm(false);
        setFormData({ platform: 'zapier', name: '', description: '', apiKey: '' });
        loadConnections();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update connection', 'error');
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      const response = await automationService.deleteConnection(connectionId);
      if (response.success) {
        showToast('Connection deleted successfully', 'success');
        loadConnections();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete connection', 'error');
    }
  };

  const handleEdit = (connection: AutomationConnection) => {
    setEditingConnection(connection);
    setFormData({
      platform: connection.platform,
      name: connection.name,
      description: connection.description || '',
      apiKey: ''
    });
    setShowForm(true);
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Webhook URL copied to clipboard', 'success');
  };

  const getPlatformColor = (platform: AutomationPlatform) => {
    switch (platform) {
      case 'zapier':
        return 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
      case 'make':
        return 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      case 'n8n':
        return 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700';
      default:
        return 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'inactive':
        return <XCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
            <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
            Automation Connections
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="btn btn-secondary flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm"
          >
            <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{showGuide ? 'Hide' : 'Show'} Setup Guide</span>
            <span className="sm:hidden">{showGuide ? 'Hide' : 'Show'} Guide</span>
          </button>
          <button
            onClick={() => {
              setEditingConnection(null);
              setFormData({ platform: 'zapier', name: '', description: '', apiKey: '' });
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Connection</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Quota Status */}
      <WorkflowQuotaStatusComponent showUpgradeButton={true} />

      {/* Setup Guide */}
      {showGuide && (
        <div className="mt-6">
          {formData.platform === 'zapier' && (
            <ZapierSetupGuide
              connection={connections.find(c => c.platform === 'zapier') || undefined}
              apiKey={apiKey}
            />
          )}
          {formData.platform === 'make' && (
            <MakeSetupGuide
              connection={connections.find(c => c.platform === 'make') || undefined}
              apiKey={apiKey}
            />
          )}
          {formData.platform === 'n8n' && (
            <N8nSetupGuide
              connection={connections.find(c => c.platform === 'n8n') || undefined}
              apiKey={apiKey}
            />
          )}
          {!formData.platform && (
            <ZapierSetupGuide
              connection={connections.find(c => c.platform === 'zapier') || undefined}
              apiKey={apiKey}
            />
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="space-y-6">
          {!editingConnection && (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Before creating a new connection, check your workflow quota status above.
              </p>
            </div>
          )}
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
              {editingConnection ? 'Edit Connection' : 'Create New Connection'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as AutomationPlatform })}
                  className="w-full px-4 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
                  disabled={!!editingConnection}
                >
                  <option value="zapier">Zapier</option>
                  <option value="make">Make</option>
                  <option value="n8n">n8n</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.platform === 'make' ? 'My Make Scenario' :
                      formData.platform === 'n8n' ? 'My n8n Workflow' :
                        'My Zapier Workflow'
                  }
                  className="w-full px-4 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
                />
              </div>
              {!editingConnection && (
                <div>
                  <label className="block text-sm font-body font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    API Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="ck_user_..."
                    className="w-full px-4 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
                  />
                  <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                    Optional: Provide an API key for authentication
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={editingConnection ? handleUpdate : handleCreate}
                  className="btn btn-primary flex-1 px-4 py-2 rounded-xl text-sm sm:text-base"
                >
                  {editingConnection ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingConnection(null);
                    setFormData({ platform: 'zapier', name: '', description: '', apiKey: '' });
                  }}
                  className="btn btn-secondary px-4 py-2 rounded-xl text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <BoltIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#06ec9e] dark:text-emerald-400" />
          </div>
          <p className="text-base sm:text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No connections configured
          </p>
          <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Create your first automation connection to start tracking costs
          </p>
          <button
            onClick={() => {
              setEditingConnection(null);
              setFormData({ platform: 'zapier', name: '', description: '', apiKey: '' });
              setShowForm(true);
            }}
            className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl"
          >
            <PlusIcon className="w-5 h-5" />
            Add Connection
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r ${getPlatformColor(connection.platform)} flex items-center justify-center flex-shrink-0`}>
                    <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary capitalize truncate">
                        {connection.name}
                      </h3>
                      {getStatusIcon(connection.status)}
                    </div>
                    <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary capitalize truncate">
                      {connection.platform}
                      {connection.description && ` • ${connection.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(connection)}
                    className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all"
                  >
                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(connection.id)}
                    className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="mb-4 p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10 bg-white/50 dark:bg-dark-card/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-body font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                      Webhook URL
                    </label>
                    <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary truncate">
                      {connection.webhookUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => copyWebhookUrl(connection.webhookUrl)}
                    className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all flex-shrink-0"
                    title="Copy webhook URL"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Total Cost
                  </div>
                  <div className="text-xs sm:text-sm font-display font-bold gradient-text-primary truncate">
                    {formatCurrency(connection.stats.totalCost)}
                  </div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Requests
                  </div>
                  <div className="text-xs sm:text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {connection.stats.totalRequests.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Tokens
                  </div>
                  <div className="text-xs sm:text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {connection.stats.totalTokens.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Avg Cost
                  </div>
                  <div className="text-xs sm:text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                    {formatCurrency(connection.stats.averageCostPerRequest)}
                  </div>
                </div>
              </div>

              {connection.stats.lastActivityAt && (
                <div className="mt-3 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                  Last activity: {new Date(connection.stats.lastActivityAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationConnectionManager;

