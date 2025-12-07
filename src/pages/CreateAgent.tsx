import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheckIcon,
    ArrowLeftIcon,
    CpuChipIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { agentGovernanceService, CreateAgentRequest } from '../services/agentGovernance.service';
import { useToast } from '../hooks/useToast';

export const CreateAgent: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateAgentRequest>({
        agentName: '',
        agentType: 'custom',
        allowedModels: [],
        allowedProviders: [],
        allowedActions: ['read'],
        budgetCapPerRequest: 0.1,
        budgetCapPerDay: 1.0,
        budgetCapPerMonth: 10.0,
        sandboxRequired: true,
        description: '',
    });

    const [modelInput, setModelInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agentName.trim()) {
            showToast('Please enter an agent name', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await agentGovernanceService.createAgent(formData);
            showToast('Agent created successfully!', 'success');
            navigate(`/agent-governance/${response.data.agent.agentId}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create agent'
                : 'Failed to create agent';
            showToast(errorMessage, 'error');
            console.error('Error creating agent:', error);
        } finally {
            setLoading(false);
        }
    };

    const addModel = () => {
        if (modelInput.trim() && !formData.allowedModels?.includes(modelInput.trim())) {
            setFormData({
                ...formData,
                allowedModels: [...(formData.allowedModels || []), modelInput.trim()],
            });
            setModelInput('');
        }
    };

    const removeModel = (model: string) => {
        setFormData({
            ...formData,
            allowedModels: formData.allowedModels?.filter((m) => m !== model),
        });
    };

    const addProvider = () => {
        if (providerInput.trim() && !formData.allowedProviders?.includes(providerInput.trim())) {
            setFormData({
                ...formData,
                allowedProviders: [...(formData.allowedProviders || []), providerInput.trim()],
            });
            setProviderInput('');
        }
    };

    const removeProvider = (provider: string) => {
        setFormData({
            ...formData,
            allowedProviders: formData.allowedProviders?.filter((p) => p !== provider),
        });
    };

    const toggleAction = (action: string) => {
        const actions = formData.allowedActions || [];
        if (actions.includes(action)) {
            setFormData({
                ...formData,
                allowedActions: actions.filter((a) => a !== action),
            });
        } else {
            setFormData({
                ...formData,
                allowedActions: [...actions, action],
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/agent-governance')}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Agents</span>
                </button>

                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
                            <ShieldCheckIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">
                                Create New Agent
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Configure a new AI agent with governance controls
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Agent Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.agentName}
                                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                    placeholder="e.g., Cost Optimization Agent"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Agent Type *
                                </label>
                                <select
                                    value={formData.agentType}
                                    onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    <option value="recommendation">Recommendation</option>
                                    <option value="github">GitHub</option>
                                    <option value="multiagent">Multi-Agent</option>
                                    <option value="custom">Custom</option>
                                    <option value="workflow">Workflow</option>
                                    <option value="automation">Automation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does this agent do?"
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget Limits */}
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
                            Budget Limits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Per Request ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.budgetCapPerRequest}
                                    onChange={(e) => setFormData({ ...formData, budgetCapPerRequest: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Per Day ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.budgetCapPerDay}
                                    onChange={(e) => setFormData({ ...formData, budgetCapPerDay: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Per Month ($)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={formData.budgetCapPerMonth}
                                    onChange={(e) => setFormData({ ...formData, budgetCapPerMonth: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
                            Permissions
                        </h3>

                        {/* Allowed Models */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Allowed Models
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={modelInput}
                                    onChange={(e) => setModelInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModel())}
                                    placeholder="e.g., gpt-4"
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addModel}
                                    className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.allowedModels?.map((model) => (
                                    <span
                                        key={model}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    >
                                        {model}
                                        <button
                                            type="button"
                                            onClick={() => removeModel(model)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Allowed Providers */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Allowed Providers
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={providerInput}
                                    onChange={(e) => setProviderInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProvider())}
                                    placeholder="e.g., openai, anthropic"
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addProvider}
                                    className="btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.allowedProviders?.map((provider) => (
                                    <span
                                        key={provider}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    >
                                        {provider}
                                        <button
                                            type="button"
                                            onClick={() => removeProvider(provider)}
                                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Allowed Actions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Allowed Actions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['read', 'write', 'delete', 'execute'].map((action) => (
                                    <button
                                        key={action}
                                        type="button"
                                        onClick={() => toggleAction(action)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.allowedActions?.includes(action)
                                            ? 'bg-gradient-primary text-white'
                                            : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {formData.allowedActions?.includes(action) && <CheckCircleIcon className="w-4 h-4 inline mr-1" />}
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
                            Security
                        </h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="sandboxRequired"
                                checked={formData.sandboxRequired}
                                onChange={(e) => setFormData({ ...formData, sandboxRequired: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                            />
                            <label htmlFor="sandboxRequired" className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Require Sandbox Execution</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Recommended: Isolates agent execution for enhanced security
                                </p>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/agent-governance')}
                            disabled={loading}
                            className="flex-1 btn bg-gradient-secondary text-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn bg-gradient-primary text-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CpuChipIcon className="w-5 h-5 mr-2" />
                                    Create Agent
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

