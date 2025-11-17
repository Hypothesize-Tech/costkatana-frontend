import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiEye } from 'react-icons/fi';
import { PromptTemplateService } from '../../services/promptTemplate.service';
import { visualComplianceService } from '../../services/visualCompliance.service';
import { CreateVisualTemplateRequest } from '../../types/promptTemplate.types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

interface VisualComplianceTemplateCreatorProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const VisualComplianceTemplateCreator: React.FC<VisualComplianceTemplateCreatorProps> = ({ onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [metaPromptPresets, setMetaPromptPresets] = useState<any[]>([]);

    // Form state
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [industry, setIndustry] = useState<'jewelry' | 'grooming' | 'retail' | 'fmcg' | 'documents'>('retail');
    const [mode, setMode] = useState<'optimized' | 'standard'>('optimized');
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [complianceCriteria, setComplianceCriteria] = useState<string[]>(['']);
    const [showPreview, setShowPreview] = useState(false);

    // Load meta prompt presets
    useEffect(() => {
        const loadPresets = async () => {
            try {
                const response = await visualComplianceService.getMetaPromptPresets();
                setMetaPromptPresets(response.presets || []);
                if (response.presets && response.presets.length > 0) {
                    setSelectedPresetId(response.presets[0].id);
                }
            } catch (error) {
                console.error('Failed to load meta prompt presets:', error);
            }
        };
        loadPresets();
    }, []);

    const addCriterion = () => {
        setComplianceCriteria([...complianceCriteria, '']);
    };

    const removeCriterion = (index: number) => {
        const newCriteria = complianceCriteria.filter((_, i) => i !== index);
        setComplianceCriteria(newCriteria.length > 0 ? newCriteria : ['']);
    };

    const updateCriterion = (index: number, value: string) => {
        const newCriteria = [...complianceCriteria];
        newCriteria[index] = value;
        setComplianceCriteria(newCriteria);
    };

    const handleCreate = async () => {
        try {
            // Validation
            if (!templateName.trim()) {
                showNotification('Template name is required', 'error');
                return;
            }

            const filledCriteria = complianceCriteria.filter(c => c.trim());
            if (filledCriteria.length === 0) {
                showNotification('At least one compliance criterion is required', 'error');
                return;
            }

            setLoading(true);

            // Create image variables (reference and evidence are standard for visual compliance)
            const imageVariables = [
                {
                    name: 'referenceImage',
                    imageRole: 'reference' as const,
                    description: 'Reference image for compliance check',
                    required: true
                },
                {
                    name: 'evidenceImage',
                    imageRole: 'evidence' as const,
                    description: 'Evidence image to verify against reference',
                    required: true
                }
            ];

            const requestData: CreateVisualTemplateRequest = {
                name: templateName,
                description: templateDescription,
                complianceCriteria: filledCriteria,
                imageVariables,
                industry,
                mode,
                metaPromptPresetId: selectedPresetId
            };

            await PromptTemplateService.createVisualComplianceTemplate(requestData);

            showNotification('Visual compliance template created successfully!', 'success');

            // Call onSuccess callback if provided, otherwise navigate
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/templates');
            }
        } catch (error: any) {
            console.error('Failed to create template:', error);
            showNotification(
                error.message || 'Failed to create template',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const industries = [
        { value: 'jewelry', label: 'Jewelry & Luxury' },
        { value: 'grooming', label: 'Grooming & Salon' },
        { value: 'retail', label: 'Retail & FMCG' },
        { value: 'fmcg', label: 'FMCG & Packaging' },
        { value: 'documents', label: 'Documents & Compliance' }
    ];

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="p-6 mx-auto max-w-5xl">
                {/* Header */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-3xl from-primary-600/10 to-success-600/10"></div>
                    <div className="relative p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-4 items-center mb-4">
                            <button
                                onClick={() => onCancel ? onCancel() : navigate('/templates')}
                                className="flex gap-2 items-center btn btn-secondary"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                                <FiEye className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold font-display gradient-text-primary">
                                    Create Visual Compliance Template
                                </h1>
                                <p className="mt-2 text-secondary-600 dark:text-secondary-300">
                                    Create reusable templates for visual compliance checks with Cortex optimization
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-display gradient-text-primary">
                            Basic Information
                        </h2>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                                Template Name <span className="text-danger-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g., Retail Shelf Compliance Check"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                                Description
                            </label>
                            <textarea
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Describe what this template checks for..."
                                rows={3}
                                className="resize-none input"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                                    Industry <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value as any)}
                                    className="input"
                                >
                                    {industries.map(ind => (
                                        <option key={ind.value} value={ind.value}>
                                            {ind.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                                    Optimization Mode
                                </label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as any)}
                                    className="input"
                                >
                                    <option value="optimized">
                                        Optimized (Nova Pro + Cortex - 93% savings)
                                    </option>
                                    <option value="standard">
                                        Standard (Claude 3.5 Sonnet - Higher accuracy)
                                    </option>
                                </select>
                            </div>
                        </div>

                        {metaPromptPresets.length > 0 && (
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                                    Meta Prompt Preset
                                </label>
                                <select
                                    value={selectedPresetId}
                                    onChange={(e) => setSelectedPresetId(e.target.value)}
                                    className="input"
                                >
                                    {metaPromptPresets.map(preset => (
                                        <option key={preset.id} value={preset.id}>
                                            {preset.name} - {preset.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Compliance Criteria */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display gradient-text-primary">
                                Compliance Criteria
                            </h2>
                            <button
                                onClick={addCriterion}
                                className="flex gap-2 items-center btn btn-primary"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add Criterion
                            </button>
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Define the criteria that will be checked in every compliance verification
                        </p>

                        <div className="space-y-3">
                            {complianceCriteria.map((criterion, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex justify-center items-center flex-shrink-0 w-8 h-8 mt-2 text-sm font-bold text-white rounded-lg bg-gradient-primary">
                                        {index + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={criterion}
                                        onChange={(e) => updateCriterion(index, e.target.value)}
                                        placeholder={`Criterion ${index + 1}: e.g., Product labels are clearly visible`}
                                        className="flex-1 input"
                                    />
                                    {complianceCriteria.length > 1 && (
                                        <button
                                            onClick={() => removeCriterion(index)}
                                            className="flex-shrink-0 p-2 mt-2 text-danger-500 transition-colors rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/30"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Variables Info */}
                    <div className="p-4 bg-gradient-to-br rounded-xl border from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200/50 dark:border-success-700/50">
                        <h3 className="mb-2 text-lg font-bold text-success-700 dark:text-success-300">
                            Image Variables
                        </h3>
                        <p className="mb-3 text-sm text-success-600 dark:text-success-400">
                            This template will automatically include two image variables:
                        </p>
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="px-2 py-1 text-xs font-medium rounded-full bg-success-200 dark:bg-success-800 text-success-800 dark:text-success-200">
                                    Reference Image
                                </div>
                                <span className="text-sm text-success-600 dark:text-success-400">
                                    The standard or expected state
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="px-2 py-1 text-xs font-medium rounded-full bg-success-200 dark:bg-success-800 text-success-800 dark:text-success-200">
                                    Evidence Image
                                </div>
                                <span className="text-sm text-success-600 dark:text-success-400">
                                    The actual state to verify
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {showPreview && (
                        <div className="p-4 bg-gradient-to-br rounded-xl border from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200/50 dark:border-primary-700/50">
                            <h3 className="mb-3 text-lg font-bold text-primary-700 dark:text-primary-300">
                                Template Preview
                            </h3>
                            <div className="space-y-2 text-sm text-primary-600 dark:text-primary-400">
                                <p><strong>Name:</strong> {templateName || 'Untitled Template'}</p>
                                <p><strong>Industry:</strong> {industries.find(i => i.value === industry)?.label}</p>
                                <p><strong>Mode:</strong> {mode === 'optimized' ? 'Optimized (93% cost savings)' : 'Standard (High accuracy)'}</p>
                                <p><strong>Criteria Count:</strong> {complianceCriteria.filter(c => c.trim()).length}</p>
                                <p><strong>Image Variables:</strong> Reference + Evidence (2)</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-6 border-t border-secondary-200 dark:border-secondary-700">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex gap-2 items-center btn btn-secondary"
                        >
                            <FiEye className="w-4 h-4" />
                            {showPreview ? 'Hide' : 'Preview'}
                        </button>
                        <button
                            onClick={() => onCancel ? onCancel() : navigate('/templates')}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading || !templateName.trim() || complianceCriteria.filter(c => c.trim()).length === 0}
                            className="flex gap-2 items-center btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Create Template
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


