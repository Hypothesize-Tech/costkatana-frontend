import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { TemplateVariable } from '../../types/promptTemplate.types';

interface CreateTemplateModalProps {
    onClose: () => void;
    onSubmit: (templateData: any) => void;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        content: '',
        category: 'general',
        variables: [] as TemplateVariable[],
        metadata: {
            tags: [''],
            language: 'en',
            estimatedTokens: undefined as number | undefined,
            recommendedModel: ''
        },
        sharing: {
            visibility: 'private' as 'private' | 'project' | 'organization' | 'public',
            allowFork: false
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

    const handleTagChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                tags: prev.metadata.tags.map((tag, i) => i === index ? value : tag)
            }
        }));
    };

    const addTag = () => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                tags: [...prev.metadata.tags, '']
            }
        }));
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                tags: prev.metadata.tags.filter((_, i) => i !== index)
            }
        }));
    };

    const handleVariableChange = (index: number, field: keyof TemplateVariable, value: any) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.map((variable, i) =>
                i === index ? { ...variable, [field]: value } : variable
            )
        }));
    };

    const addVariable = () => {
        setFormData(prev => ({
            ...prev,
            variables: [...prev.variables, {
                name: '',
                description: '',
                defaultValue: '',
                required: false,
                type: 'text'
            }]
        }));
    };

    const removeVariable = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index)
        }));
    };

    const extractVariablesFromContent = () => {
        const variablePattern = /\{\{(\w+)\}\}/g;
        const matches = [...formData.content.matchAll(variablePattern)];
        const variableNames = [...new Set(matches.map(match => match[1]))];

        const newVariables = variableNames.map(name => {
            const existing = formData.variables.find(v => v.name === name);
            return existing || {
                name,
                description: '',
                defaultValue: '',
                required: true,
                type: 'text' as const
            };
        });

        setFormData(prev => ({
            ...prev,
            variables: newVariables
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up data
            const cleanData = {
                ...formData,
                metadata: {
                    ...formData.metadata,
                    tags: formData.metadata.tags.filter(tag => tag.trim() !== '')
                }
            };

            await onSubmit(cleanData);

            // Reset form
            setFormData({
                name: '',
                description: '',
                content: '',
                category: 'general',
                variables: [],
                metadata: {
                    tags: [''],
                    language: 'en',
                    estimatedTokens: undefined,
                    recommendedModel: ''
                },
                sharing: {
                    visibility: 'private',
                    allowFork: false
                }
            });
        } catch (error) {
            console.error('Error creating template:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create New Template" size='lg'>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Basic Information
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

                {/* Template Content */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Template Content
                        </h3>
                        <button
                            type="button"
                            onClick={extractVariablesFromContent}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Extract Variables
                        </button>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Prompt Content *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            rows={8}
                            className="px-3 py-2 w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your prompt template. Use {{variable_name}} for variables."
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Use double curly braces for variables: {`{{variable_name}}`}
                        </p>
                    </div>
                </div>

                {/* Variables */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Variables
                        </h3>
                        <button
                            type="button"
                            onClick={addVariable}
                            className="flex gap-2 items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                            <FiPlus /> Add Variable
                        </button>
                    </div>

                    {formData.variables.map((variable, index) => (
                        <div key={index} className="p-4 space-y-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    Variable {index + 1}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => removeVariable(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <FiMinus />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={variable.name}
                                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                                        className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="variable_name"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Type
                                    </label>
                                    <select
                                        value={variable.type || 'text'}
                                        onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                                        className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="select">Select</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={variable.description || ''}
                                    onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Describe this variable"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Default Value
                                </label>
                                <input
                                    type="text"
                                    value={variable.defaultValue || ''}
                                    onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Default value (optional)"
                                />
                            </div>

                            <div>
                                <label className="flex gap-2 items-center">
                                    <input
                                        type="checkbox"
                                        checked={variable.required}
                                        onChange={(e) => handleVariableChange(index, 'required', e.target.checked)}
                                        className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Required
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Tags
                    </h3>

                    {formData.metadata.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => handleTagChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter tag"
                            />
                            {formData.metadata.tags.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                >
                                    <FiMinus />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addTag}
                        className="flex gap-2 items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                        <FiPlus /> Add Tag
                    </button>
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
                        className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.name.trim() || !formData.content.trim()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}; 