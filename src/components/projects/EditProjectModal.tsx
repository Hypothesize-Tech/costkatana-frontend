import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiSave } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Project } from '../../types/project.types';

interface EditProjectModalProps {
    project: Project;
    onClose: () => void;
    onSubmit: (projectId: string, projectData: any) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
    project,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || '',
        budget: {
            amount: project.budget?.amount || 0,
            period: project.budget?.period || 'monthly',
            alerts: [
                { threshold: 50, enabled: true },
                { threshold: 80, enabled: true },
                { threshold: 100, enabled: true }
            ]
        },
        tags: project.tags || [''],
        settings: {
            costOptimization: {
                enabled: project.settings?.costOptimization?.enabled || false,
                autoApply: project.settings?.costOptimization?.autoApply || false,
                strategies: project.settings?.costOptimization?.strategies || [],
                level: project.settings?.costOptimization?.level || 'low'
            },
            notifications: {
                budgetAlerts: project.settings?.notifications?.budgetAlerts || true,
                weeklyReports: project.settings?.notifications?.weeklyReports || false,
                monthlyReports: project.settings?.notifications?.monthlyReports || false
            }
        }
    });

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Check for changes
    useEffect(() => {
        const hasChanged =
            formData.name !== project.name ||
            formData.description !== (project.description || '') ||
            formData.budget.amount !== (project.budget?.amount || 0) ||
            formData.budget.period !== (project.budget?.period || 'monthly') ||
            JSON.stringify(formData.budget.alerts) !== JSON.stringify([
                { threshold: 50, enabled: true },
                { threshold: 80, enabled: true },
                { threshold: 100, enabled: true }
            ]) ||
            JSON.stringify(formData.tags) !== JSON.stringify(project.tags || []) ||
            JSON.stringify(formData.settings) !== JSON.stringify(project.settings || {});

        setHasChanges(hasChanged);
    }, [formData, project]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (path: string[], value: any) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current: any = newData;

            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }

            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const handleTagChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.map((tag, i) => i === index ? value : tag)
        }));
    };

    const addTag = () => {
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, '']
        }));
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleAlertChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            budget: {
                ...prev.budget,
                alerts: prev.budget.alerts.map((alert, i) =>
                    i === index ? { ...alert, [field]: value } : alert
                )
            }
        }));
    };

    const addAlert = () => {
        setFormData(prev => ({
            ...prev,
            budget: {
                ...prev.budget,
                alerts: [...prev.budget.alerts, { threshold: 90, enabled: true }]
            }
        }));
    };

    const removeAlert = (index: number) => {
        setFormData(prev => ({
            ...prev,
            budget: {
                ...prev.budget,
                alerts: prev.budget.alerts.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            // Format data to match backend expectations
            const cleanedData = {
                name: formData.name,
                description: formData.description,
                tags: formData.tags.filter(tag => tag.trim() !== ''),
                budget: {
                    amount: formData.budget.amount,
                    period: formData.budget.period,
                    startDate: new Date(), // Required field
                    currency: 'USD', // Required field
                    alerts: formData.budget.alerts
                        .filter(alert => alert.enabled)
                        .map(alert => ({
                            threshold: alert.threshold,
                            type: 'both' as const,
                            recipients: []
                        }))
                },
                settings: {
                    requireApprovalAbove: undefined,
                    allowedModels: undefined,
                    maxTokensPerRequest: undefined,
                    enablePromptLibrary: formData.settings.costOptimization.enabled,
                    enableCostAllocation: formData.settings.notifications.budgetAlerts
                }
            };

            await onSubmit(project._id, cleanedData);
            onClose();
        } catch (error) {
            console.error('Error updating project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Edit Project" size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Basic Information
                        </h3>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Describe your project"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tags
                            </label>
                            <div className="space-y-2">
                                {formData.tags.map((tag, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tag}
                                            onChange={(e) => handleTagChange(index, e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Enter tag"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <FiMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="flex gap-2 items-center px-3 py-1 text-sm text-blue-600 rounded-lg transition-colors dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add Tag
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Budget Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Budget Configuration
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Budget Amount ($) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.budget.amount}
                                    onChange={(e) => handleNestedInputChange(['budget', 'amount'], parseFloat(e.target.value) || 0)}
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Budget Period
                                </label>
                                <select
                                    value={formData.budget.period}
                                    onChange={(e) => handleNestedInputChange(['budget', 'period'], e.target.value)}
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="one-time">One-time</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Budget Alerts
                            </label>
                            <div className="space-y-2">
                                {formData.budget.alerts.map((alert, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            value={alert.threshold}
                                            onChange={(e) => handleAlertChange(index, 'threshold', parseInt(e.target.value) || 0)}
                                            className="px-3 py-2 w-20 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            min="1"
                                            max="100"
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">% of budget</span>
                                        <label className="flex gap-2 items-center">
                                            <input
                                                type="checkbox"
                                                checked={alert.enabled}
                                                onChange={(e) => handleAlertChange(index, 'enabled', e.target.checked)}
                                                className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeAlert(index)}
                                            className="p-1 text-red-600 rounded transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <FiMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addAlert}
                                    className="flex gap-2 items-center px-3 py-1 text-sm text-blue-600 rounded-lg transition-colors dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add Alert
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Project Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Project Settings
                        </h3>

                        <div className="space-y-3">
                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.costOptimization.enabled}
                                    onChange={(e) => handleNestedInputChange(['settings', 'costOptimization', 'enabled'], e.target.checked)}
                                    className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Enable cost optimization
                                </span>
                            </label>

                            {formData.settings.costOptimization.enabled && (
                                <div className="ml-6">
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Optimization Level
                                    </label>
                                    <select
                                        value={formData.settings.costOptimization.level}
                                        onChange={(e) => handleNestedInputChange(['settings', 'costOptimization', 'level'], e.target.value)}
                                        className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="aggressive">Aggressive</option>
                                    </select>
                                </div>
                            )}

                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.notifications.budgetAlerts}
                                    onChange={(e) => handleNestedInputChange(['settings', 'notifications', 'budgetAlerts'], e.target.checked)}
                                    className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Budget alerts
                                </span>
                            </label>

                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.notifications.weeklyReports}
                                    onChange={(e) => handleNestedInputChange(['settings', 'notifications', 'weeklyReports'], e.target.checked)}
                                    className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Weekly reports
                                </span>
                            </label>

                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.notifications.monthlyReports}
                                    onChange={(e) => handleNestedInputChange(['settings', 'notifications', 'monthlyReports'], e.target.checked)}
                                    className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Monthly reports
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
                        {hasChanges ? (
                            <span className="text-amber-600 dark:text-amber-400">
                                You have unsaved changes
                            </span>
                        ) : (
                            <span>No changes made</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !hasChanges}
                            className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}; 