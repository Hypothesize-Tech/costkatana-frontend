import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiMinus,
    FiEye,
    FiCode,
    FiSave,
    FiChevronRight,
    FiChevronLeft,
    FiCopy,
    FiType,
    FiToggleLeft,
    FiHash,
    FiList,
    FiAlignLeft,
    FiMail,
    FiBriefcase,
    FiFileText,
    FiLayers,
    FiZap,
    FiStar
} from 'react-icons/fi';
import { TemplateVariable } from '../../types/promptTemplate.types';

interface EnhancedTemplateWizardProps {
    onClose: () => void;
    onSubmit: (templateData: any) => void;
}

interface TemplatePreset {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    template: string;
    variables: TemplateVariable[];
    example: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
}

export const EnhancedTemplateWizard: React.FC<EnhancedTemplateWizardProps> = ({
    onClose,
    onSubmit,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null);
    const [templateData, setTemplateData] = useState({
        name: '',
        description: '',
        content: '',
        category: 'general',
        variables: [] as TemplateVariable[],
        metadata: {
            tags: [] as string[],
            estimatedTokens: 0,
        },
    });
    const [previewData, setPreviewData] = useState<Record<string, string>>({});
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const templatePresets: TemplatePreset[] = [
        {
            id: 'email-marketing',
            name: 'Email Marketing',
            description: 'Create engaging marketing emails that convert',
            icon: <FiMail className="w-8 h-8" />,
            category: 'marketing',
            difficulty: 'beginner',
            estimatedTime: '2 min',
            template: `Subject: {{email_subject}}

Hi {{customer_name}},

{{opening_message}}

**Key Benefits:**
{{main_benefits}}

**Special Offer:**
{{offer_details}}

{{call_to_action}}

Best regards,
{{sender_name}}

P.S. {{ps_message}}`,
            variables: [
                { name: 'email_subject', description: 'Email subject line', defaultValue: '', required: true, type: 'text' },
                { name: 'customer_name', description: 'Customer name', defaultValue: '[Customer Name]', required: false, type: 'text' },
                { name: 'opening_message', description: 'Opening message', defaultValue: '', required: true, type: 'textarea' },
                { name: 'main_benefits', description: 'Key benefits (bullet points)', defaultValue: '', required: true, type: 'textarea' },
                { name: 'offer_details', description: 'Special offer details', defaultValue: '', required: true, type: 'textarea' },
                { name: 'call_to_action', description: 'Call to action', defaultValue: '', required: true, type: 'textarea' },
                { name: 'sender_name', description: 'Sender name', defaultValue: '', required: true, type: 'text' },
                { name: 'ps_message', description: 'P.S. message', defaultValue: '', required: false, type: 'text' },
            ],
            example: 'Perfect for product launches, newsletters, and promotional campaigns',
            tags: ['marketing', 'email', 'conversion'],
        },
        {
            id: 'blog-post',
            name: 'Blog Post',
            description: 'Write engaging blog posts with proper structure',
            icon: <FiFileText className="w-8 h-8" />,
            category: 'content',
            difficulty: 'intermediate',
            estimatedTime: '3 min',
            template: `# {{blog_title}}

{{introduction}}

## {{section_1_title}}

{{section_1_content}}

## {{section_2_title}}  

{{section_2_content}}

## {{section_3_title}}

{{section_3_content}}

## Conclusion

{{conclusion}}

**Key Takeaways:**
{{key_takeaways}}

---
*Tags: {{blog_tags}}*`,
            variables: [
                { name: 'blog_title', description: 'Blog post title', defaultValue: '', required: true, type: 'text' },
                { name: 'introduction', description: 'Introduction paragraph', defaultValue: '', required: true, type: 'textarea' },
                { name: 'section_1_title', description: 'First section title', defaultValue: '', required: true, type: 'text' },
                { name: 'section_1_content', description: 'First section content', defaultValue: '', required: true, type: 'textarea' },
                { name: 'section_2_title', description: 'Second section title', defaultValue: '', required: true, type: 'text' },
                { name: 'section_2_content', description: 'Second section content', defaultValue: '', required: true, type: 'textarea' },
                { name: 'section_3_title', description: 'Third section title', defaultValue: '', required: false, type: 'text' },
                { name: 'section_3_content', description: 'Third section content', defaultValue: '', required: false, type: 'textarea' },
                { name: 'conclusion', description: 'Conclusion paragraph', defaultValue: '', required: true, type: 'textarea' },
                { name: 'key_takeaways', description: 'Key takeaways (bullet points)', defaultValue: '', required: true, type: 'textarea' },
                { name: 'blog_tags', description: 'Blog tags', defaultValue: '', required: false, type: 'text' },
            ],
            example: 'Great for tutorials, how-to guides, and thought leadership content',
            tags: ['content', 'blog', 'writing'],
        },
        {
            id: 'code-documentation',
            name: 'Code Documentation',
            description: 'Generate comprehensive API and function documentation',
            icon: <FiCode className="w-8 h-8" />,
            category: 'coding',
            difficulty: 'advanced',
            estimatedTime: '4 min',
            template: `# {{function_name}}

## Overview
{{function_description}}

## Syntax
\`\`\`{{language}}
{{function_signature}}
\`\`\`

## Parameters
{{parameters_list}}

## Return Value
{{return_description}}

## Examples
\`\`\`{{language}}
{{usage_examples}}
\`\`\`

## Error Handling
{{error_handling}}

## Notes
{{additional_notes}}`,
            variables: [
                { name: 'function_name', description: 'Function name', defaultValue: '', required: true, type: 'text' },
                { name: 'function_description', description: 'What the function does', defaultValue: '', required: true, type: 'textarea' },
                { name: 'language', description: 'Programming language', defaultValue: 'javascript', required: true, type: 'select', options: ['javascript', 'python', 'java', 'typescript', 'go', 'rust'] },
                { name: 'function_signature', description: 'Function signature/syntax', defaultValue: '', required: true, type: 'textarea' },
                { name: 'parameters_list', description: 'Parameters description', defaultValue: '', required: true, type: 'textarea' },
                { name: 'return_description', description: 'Return value description', defaultValue: '', required: true, type: 'textarea' },
                { name: 'usage_examples', description: 'Usage examples', defaultValue: '', required: true, type: 'textarea' },
                { name: 'error_handling', description: 'Error handling info', defaultValue: '', required: false, type: 'textarea' },
                { name: 'additional_notes', description: 'Additional notes', defaultValue: '', required: false, type: 'textarea' },
            ],
            example: 'Perfect for API docs, SDK documentation, and code libraries',
            tags: ['coding', 'documentation', 'api'],
        },
        {
            id: 'meeting-notes',
            name: 'Meeting Summary',
            description: 'Turn meeting notes into actionable summaries',
            icon: <FiBriefcase className="w-8 h-8" />,
            category: 'business',
            difficulty: 'beginner',
            estimatedTime: '2 min',
            template: `# {{meeting_title}} - {{meeting_date}}

**Attendees:** {{attendees}}
**Duration:** {{duration}}

## Executive Summary
{{executive_summary}}

## Key Discussion Points
{{discussion_points}}

## Decisions Made
{{decisions}}

## Action Items
{{action_items}}

## Next Steps
{{next_steps}}

**Next Meeting:** {{next_meeting_date}}`,
            variables: [
                { name: 'meeting_title', description: 'Meeting title', defaultValue: '', required: true, type: 'text' },
                { name: 'meeting_date', description: 'Meeting date', defaultValue: '', required: true, type: 'text' },
                { name: 'attendees', description: 'Meeting attendees', defaultValue: '', required: true, type: 'text' },
                { name: 'duration', description: 'Meeting duration', defaultValue: '', required: false, type: 'text' },
                { name: 'executive_summary', description: 'Brief summary (2-3 sentences)', defaultValue: '', required: true, type: 'textarea' },
                { name: 'discussion_points', description: 'Key points discussed', defaultValue: '', required: true, type: 'textarea' },
                { name: 'decisions', description: 'Decisions made', defaultValue: '', required: true, type: 'textarea' },
                { name: 'action_items', description: 'Action items with owners', defaultValue: '', required: true, type: 'textarea' },
                { name: 'next_steps', description: 'Next steps', defaultValue: '', required: true, type: 'textarea' },
                { name: 'next_meeting_date', description: 'Next meeting date', defaultValue: '', required: false, type: 'text' },
            ],
            example: 'Transform messy meeting notes into professional summaries',
            tags: ['business', 'meeting', 'summary'],
        },
        {
            id: 'social-media',
            name: 'Social Media Post',
            description: 'Create engaging social media content',
            icon: <FiZap className="w-8 h-8" />,
            category: 'marketing',
            difficulty: 'beginner',
            estimatedTime: '1 min',
            template: `{{hook}}

{{main_content}}

{{value_proposition}}

{{call_to_action}}

{{hashtags}}`,
            variables: [
                { name: 'hook', description: 'Attention-grabbing opening', defaultValue: '', required: true, type: 'textarea' },
                { name: 'main_content', description: 'Main post content', defaultValue: '', required: true, type: 'textarea' },
                { name: 'value_proposition', description: 'Value for the audience', defaultValue: '', required: true, type: 'textarea' },
                { name: 'call_to_action', description: 'What you want people to do', defaultValue: '', required: true, type: 'textarea' },
                { name: 'hashtags', description: 'Relevant hashtags', defaultValue: '', required: false, type: 'text' },
            ],
            example: 'Great for LinkedIn, Twitter, Instagram, and other platforms',
            tags: ['social', 'marketing', 'engagement'],
        },
        {
            id: 'custom',
            name: 'Start from Scratch',
            description: 'Create a completely custom template',
            icon: <FiLayers className="w-8 h-8" />,
            category: 'custom',
            difficulty: 'intermediate',
            estimatedTime: '5 min',
            template: 'Write your custom template here...\n\nUse {{variable_name}} to add variables.',
            variables: [],
            example: 'Build any type of template for your specific needs',
            tags: ['custom'],
        },
    ];

    const steps = [
        { title: 'Choose Template', description: 'Pick a template or start from scratch' },
        { title: 'Customize', description: 'Edit content and add variables' },
        { title: 'Preview & Save', description: 'Test your template and save' },
    ];

    // Initialize preview data when variables change
    useEffect(() => {
        const newPreviewData: Record<string, string> = {};
        templateData.variables.forEach(variable => {
            newPreviewData[variable.name] = previewData[variable.name] || variable.defaultValue || `[${variable.name}]`;
        });
        setPreviewData(newPreviewData);
    }, [templateData.variables]);

    const handlePresetSelect = (preset: TemplatePreset) => {
        setSelectedPreset(preset);
        setTemplateData({
            name: preset.name,
            description: preset.description,
            content: preset.template,
            category: preset.category,
            variables: preset.variables,
            metadata: {
                tags: preset.tags,
                estimatedTokens: preset.template.length / 4, // Rough estimate
            },
        });
        setCurrentStep(1);
    };

    const generatePreview = () => {
        let preview = templateData.content;
        templateData.variables.forEach(variable => {
            const value = previewData[variable.name] || `[${variable.name}]`;
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            preview = preview.replace(regex, value);
        });
        return preview;
    };

    const addVariable = () => {
        const newVariable: TemplateVariable = {
            name: `variable_${templateData.variables.length + 1}`,
            description: '',
            defaultValue: '',
            required: true,
            type: 'text',
        };
        setTemplateData(prev => ({
            ...prev,
            variables: [...prev.variables, newVariable],
        }));
    };

    const updateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
        const newVariables = [...templateData.variables];
        newVariables[index] = { ...newVariables[index], [field]: value };
        setTemplateData(prev => ({ ...prev, variables: newVariables }));
    };

    const removeVariable = (index: number) => {
        setTemplateData(prev => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index),
        }));
    };

    const insertVariableIntoContent = (variableName: string) => {
        const cursorPosition = (document.getElementById('template-content') as HTMLTextAreaElement)?.selectionStart || 0;
        const content = templateData.content;
        const newContent = content.slice(0, cursorPosition) + `{{${variableName}}}` + content.slice(cursorPosition);
        setTemplateData(prev => ({ ...prev, content: newContent }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(templateData);
            onClose();
        } catch (error) {
            console.error('Error creating template:', error);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return selectedPreset !== null;
            case 1: return templateData.name.trim() && templateData.content.trim();
            case 2: return true;
            default: return false;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-600 bg-green-100';
            case 'intermediate': return 'text-yellow-600 bg-yellow-100';
            case 'advanced': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getVariableIcon = (type: string) => {
        switch (type) {
            case 'text': return <FiType className="w-4 h-4" />;
            case 'textarea': return <FiAlignLeft className="w-4 h-4" />;
            case 'number': return <FiHash className="w-4 h-4" />;
            case 'select': return <FiList className="w-4 h-4" />;
            case 'multiselect': return <FiList className="w-4 h-4" />;
            case 'boolean': return <FiToggleLeft className="w-4 h-4" />;
            default: return <FiType className="w-4 h-4" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Create Template</h2>
                                <p className="text-indigo-100 mt-1">Build powerful prompts in minutes</p>
                            </div>
                            <button onClick={onClose} className="text-white hover:text-indigo-200 transition-colors">
                                <FiMinus className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mt-6 space-x-8">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`flex items-center space-x-3 ${index <= currentStep ? 'text-white' : 'text-indigo-300'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${index < currentStep ? 'bg-green-500' : index === currentStep ? 'bg-white text-indigo-600' : 'bg-indigo-500'
                                            }`}>
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="font-medium">{step.title}</div>
                                            <div className="text-xs opacity-75">{step.description}</div>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <FiChevronRight className="w-5 h-5 mx-4 text-indigo-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Step 0: Choose Template */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Starting Point</h3>
                                    <p className="text-gray-600">Select a template that matches your needs, or start from scratch</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {templatePresets.map((preset) => (
                                        <div
                                            key={preset.id}
                                            onClick={() => handlePresetSelect(preset)}
                                            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${selectedPreset?.id === preset.id
                                                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                : 'border-gray-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="text-indigo-600">{preset.icon}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(preset.difficulty)}`}>
                                                                {preset.difficulty}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>⏱️ {preset.estimatedTime}</span>
                                                        <span>📝 {preset.variables.length} variables</span>
                                                    </div>
                                                    <p className="text-xs text-indigo-600 mt-2 italic">{preset.example}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Customize */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side - Editor */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Template Editor</h3>

                                        {/* Basic Info */}
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                                                <input
                                                    type="text"
                                                    value={templateData.name}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Enter template name..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                <textarea
                                                    value={templateData.description}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="What does this template do?"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        {/* Template Content */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                                            <textarea
                                                id="template-content"
                                                value={templateData.content}
                                                onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                                rows={12}
                                                placeholder="Write your template here. Use {{variable_name}} for variables..."
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Tip: Use double curly braces {"{{variable_name}}"} to insert variables
                                            </p>
                                        </div>
                                    </div>

                                    {/* Variables Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Variables</h4>
                                            <button
                                                onClick={addVariable}
                                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                                <span>Add Variable</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {templateData.variables.map((variable, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            {getVariableIcon(variable.type || 'text')}
                                                            <span className="font-medium text-gray-900">Variable {index + 1}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => insertVariableIntoContent(variable.name)}
                                                                className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                                                title="Insert into content"
                                                            >
                                                                <FiCopy className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeVariable(index)}
                                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                            >
                                                                <FiMinus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                                            <input
                                                                type="text"
                                                                value={variable.name}
                                                                onChange={(e) => updateVariable(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                                                                placeholder="variable_name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                                            <select
                                                                value={variable.type}
                                                                onChange={(e) => updateVariable(index, 'type', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="textarea">Textarea</option>
                                                                <option value="number">Number</option>
                                                                <option value="select">Select</option>
                                                                <option value="multiselect">Multi-Select</option>
                                                                <option value="boolean">Boolean</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                                            <textarea
                                                                value={variable.description}
                                                                onChange={(e) => updateVariable(index, 'description', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                                                                placeholder="What is this variable for?"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Preview */}
                                <div className="space-y-6">
                                    <div className="sticky top-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-gray-900">Live Preview</h3>
                                            <button
                                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isPreviewMode
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <FiEye className="w-4 h-4" />
                                                <span>{isPreviewMode ? 'Preview On' : 'Preview Off'}</span>
                                            </button>
                                        </div>

                                        {/* Preview Variables */}
                                        {isPreviewMode && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-3">Test Values</h4>
                                                <div className="space-y-3">
                                                    {templateData.variables.map((variable, index) => (
                                                        <div key={index}>
                                                            <label className="block text-xs font-medium text-blue-700 mb-1">
                                                                {variable.name} {variable.required && <span className="text-red-500">*</span>}
                                                            </label>
                                                            {variable.type === 'textarea' ? (
                                                                <textarea
                                                                    value={previewData[variable.name] || ''}
                                                                    onChange={(e) => setPreviewData(prev => ({ ...prev, [variable.name]: e.target.value }))}
                                                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder={variable.description || `Enter ${variable.name}...`}
                                                                    rows={3}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={previewData[variable.name] || ''}
                                                                    onChange={(e) => setPreviewData(prev => ({ ...prev, [variable.name]: e.target.value }))}
                                                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder={variable.description || `Enter ${variable.name}...`}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Preview Content */}
                                        <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <div className="text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">
                                                {isPreviewMode ? generatePreview() : templateData.content}
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-4 grid grid-cols-3 gap-4">
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <div className="text-lg font-semibold text-gray-900">{templateData.content.length}</div>
                                                <div className="text-xs text-gray-600">Characters</div>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <div className="text-lg font-semibold text-gray-900">{templateData.variables.length}</div>
                                                <div className="text-xs text-gray-600">Variables</div>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <div className="text-lg font-semibold text-gray-900">~{Math.ceil(templateData.content.length / 4)}</div>
                                                <div className="text-xs text-gray-600">Tokens</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Preview & Save */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Template</h3>
                                    <p className="text-gray-600">Make sure everything looks good before saving</p>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                                            <div className="font-semibold text-gray-900">{templateData.name}</div>
                                            <div className="text-sm text-gray-600">Template Name</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">{templateData.variables.length}</div>
                                            <div className="font-semibold text-gray-900">Variables</div>
                                            <div className="text-sm text-gray-600">Dynamic Fields</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600 mb-1">~{Math.ceil(templateData.content.length / 4)}</div>
                                            <div className="font-semibold text-gray-900">Tokens</div>
                                            <div className="text-sm text-gray-600">Estimated</div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Template Preview</h4>
                                        <div className="text-sm font-mono whitespace-pre-wrap text-gray-700 max-h-64 overflow-y-auto">
                                            {generatePreview()}
                                        </div>
                                    </div>
                                </div>

                                {templateData.variables.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="font-medium text-gray-900 mb-4">Variables Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {templateData.variables.map((variable, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                                    {getVariableIcon(variable.type || 'text')}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{`{{${variable.name}}}`}</div>
                                                        <div className="text-sm text-gray-600">{variable.description}</div>
                                                    </div>
                                                    {variable.required && <FiStar className="w-4 h-4 text-yellow-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-8 py-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                    <span>Back</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={!canProceed()}
                                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${canProceed()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span>Next</span>
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !canProceed()}
                                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${!loading && canProceed()
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <FiSave className="w-4 h-4" />
                                    <span>{loading ? 'Saving...' : 'Save Template'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};