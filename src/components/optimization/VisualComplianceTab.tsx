import React, { useState, useEffect } from 'react';
import {
    PhotoIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { visualComplianceService } from '../../services/visualCompliance.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { ComplianceResult, Industry, MetaPromptPreset } from '../../types/visualCompliance.types';
import { EyeIcon } from 'lucide-react';

interface VisualComplianceTabProps {
    onOptimizationCreated?: (optimization: any) => void;
}

export const VisualComplianceTab: React.FC<VisualComplianceTabProps> = ({ onOptimizationCreated }) => {
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
    const [industry, setIndustry] = useState<Industry>('retail');
    const [complianceCriteria, setComplianceCriteria] = useState<string[]>([
        'All products should be facing forward',
        'Shelves should be fully stocked',
        'Proper spacing between products'
    ]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ComplianceResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Meta prompt state
    const [metaPromptPresets, setMetaPromptPresets] = useState<MetaPromptPreset[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('default');
    const [customMetaPrompt, setCustomMetaPrompt] = useState<string>('');
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);
    const [loadingPresets, setLoadingPresets] = useState(false);

    const { showNotification } = useNotifications();

    // Load meta prompt presets on mount
    useEffect(() => {
        const loadPresets = async () => {
            try {
                setLoadingPresets(true);
                const response = await visualComplianceService.getMetaPromptPresets();
                if (response.success) {
                    setMetaPromptPresets(response.presets);
                }
            } catch (err) {
                console.error('Failed to load presets:', err);
            } finally {
                setLoadingPresets(false);
            }
        };
        loadPresets();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'evidence') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'reference') {
                setReferenceImage(file);
                const reader = new FileReader();
                reader.onload = (e) => setReferencePreview(e.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                setEvidenceImage(file);
                const reader = new FileReader();
                reader.onload = (e) => setEvidencePreview(e.target?.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!referenceImage || !evidenceImage) {
            setError('Both reference and evidence images are required');
            showNotification('Please upload both images', 'error');
            return;
        }

        if (complianceCriteria.length === 0 || complianceCriteria.some(c => !c.trim())) {
            setError('At least one valid compliance criterion is required');
            showNotification('Please add compliance criteria', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const refBase64 = await visualComplianceService.prepareImageFile(referenceImage);
            const evidBase64 = await visualComplianceService.prepareImageFile(evidenceImage);

            const response = await visualComplianceService.checkCompliance({
                referenceImage: refBase64,
                evidenceImage: evidBase64,
                complianceCriteria: complianceCriteria.filter(c => c.trim()),
                industry,
                useUltraCompression: true,
                mode: 'optimized',
                metaPrompt: showCustomPrompt && customMetaPrompt ? customMetaPrompt : undefined,
                metaPromptPresetId: !showCustomPrompt ? selectedPresetId : undefined
            });

            if (response.success && response.data) {
                setResult(response.data);
                showNotification('Compliance check completed successfully!', 'success');

                // Notify parent that optimization was created (backend saves it automatically)
                if (onOptimizationCreated) {
                    // Wait a bit for backend to save the optimization
                    setTimeout(async () => {
                        try {
                            const token = localStorage.getItem('access_token');
                            if (!token || token === 'null' || token === 'undefined') {
                                console.warn('No valid token found, skipping optimization fetch');
                                return;
                            }

                            const optimizationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/optimizations?page=1&limit=1&sort=createdAt&order=desc`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (optimizationsResponse.ok) {
                                const data = await optimizationsResponse.json();
                                if (data.data && data.data.length > 0) {
                                    // Check if this is a visual compliance optimization
                                    const latestOpt = data.data[0];
                                    if (latestOpt.optimizationType === 'visual_compliance') {
                                        onOptimizationCreated(latestOpt);
                                    }
                                }
                            } else {
                                console.warn('Failed to fetch optimizations:', optimizationsResponse.status);
                            }
                        } catch (err) {
                            console.error('Failed to fetch latest optimization:', err);
                        }
                    }, 1000); // Increased delay to ensure backend finishes saving
                }
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const addCriterion = () => {
        setComplianceCriteria([...complianceCriteria, '']);
    };

    const removeCriterion = (index: number) => {
        setComplianceCriteria(complianceCriteria.filter((_, i) => i !== index));
    };

    const updateCriterion = (index: number, value: string) => {
        const updated = [...complianceCriteria];
        updated[index] = value;
        setComplianceCriteria(updated);
    };

    return (
        <div className="space-y-6">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="bg-gradient-primary/10 p-8 rounded-t-xl border-b border-primary-200/30">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <EyeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold gradient-text-primary">
                                Visual Compliance
                            </h2>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-lg mt-1">
                                Ultra-optimized AI-powered visual compliance verification
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Reference Image */}
                            <div>
                                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                    Reference Image (Standard)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'reference')}
                                    className="hidden"
                                    id="reference-image"
                                />
                                <label
                                    htmlFor="reference-image"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary-300/50 dark:border-primary-600/50 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent"
                                >
                                    {referencePreview ? (
                                        <img
                                            src={referencePreview}
                                            alt="Reference preview"
                                            className="w-full h-full object-contain rounded-xl p-2"
                                        />
                                    ) : (
                                        <>
                                            <PhotoIcon className="w-12 h-12 text-primary-500 dark:text-primary-400 mb-2" />
                                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                Click to upload reference image
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Evidence Image */}
                            <div>
                                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                    Evidence Image (User Upload)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'evidence')}
                                    className="hidden"
                                    id="evidence-image"
                                />
                                <label
                                    htmlFor="evidence-image"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary-300/50 dark:border-primary-600/50 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent"
                                >
                                    {evidencePreview ? (
                                        <img
                                            src={evidencePreview}
                                            alt="Evidence preview"
                                            className="w-full h-full object-contain rounded-xl p-2"
                                        />
                                    ) : (
                                        <>
                                            <PhotoIcon className="w-12 h-12 text-primary-500 dark:text-primary-400 mb-2" />
                                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                Click to upload evidence image
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Industry Selector */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Industry
                            </label>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value as Industry)}
                                className="input"
                            >
                                <option value="retail">Retail</option>
                                <option value="jewelry">Jewelry</option>
                                <option value="grooming">Grooming/Salon</option>
                                <option value="fmcg">FMCG</option>
                                <option value="documents">Documents</option>
                            </select>
                        </div>

                        {/* Meta Prompt Controls */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                    Analysis Template (Meta Prompt)
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={showCustomPrompt ? 'custom' : selectedPresetId}
                                        onChange={(e) => {
                                            if (e.target.value === 'custom') {
                                                setShowCustomPrompt(true);
                                            } else {
                                                setShowCustomPrompt(false);
                                                setSelectedPresetId(e.target.value);
                                            }
                                        }}
                                        className="input flex-1"
                                        disabled={loadingPresets}
                                    >
                                        {metaPromptPresets.map(preset => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.name} - {preset.description}
                                            </option>
                                        ))}
                                        <option value="custom">Custom Prompt...</option>
                                    </select>
                                </div>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                    <EyeIcon className="w-3 h-3 inline mr-1" />
                                    The selected template guides how AI analyzes your images, even in optimized mode.
                                </p>
                            </div>

                            {/* Custom Meta Prompt Textarea */}
                            {showCustomPrompt && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                            Custom Meta Prompt
                                        </label>
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {customMetaPrompt.length}/4000 characters
                                        </span>
                                    </div>
                                    <textarea
                                        value={customMetaPrompt}
                                        onChange={(e) => setCustomMetaPrompt(e.target.value)}
                                        placeholder="Enter your custom meta prompt here. Include {items_to_verify} placeholder where compliance criteria should be inserted..."
                                        className="input min-h-[200px] font-mono text-sm"
                                        maxLength={4000}
                                    />
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                        Tip: Use <code className="px-1 py-0.5 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded">{'{items_to_verify}'}</code> as a placeholder for compliance criteria.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Compliance Criteria */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Compliance Criteria
                            </label>
                            <div className="space-y-2">
                                {complianceCriteria.map((criterion, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={criterion}
                                            onChange={(e) => updateCriterion(index, e.target.value)}
                                            placeholder="Enter compliance criterion..."
                                            className="input flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCriterion(index)}
                                            className="btn btn-secondary px-4"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addCriterion}
                                    className="btn btn-secondary w-full"
                                >
                                    + Add Criterion
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !referenceImage || !evidenceImage}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <BoltIcon className="w-5 h-5" />
                                    Check Compliance
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="glass rounded-xl p-4 border border-danger-200/30 dark:border-danger-800/30 backdrop-blur-xl bg-gradient-to-br from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <p className="font-body text-danger-800 dark:text-danger-200">
                        <strong>Error:</strong> {error}
                    </p>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="bg-gradient-success/10 p-8 rounded-t-xl border-b border-success-200/30 dark:border-success-800/30">
                        <h3 className="text-2xl font-display font-bold gradient-text-success">
                            Compliance Result
                        </h3>
                    </div>

                    <div className="p-8">
                        {/* Score and Pass/Fail */}
                        <div className="flex items-center gap-6 mb-6">
                            <div className="text-6xl font-display font-bold" style={{
                                color: result.pass_fail ? '#06ec9e' : '#ef4444'
                            }}>
                                {result.compliance_score.toFixed(1)}%
                            </div>
                            <div className="flex-1">
                                <div className={`text-2xl font-display font-bold ${result.pass_fail ? 'gradient-text-success' : 'text-danger-600 dark:text-danger-400'}`}>
                                    {result.pass_fail ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-7 h-7" />
                                            PASS
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <XCircleIcon className="w-7 h-7" />
                                            FAIL
                                        </span>
                                    )}
                                </div>
                                {result.metadata.cacheHit && (
                                    <div className="text-sm font-body gradient-text-primary flex items-center gap-1 mt-2">
                                        <BoltIcon className="w-4 h-4" />
                                        Cached Result
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="mb-6 glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl">
                            <p className="font-body text-light-text-primary dark:text-dark-text-primary">
                                <strong className="font-display">Feedback:</strong> {result.feedback_message}
                            </p>
                        </div>

                        {/* Per-Item Breakdown */}
                        {result.items && result.items.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
                                    Item-by-Item Analysis
                                </h4>
                                <div className="space-y-3">
                                    {result.items.map((item) => (
                                        <div
                                            key={item.itemNumber}
                                            className={`glass rounded-xl p-4 border backdrop-blur-xl ${item.status
                                                ? 'border-success-200/30 dark:border-success-800/30 bg-gradient-to-br from-success-50/20 to-transparent dark:from-success-900/10 dark:to-transparent'
                                                : 'border-danger-200/30 dark:border-danger-800/30 bg-gradient-to-br from-danger-50/20 to-transparent dark:from-danger-900/10 dark:to-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 mt-0.5 ${item.status ? 'text-success-500' : 'text-danger-500'}`}>
                                                    {item.status ? (
                                                        <CheckCircleIcon className="w-6 h-6" />
                                                    ) : (
                                                        <XCircleIcon className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-body font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                            {item.itemName}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status
                                                            ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                                                            : 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300'
                                                            }`}>
                                                            {item.status ? 'PASS' : 'FAIL'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                        {item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Input Tokens</div>
                                <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {result.metadata.inputTokens.toLocaleString()}
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Output Tokens</div>
                                <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {result.metadata.outputTokens.toLocaleString()}
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
                                    <CurrencyDollarIcon className="w-3 h-3" />
                                    Cost
                                </div>
                                <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    ${result.metadata.cost.toFixed(4)}
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    Latency
                                </div>
                                <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {result.metadata.latency}ms
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4 border border-success-200/30 dark:border-success-800/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-transparent dark:from-success-900/10 dark:to-transparent">
                                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
                                    <ChartBarIcon className="w-3 h-3" />
                                    Savings
                                </div>
                                <div className="text-lg font-display font-bold gradient-text-success">
                                    {result.metadata.compressionRatio.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
