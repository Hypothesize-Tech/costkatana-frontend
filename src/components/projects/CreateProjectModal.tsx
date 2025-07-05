import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Modal } from '../common/Modal';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (projectData: any) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    isOpen,
    onClose,
    onCreate
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: {
            amount: 1000,
            period: 'monthly' as 'monthly' | 'yearly',
            alerts: {
                enabled: true,
                thresholds: [50, 80, 100]
            }
        },
        members: [''],
        tags: [''],
        settings: {
            costOptimization: {
                enabled: true,
                autoApply: false,
                strategies: ['context_trimming', 'prompt_compression']
            },
            notifications: {
                budgetAlerts: true,
                weeklyReports: true,
                monthlyReports: true
            }
        }
    });

    const [loading, setLoading] = useState(false);

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

    const handleArrayChange = (field: 'members' | 'tags', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field: 'members' | 'tags') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field: 'members' | 'tags', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Transform the data to match backend expectations
            const cleanData = {
                name: formData.name,
                description: formData.description,
                tags: formData.tags.filter(tag => tag.trim() !== ''),
                budget: {
                    amount: formData.budget.amount,
                    period: formData.budget.period,
                    startDate: new Date(),
                    currency: 'USD',
                    alerts: formData.budget.alerts.enabled
                        ? formData.budget.alerts.thresholds.map(threshold => ({
                            threshold,
                            type: 'both' as const,
                            recipients: []
                        }))
                        : []
                },
                settings: {
                    enablePromptLibrary: formData.settings.costOptimization.enabled,
                    enableCostAllocation: true,
                    requireApprovalAbove: formData.budget.amount * 0.1,
                    ...formData.settings
                }
            };

            await onCreate(cleanData);

            // Reset form
            setFormData({
                name: '',
                description: '',
                budget: {
                    amount: 1000,
                    period: 'monthly',
                    alerts: {
                        enabled: true,
                        thresholds: [50, 80, 100]
                    }
                },
                members: [''],
                tags: [''],
                settings: {
                    costOptimization: {
                        enabled: true,
                        autoApply: false,
                        strategies: ['context_trimming', 'prompt_compression']
                    },
                    notifications: {
                        budgetAlerts: true,
                        weeklyReports: true,
                        monthlyReports: true
                    }
                }
            });
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                </div>

                {/* Budget Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Budget Settings
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Budget Amount ($)
                            </label>
                            <input
                                type="number"
                                value={formData.budget.amount}
                                onChange={(e) => handleNestedInputChange(['budget', 'amount'], Number(e.target.value))}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                min="1"
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
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Team Members
                    </h3>

                    {formData.members.map((member, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="email"
                                value={member}
                                onChange={(e) => handleArrayChange('members', index, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter email address"
                            />
                            {formData.members.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('members', index)}
                                    className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                >
                                    <FiMinus />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => addArrayItem('members')}
                        className="flex gap-2 items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                        <FiPlus /> Add Member
                    </button>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Tags
                    </h3>

                    {formData.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter tag"
                            />
                            {formData.tags.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('tags', index)}
                                    className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                >
                                    <FiMinus />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => addArrayItem('tags')}
                        className="flex gap-2 items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                        <FiPlus /> Add Tag
                    </button>
                </div>

                {/* Settings */}
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
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.name.trim()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}; 