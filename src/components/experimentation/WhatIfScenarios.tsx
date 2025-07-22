import React, { useState, useEffect } from 'react';
import {
    PlayIcon,
    PlusIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BeakerIcon,
    LightBulbIcon,
    ShieldExclamationIcon,
    ArrowPathIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { ExperimentationService, WhatIfScenario, WhatIfResult } from '../../services/experimentation.service';
import { Modal } from '../common/Modal';

interface ScenarioChange {
    type: 'model_switch' | 'volume_change' | 'feature_addition' | 'optimization_applied';
    currentValue: any;
    proposedValue: any;
    affectedMetrics: string[];
    description: string;
}

interface ScenarioTemplate {
    name: string;
    description: string;
    changes: ScenarioChange[];
    category: 'optimization' | 'scaling' | 'model_switch' | 'feature';
}

const WhatIfScenarios: React.FC = () => {
    const [scenarios, setScenarios] = useState<WhatIfScenario[]>([]);
    const [scenarioResults, setScenarioResults] = useState<{ [key: string]: WhatIfResult }>({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({});
    const [newScenario, setNewScenario] = useState<Partial<WhatIfScenario>>({
        name: '',
        description: '',
        timeframe: 'monthly',
        changes: [],
        baselineData: {
            cost: 0,
            volume: 0,
            performance: 0
        }
    });

    const scenarioTemplates: ScenarioTemplate[] = [
        {
            name: "GPT-4 to Claude Switch",
            description: "Analyze the impact of switching from GPT-4 to Claude for text generation tasks",
            category: 'model_switch',
            changes: [
                {
                    type: 'model_switch',
                    currentValue: { provider: 'openai', model: 'gpt-4' },
                    proposedValue: { provider: 'anthropic', model: 'claude-3-sonnet' },
                    affectedMetrics: ['cost', 'quality', 'latency'],
                    description: 'Switch primary model from GPT-4 to Claude'
                }
            ]
        },
        {
            name: "10x Volume Increase",
            description: "Simulate the cost impact of a 10x increase in usage volume",
            category: 'scaling',
            changes: [
                {
                    type: 'volume_change',
                    currentValue: { dailyRequests: 1000 },
                    proposedValue: { dailyRequests: 10000 },
                    affectedMetrics: ['cost', 'infrastructure'],
                    description: 'Increase daily API requests by 10x'
                }
            ]
        },
        {
            name: "Add Response Caching",
            description: "Evaluate the savings from implementing response caching",
            category: 'optimization',
            changes: [
                {
                    type: 'optimization_applied',
                    currentValue: { cacheHitRate: 0 },
                    proposedValue: { cacheHitRate: 0.3 },
                    affectedMetrics: ['cost', 'latency'],
                    description: 'Implement caching with 30% hit rate'
                }
            ]
        },
        {
            name: "Add Image Generation",
            description: "Cost impact of adding image generation capabilities",
            category: 'feature',
            changes: [
                {
                    type: 'feature_addition',
                    currentValue: { imageGeneration: false },
                    proposedValue: { imageGeneration: true, dailyImages: 500 },
                    affectedMetrics: ['cost', 'infrastructure'],
                    description: 'Add DALL-E image generation feature'
                }
            ]
        }
    ];

    const changeTypeLabels = {
        model_switch: 'Model Switch',
        volume_change: 'Volume Change',
        feature_addition: 'Feature Addition',
        optimization_applied: 'Optimization Applied'
    };

    const riskLevelColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
    };

    useEffect(() => {
        loadScenarios();
    }, []);

    const loadScenarios = async () => {
        try {
            const scenarios = await ExperimentationService.getWhatIfScenarios();
            setScenarios(scenarios);
        } catch (error) {
            console.error('Error loading scenarios:', error);
            setError('Failed to load scenarios');
        }
    };

    const createScenario = async () => {
        // Enhanced validation
        if (!newScenario.name?.trim()) {
            setError('Please enter a scenario name');
            return;
        }

        if (!newScenario.description?.trim()) {
            setError('Please enter a scenario description');
            return;
        }

        if (!newScenario.changes?.length) {
            setError('Please add at least one change to the scenario');
            return;
        }

        // Validate that all changes have required fields
        const invalidChanges = newScenario.changes.filter(change =>
            !change.description?.trim() ||
            !change.type
        );

        if (invalidChanges.length > 0) {
            setError('Please fill in all change descriptions and types');
            return;
        }

        setIsCreating(true);
        setError(null); // Clear any previous errors

        try {
            console.log('Creating scenario with data:', newScenario);
            const result = await ExperimentationService.createWhatIfScenario(newScenario as WhatIfScenario);
            console.log('Scenario created successfully:', result);

            await loadScenarios();
            setShowCreateModal(false);
            resetNewScenario();

            // Show success message briefly
            setError(null);
        } catch (error: any) {
            console.error('Error creating scenario:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create scenario';
            setError(`Failed to create scenario: ${errorMessage}`);
        } finally {
            setIsCreating(false);
        }
    };

    const runAnalysis = async (scenario: WhatIfScenario) => {
        setIsAnalyzing({ ...isAnalyzing, [scenario.name]: true });
        try {
            const result = await ExperimentationService.runWhatIfAnalysis(scenario.name);
            setScenarioResults({ ...scenarioResults, [scenario.name]: result });
        } catch (error) {
            console.error('Error running analysis:', error);
            setError('Failed to run analysis');
        } finally {
            setIsAnalyzing({ ...isAnalyzing, [scenario.name]: false });
        }
    };

    const deleteScenario = async (scenarioName: string) => {
        try {
            await ExperimentationService.deleteWhatIfScenario(scenarioName);
            await loadScenarios();
            delete scenarioResults[scenarioName];
            setScenarioResults({ ...scenarioResults });
        } catch (error) {
            console.error('Error deleting scenario:', error);
            setError('Failed to delete scenario');
        }
    };

    const resetNewScenario = () => {
        setNewScenario({
            name: '',
            description: '',
            changes: [],
            timeframe: 'monthly',
            baselineData: {
                cost: 0,
                volume: 0,
                performance: 0
            }
        });
    };

    const addChange = () => {
        if (!newScenario.changes) return;

        const newChange: ScenarioChange = {
            type: 'model_switch',
            currentValue: {},
            proposedValue: {},
            affectedMetrics: ['cost'],
            description: ''
        };

        setNewScenario({
            ...newScenario,
            changes: [...newScenario.changes, newChange]
        });
    };

    const updateChange = (index: number, field: keyof ScenarioChange, value: any) => {
        if (!newScenario.changes) return;

        const updatedChanges = [...newScenario.changes];
        updatedChanges[index] = { ...updatedChanges[index], [field]: value };
        setNewScenario({ ...newScenario, changes: updatedChanges });
    };

    const removeChange = (index: number) => {
        if (!newScenario.changes) return;

        const updatedChanges = newScenario.changes.filter((_, i) => i !== index);
        setNewScenario({ ...newScenario, changes: updatedChanges });
    };

    const applyTemplate = (template: ScenarioTemplate) => {
        setNewScenario({
            ...newScenario,
            name: template.name,
            description: template.description,
            changes: template.changes
        });
        setShowTemplatesModal(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low':
                return <InformationCircleIcon className="h-5 w-5 text-green-600" />;
            case 'medium':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
            case 'high':
                return <ShieldExclamationIcon className="h-5 w-5 text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">What-If Scenarios</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowTemplatesModal(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <BeakerIcon className="h-4 w-4 mr-2" />
                        Templates
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Scenario
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-sm text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Scenarios List */}
            <div className="space-y-4">
                {scenarios.length === 0 ? (
                    <div className="text-center py-8">
                        <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Scenarios Yet</h3>
                        <p className="text-gray-600 mb-4">Create your first what-if scenario to analyze potential changes.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Create your first scenario
                        </button>
                    </div>
                ) : (
                    scenarios.map((scenario) => (
                        <div key={scenario.name} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{scenario.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-xs text-gray-500">
                                            Timeframe: {scenario.timeframe}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {scenario.changes.length} change{scenario.changes.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => runAnalysis(scenario)}
                                        disabled={isAnalyzing[scenario.name]}
                                        className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzing[scenario.name] ? (
                                            <>
                                                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="h-4 w-4 mr-1" />
                                                Analyze
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteScenario(scenario.name)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Changes Preview */}
                            <div className="border-t pt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Changes:</h4>
                                <div className="space-y-2">
                                    {scenario.changes.map((change, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {changeTypeLabels[change.type]}
                                            </span>
                                            <span className="text-gray-600">{change.description || `${change.type} change`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Results */}
                            {scenarioResults[scenario.name] && (
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-700">Results:</h4>
                                        <button
                                            onClick={() => {
                                                setSelectedScenario(scenario);
                                                setShowDetailsModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                {scenarioResults[scenario.name].projectedImpact.costChange >= 0 ? (
                                                    <ArrowTrendingUpIcon className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <ArrowTrendingDownIcon className="h-4 w-4 text-green-600" />
                                                )}
                                                <span className="text-sm font-medium">Cost Impact</span>
                                            </div>
                                            <div className={`text-lg font-bold ${scenarioResults[scenario.name].projectedImpact.costChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(scenarioResults[scenario.name].projectedImpact.costChange)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatPercentage(scenarioResults[scenario.name].projectedImpact.costChangePercentage)}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                <LightBulbIcon className="h-4 w-4 text-yellow-600" />
                                                <span className="text-sm font-medium">Confidence</span>
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatPercentage(scenarioResults[scenario.name].projectedImpact.confidence)}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                {getRiskIcon(scenarioResults[scenario.name].projectedImpact.riskLevel)}
                                                <span className="text-sm font-medium">Risk Level</span>
                                            </div>
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${riskLevelColors[scenarioResults[scenario.name].projectedImpact.riskLevel]}`}>
                                                {scenarioResults[scenario.name].projectedImpact.riskLevel.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insights */}
                                    {(() => {
                                        const aiInsights = scenarioResults[scenario.name]?.aiInsights;
                                        return aiInsights && aiInsights.length > 0 ? (
                                            <div className="mt-4">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <SparklesIcon className="h-4 w-4 mr-1 text-purple-600" />
                                                    AI Insights
                                                </h5>
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                    <div className="space-y-2">
                                                        {aiInsights.map((insight: string, index: number) => (
                                                            <div key={index} className="flex items-start space-x-2">
                                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                <span className="text-sm text-purple-800">{insight}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Recommendations and Warnings */}
                                    {(scenarioResults[scenario.name].recommendations?.length > 0 || scenarioResults[scenario.name].warnings?.length > 0) && (
                                        <div className="mt-4 space-y-3">
                                            {scenarioResults[scenario.name].recommendations?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <LightBulbIcon className="h-4 w-4 mr-1 text-green-600" />
                                                        Recommendations
                                                    </h5>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <div className="space-y-2">
                                                            {scenarioResults[scenario.name].recommendations.map((rec: string, index: number) => (
                                                                <div key={index} className="flex items-start space-x-2">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span className="text-sm text-green-800">{rec}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {scenarioResults[scenario.name].warnings?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-orange-600" />
                                                        Warnings
                                                    </h5>
                                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                        <div className="space-y-2">
                                                            {scenarioResults[scenario.name].warnings.map((warning: string, index: number) => (
                                                                <div key={index} className="flex items-start space-x-2">
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span className="text-sm text-orange-800">{warning}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Templates Modal */}
            {showTemplatesModal && (
                <Modal
                    isOpen={showTemplatesModal}
                    onClose={() => setShowTemplatesModal(false)}
                    title="Scenario Templates"
                >
                    <div className="space-y-4">
                        {scenarioTemplates.map((template, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                        <p className="text-sm text-gray-600">{template.description}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {template.category}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-sm text-gray-500">
                                        {template.changes.length} change{template.changes.length !== 1 ? 's' : ''}
                                    </span>
                                    <button
                                        onClick={() => applyTemplate(template)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Use Template
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            {/* Create Scenario Modal */}
            {showCreateModal && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create What-If Scenario"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scenario Name
                            </label>
                            <input
                                type="text"
                                value={newScenario.name || ''}
                                onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter scenario name..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={newScenario.description || ''}
                                onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Describe what this scenario tests..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Timeframe
                            </label>
                            <select
                                value={newScenario.timeframe || 'monthly'}
                                onChange={(e) => setNewScenario({ ...newScenario, timeframe: e.target.value as any })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Changes
                                </label>
                                <button
                                    onClick={addChange}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Add Change
                                </button>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {newScenario.changes?.map((change, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <select
                                                value={change.type}
                                                onChange={(e) => updateChange(index, 'type', e.target.value)}
                                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="model_switch">Model Switch</option>
                                                <option value="volume_change">Volume Change</option>
                                                <option value="feature_addition">Feature Addition</option>
                                                <option value="optimization_applied">Optimization Applied</option>
                                            </select>
                                            <button
                                                onClick={() => removeChange(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={change.description}
                                            onChange={(e) => updateChange(index, 'description', e.target.value)}
                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Description of the change..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createScenario}
                                disabled={isCreating}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Create Scenario'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Scenario Details Modal */}
            {showDetailsModal && selectedScenario && (
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    title={`Scenario Details: ${selectedScenario.name}`}
                    size='lg'
                >
                    <div className="space-y-6">
                        {/* Scenario Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Scenario Information</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Description:</span>
                                        <p className="text-sm text-gray-600 mt-1">{selectedScenario.description}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Timeframe:</span>
                                        <span className="text-sm text-gray-600 ml-2 capitalize">{selectedScenario.timeframe}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Created:</span>
                                        <span className="text-sm text-gray-600 ml-2">
                                            {new Date(selectedScenario.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Changes */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Proposed Changes</h4>
                            <div className="space-y-3">
                                {selectedScenario.changes.map((change, index) => (
                                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {changeTypeLabels[change.type]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3">{change.description}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Current:</span>
                                                <div className="text-gray-600 mt-1">
                                                    {typeof change.currentValue === 'object'
                                                        ? Object.entries(change.currentValue).map(([key, value]) => (
                                                            <div key={key}>{key}: {String(value)}</div>
                                                        ))
                                                        : String(change.currentValue)
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Proposed:</span>
                                                <div className="text-gray-600 mt-1">
                                                    {typeof change.proposedValue === 'object'
                                                        ? Object.entries(change.proposedValue).map(([key, value]) => (
                                                            <div key={key}>{key}: {String(value)}</div>
                                                        ))
                                                        : String(change.proposedValue)
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-xs font-medium text-gray-700">Affected Metrics:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {change.affectedMetrics.map((metric, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                        {metric}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Analysis Results */}
                        {scenarioResults[selectedScenario.name] && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Analysis Results</h4>
                                <div className="space-y-4">
                                    {/* Impact Summary */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-900">Cost Impact</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${scenarioResults[selectedScenario.name]?.projectedImpact.costChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(scenarioResults[selectedScenario.name]?.projectedImpact.costChange || 0)}
                                            </div>
                                            <div className="text-sm text-blue-700">
                                                {formatPercentage(scenarioResults[selectedScenario.name]?.projectedImpact.costChangePercentage || 0)} change
                                            </div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <LightBulbIcon className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-900">Performance Impact</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${scenarioResults[selectedScenario.name]?.projectedImpact.performanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatPercentage(scenarioResults[selectedScenario.name]?.projectedImpact.performanceChange || 0)}
                                            </div>
                                            <div className="text-sm text-green-700">
                                                Risk Level: {scenarioResults[selectedScenario.name]?.projectedImpact.riskLevel || 'unknown'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insights */}
                                    {scenarioResults[selectedScenario.name]?.aiInsights && scenarioResults[selectedScenario.name]?.aiInsights!.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <SparklesIcon className="h-4 w-4 mr-1 text-purple-600" />
                                                AI Insights
                                            </h5>
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {scenarioResults[selectedScenario.name]?.aiInsights?.map((insight: string, index: number) => (
                                                        <div key={index} className="flex items-start space-x-2">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-sm text-purple-800">{insight}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {scenarioResults[selectedScenario.name]?.recommendations && scenarioResults[selectedScenario.name]?.recommendations.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <LightBulbIcon className="h-4 w-4 mr-1 text-green-600" />
                                                Recommendations
                                            </h5>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {scenarioResults[selectedScenario.name]?.recommendations?.map((rec: string, index: number) => (
                                                        <div key={index} className="flex items-start space-x-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-sm text-green-800">{rec}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Warnings */}
                                    {scenarioResults[selectedScenario.name]?.warnings && scenarioResults[selectedScenario.name]?.warnings.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-orange-600" />
                                                Warnings
                                            </h5>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {scenarioResults[selectedScenario.name]?.warnings?.map((warning: string, index: number) => (
                                                        <div key={index} className="flex items-start space-x-2">
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-sm text-orange-800">{warning}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default WhatIfScenarios; 