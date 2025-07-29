import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiPlay, FiStar } from 'react-icons/fi';
import { PromptTemplateService } from '../services/promptTemplate.service';
import { PromptTemplate } from '../types/promptTemplate.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

const TemplateUsagePage: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await PromptTemplateService.getTemplates();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error loading templates:', error);
            setTemplates([]);
            showNotification(error.message || 'Failed to load templates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        // Initialize variables
        const vars: Record<string, string> = {};
        template.variables?.forEach(variable => {
            vars[variable.name] = variable.defaultValue || '';
        });
        setVariables(vars);
        generatePrompt(template, vars);
    };

    const generatePrompt = (template: PromptTemplate, vars: Record<string, string>) => {
        let prompt = template.content;
        Object.entries(vars).forEach(([key, value]) => {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        setGeneratedPrompt(prompt);
    };

    const handleVariableChange = (name: string, value: string) => {
        const newVariables = { ...variables, [name]: value };
        setVariables(newVariables);
        if (selectedTemplate) {
            generatePrompt(selectedTemplate, newVariables);
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt);
        showNotification('Prompt copied to clipboard!', 'success');
    };

    const handleTemplateUsage = async () => {
        if (!selectedTemplate) return;

        try {
            const templateService = PromptTemplateService;
            await templateService.useTemplate(selectedTemplate._id, variables);
            showNotification(`Template "${selectedTemplate.name}" used successfully!`, 'success');
        } catch (error: any) {
            console.error('Error using template:', error);
            showNotification(error.message || 'Failed to use template', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/templates')}
                    className="flex gap-2 items-center px-3 py-2 text-gray-600 rounded-lg transition-colors hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                >
                    <FiArrowLeft />
                    Back to Templates
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Use Templates
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Select a template and customize it for your needs
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Template Selection */}
                <div className="lg:col-span-1">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Choose Template
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {templates.map(template => (
                            <div
                                key={template._id}
                                onClick={() => handleTemplateSelect(template)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate?._id === template._id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    } bg-white dark:bg-gray-800`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                            {template.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {template.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300">
                                                {template.category}
                                            </span>
                                            {template.isFavorite && (
                                                <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Template Customization */}
                <div className="lg:col-span-2">
                    {selectedTemplate ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Customize Template: {selectedTemplate.name}
                                </h2>

                                {/* Variables */}
                                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
                                            Variables
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedTemplate.variables.map(variable => (
                                                <div key={variable.name}>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {variable.name}
                                                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    {variable.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            {variable.description}
                                                        </p>
                                                    )}
                                                    {variable.type === 'text' && variable.name.toLowerCase().includes('description') ? (
                                                        <textarea
                                                            value={variables[variable.name] || ''}
                                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                            placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={variables[variable.name] || ''}
                                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                            placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Generated Prompt */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                            Generated Prompt
                                        </h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopyPrompt}
                                                className="flex gap-2 items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                <FiCopy className="w-4 h-4" />
                                                Copy
                                            </button>
                                            <button
                                                onClick={handleTemplateUsage}
                                                className="flex gap-2 items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                                            >
                                                <FiPlay className="w-4 h-4" />
                                                Use
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                                            {generatedPrompt || 'Generated prompt will appear here...'}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg dark:bg-gray-800">
                            <div className="text-center">
                                <FiPlay className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                    Select a Template
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose a template from the left to start customizing
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateUsagePage; 