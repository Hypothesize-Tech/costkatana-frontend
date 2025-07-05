import React, { useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { PromptTemplate } from '../../types/promptTemplate.types';

interface DuplicateTemplateModalProps {
    template: PromptTemplate;
    onClose: () => void;
    onSubmit: (templateData: any) => void;
}

export const DuplicateTemplateModal: React.FC<DuplicateTemplateModalProps> = ({
    template,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState({
        name: `${template.name} (Copy)`,
        description: template.description || '',
        content: template.content,
        category: template.category,
        variables: template.variables || [],
        metadata: {
            tags: template.metadata.tags || [],
            language: template.metadata.language || 'en',
            estimatedTokens: template.metadata.estimatedTokens,
            recommendedModel: template.metadata.recommendedModel || ''
        },
        sharing: {
            visibility: 'private' as const, // Always start as private for duplicates
            allowFork: template.sharing.allowFork
        }
    });

    const [loading, setLoading] = useState(false);

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'coding', label: 'Coding' },
        { value: 'writing', label: 'Writing' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'creative', label: 'Creative' },
        { value: 'business', label: 'Business' },
        { value: 'custom', label: 'Custom' }
    ];

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error duplicating template:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Duplicate Template">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <FiCopy className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                            Duplicating "{template.name}"
                        </h3>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                            This will create a copy of the template with all its content and variables.
                            You can modify the details below before creating the duplicate.
                        </p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Template Details
                    </h3>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Template Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter template name"
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
                            placeholder="Describe your template"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Content Preview
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            Template Content:
                        </div>
                        <div className="overflow-y-auto p-3 max-h-32 font-mono text-sm text-gray-900 bg-white rounded border dark:text-gray-100 dark:bg-gray-700">
                            {formData.content}
                        </div>
                    </div>

                    {formData.variables.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                Variables ({formData.variables.length}):
                            </div>
                            <div className="space-y-2">
                                {formData.variables.map((variable, index) => (
                                    <div key={index} className="flex gap-2 items-center text-sm">
                                        <span className="px-2 py-1 font-mono text-blue-800 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-200">
                                            {variable.name}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            ({variable.type})
                                        </span>
                                        {variable.required && (
                                            <span className="text-xs text-red-600 dark:text-red-400">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sharing Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Sharing Settings
                    </h3>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Visibility
                        </label>
                        <select
                            value={formData.sharing.visibility}
                            onChange={(e) => handleNestedInputChange(['sharing', 'visibility'], e.target.value)}
                            className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="private">Private</option>
                            <option value="project">Project</option>
                            <option value="organization">Organization</option>
                            <option value="public">Public</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Duplicated templates start as private by default for security.
                        </p>
                    </div>

                    <div>
                        <label className="flex gap-2 items-center">
                            <input
                                type="checkbox"
                                checked={formData.sharing.allowFork}
                                onChange={(e) => handleNestedInputChange(['sharing', 'allowFork'], e.target.checked)}
                                className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Allow others to fork this template
                            </span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FiCopy className="w-4 h-4" />
                                Create Duplicate
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}; 