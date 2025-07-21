import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    TrashIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    CogIcon,
    ServerIcon,
    ChartPieIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { ExperimentationService } from '../../services/experimentation.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';

interface CostBreakdownItem {
    category: string;
    subcategory: string;
    cost: number;
    percentage: number;
    description: string;
}

interface ROIProjection {
    timeframe: string;
    investment: number;
    savings: number;
    netValue: number;
    roi: number;
}

const FineTuningAnalysis: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New project form state
    const [newProject, setNewProject] = useState({
        name: '',
        baseModel: '',
        trainingData: {
            size: 1000,
            quality: 'medium' as 'low' | 'medium' | 'high',
            preprocessingCost: 0
        },
        infrastructure: {
            computeType: 'gpu-standard',
            estimatedTrainingTime: 24,
            parallelization: false
        },
        costs: {
            training: 0,
            hosting: 0,
            inference: 0,
            storage: 0,
            total: 0
        },
        performance: {
            accuracy: 0,
            f1Score: 0,
            latency: 0,
            throughput: 0
        }
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const projectsData = await ExperimentationService.getFineTuningProjects();
            setProjects(projectsData);
        } catch (err) {
            setError('Failed to load projects');
            console.error('Error loading projects:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async () => {
        setIsCreating(true);
        try {
            await ExperimentationService.createFineTuningProject(newProject as Omit<any, 'id'>);
            await loadProjects();
            setShowCreateModal(false);
            resetNewProject();
        } catch (err) {
            setError('Failed to create project');
            console.error('Error creating project:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const analyzeProject = async (project: any) => {
        setIsLoading(true);
        try {
            const analysis = await ExperimentationService.getFineTuningAnalysis(project.id);
            setSelectedAnalysis(analysis);
            setShowAnalysisModal(true);
        } catch (err) {
            setError('Failed to analyze project');
            console.error('Error analyzing project:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            await ExperimentationService.deleteFineTuningProject(projectId);
            await loadProjects();
            setSelectedAnalysis(null); // Clear selected analysis if project is deleted
        } catch (err) {
            setError('Failed to delete project');
            console.error('Error deleting project:', err);
        }
    };

    const resetNewProject = () => {
        setNewProject({
            name: '',
            baseModel: '',
            trainingData: {
                size: 1000,
                quality: 'medium',
                preprocessingCost: 0
            },
            infrastructure: {
                computeType: 'gpu-standard',
                estimatedTrainingTime: 24,
                parallelization: false
            },
            costs: {
                training: 0,
                hosting: 0,
                inference: 0,
                storage: 0,
                total: 0
            },
            performance: {
                accuracy: 0,
                f1Score: 0,
                latency: 0,
                throughput: 0
            }
        });
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

    const getCostBreakdown = (analysis: any): CostBreakdownItem[] => {
        const breakdown: CostBreakdownItem[] = [];

        // Development costs
        Object.entries(analysis.costBreakdown.development).forEach(([key, value]) => {
            breakdown.push({
                category: 'Development',
                subcategory: key.charAt(0).toUpperCase() + key.slice(1),
                cost: value as number,
                percentage: ((value as number) / analysis.roi.initialInvestment) * 100,
                description: `${key.charAt(0).toUpperCase() + key.slice(1)} related costs`
            });
        });

        // Deployment costs
        Object.entries(analysis.costBreakdown.deployment).forEach(([key, value]) => {
            breakdown.push({
                category: 'Deployment',
                subcategory: key.charAt(0).toUpperCase() + key.slice(1),
                cost: value as number,
                percentage: ((value as number) / analysis.roi.initialInvestment) * 100,
                description: `${key.charAt(0).toUpperCase() + key.slice(1)} related costs`
            });
        });

        // Operations costs
        Object.entries(analysis.costBreakdown.operations).forEach(([key, value]) => {
            breakdown.push({
                category: 'Operations',
                subcategory: key.charAt(0).toUpperCase() + key.slice(1),
                cost: value as number,
                percentage: ((value as number) / analysis.roi.operationalCosts) * 100,
                description: `${key.charAt(0).toUpperCase() + key.slice(1)} related costs`
            });
        });

        return breakdown.sort((a, b) => b.cost - a.cost);
    };

            const getROIProjections = (analysis: any): ROIProjection[] => {
        const baseInvestment = analysis.roi.initialInvestment;
        const monthlySavings = analysis.roi.expectedSavings / 12;
        const monthlyOperational = analysis.roi.operationalCosts / 12;

        return [
            {
                timeframe: '3 months',
                investment: baseInvestment,
                savings: monthlySavings * 3,
                netValue: (monthlySavings * 3) - baseInvestment - (monthlyOperational * 3),
                roi: (((monthlySavings * 3) - baseInvestment - (monthlyOperational * 3)) / baseInvestment) * 100
            },
            {
                timeframe: '6 months',
                investment: baseInvestment,
                savings: monthlySavings * 6,
                netValue: (monthlySavings * 6) - baseInvestment - (monthlyOperational * 6),
                roi: (((monthlySavings * 6) - baseInvestment - (monthlyOperational * 6)) / baseInvestment) * 100
            },
            {
                timeframe: '1 year',
                investment: baseInvestment,
                savings: analysis.roi.expectedSavings,
                netValue: analysis.roi.netPresentValue,
                roi: (analysis.roi.netPresentValue / baseInvestment) * 100
            },
            {
                timeframe: '2 years',
                investment: baseInvestment,
                savings: analysis.roi.expectedSavings * 2,
                netValue: (analysis.roi.expectedSavings * 2) - baseInvestment - (analysis.roi.operationalCosts * 2),
                roi: (((analysis.roi.expectedSavings * 2) - baseInvestment - (analysis.roi.operationalCosts * 2)) / baseInvestment) * 100
            }
        ];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'training':
                return <ClockIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'training':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Fine-Tuning Analysis</h2>
                    <p className="text-gray-600">Analyze the total cost of ownership for custom model development</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    <PlusIcon className="mr-2 w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="mr-2 w-5 h-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <div key={project.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                <p className="text-sm text-gray-500">Base: {project.baseModel}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {getStatusIcon(project.status)}
                                    <span className="ml-1">{project.status}</span>
                                </div>
                                <button
                                    onClick={() => deleteProject(project.id)}
                                    className="text-red-500 transition-colors hover:text-red-700"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Cost</span>
                                <span className="font-semibold">{formatCurrency(project.costs.total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Training Data</span>
                                <span className="text-sm">{project.trainingData.size.toLocaleString()} samples</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Accuracy</span>
                                <span className="text-sm">{formatPercentage(project.performance.accuracy)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Training Time</span>
                                <span className="text-sm">{project.infrastructure.estimatedTrainingTime}h</span>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <button
                                onClick={() => analyzeProject(project)}
                                className="flex justify-center items-center px-4 py-2 w-full text-blue-600 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                            >
                                <ChartBarIcon className="mr-2 w-4 h-4" />
                                Analyze Project
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-24 h-24 bg-gray-100 rounded-full">
                        <ChartPieIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Fine-Tuning Projects</h3>
                    <p className="mb-4 text-gray-500">Get started by creating your first fine-tuning project</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                    >
                        <PlusIcon className="mr-2 w-5 h-5" />
                        Create Project
                    </button>
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Fine-Tuning Project"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter project name"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Base Model
                            </label>
                            <select
                                value={newProject.baseModel}
                                onChange={(e) => setNewProject({ ...newProject, baseModel: e.target.value })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select base model</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="claude-3-haiku">Claude 3 Haiku</option>
                                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Training Data Size
                            </label>
                            <input
                                type="number"
                                value={newProject.trainingData.size}
                                onChange={(e) => setNewProject({
                                    ...newProject,
                                    trainingData: { ...newProject.trainingData, size: parseInt(e.target.value) }
                                })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Number of samples"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Data Quality
                            </label>
                            <select
                                value={newProject.trainingData.quality}
                                onChange={(e) => setNewProject({
                                    ...newProject,
                                    trainingData: {
                                        ...newProject.trainingData,
                                        quality: e.target.value as 'low' | 'medium' | 'high'
                                    }
                                })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Compute Type
                            </label>
                            <select
                                value={newProject.infrastructure.computeType}
                                onChange={(e) => setNewProject({
                                    ...newProject,
                                    infrastructure: { ...newProject.infrastructure, computeType: e.target.value }
                                })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="cpu-standard">CPU Standard</option>
                                <option value="gpu-standard">GPU Standard</option>
                                <option value="gpu-premium">GPU Premium</option>
                                <option value="tpu">TPU</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Training Time (hours)
                            </label>
                            <input
                                type="number"
                                value={newProject.infrastructure.estimatedTrainingTime}
                                onChange={(e) => setNewProject({
                                    ...newProject,
                                    infrastructure: {
                                        ...newProject.infrastructure,
                                        estimatedTrainingTime: parseInt(e.target.value)
                                    }
                                })}
                                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Estimated hours"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={newProject.infrastructure.parallelization}
                            onChange={(e) => setNewProject({
                                ...newProject,
                                infrastructure: {
                                    ...newProject.infrastructure,
                                    parallelization: e.target.checked
                                }
                            })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label className="block ml-2 text-sm text-gray-700">
                            Enable parallelization
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createProject}
                            disabled={isCreating || !newProject.name || !newProject.baseModel}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Analysis Modal */}
            <Modal
                isOpen={showAnalysisModal}
                onClose={() => setShowAnalysisModal(false)}
                title="Fine-Tuning Analysis"
                size="xl"
            >
                {selectedAnalysis && (
                    <div className="space-y-6">
                        {/* Project Overview */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Project Overview</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center">
                                    <CogIcon className="mr-3 w-8 h-8 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Base Model</p>
                                        <p className="font-semibold">{selectedAnalysis.project.baseModel}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ServerIcon className="mr-3 w-8 h-8 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Total Investment</p>
                                        <p className="font-semibold">{formatCurrency(selectedAnalysis.roi.initialInvestment)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ArrowTrendingUpIcon className="mr-3 w-8 h-8 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Expected ROI</p>
                                        <p className="font-semibold">{formatPercentage(selectedAnalysis.roi.netPresentValue / selectedAnalysis.roi.initialInvestment)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Cost Breakdown</h3>
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                                        <span>Category</span>
                                        <span>Subcategory</span>
                                        <span>Cost</span>
                                        <span>Percentage</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {getCostBreakdown(selectedAnalysis).map((item, index) => (
                                        <div key={index} className="px-4 py-3 hover:bg-gray-50">
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <span className="font-medium text-gray-900">{item.category}</span>
                                                <span className="text-gray-600">{item.subcategory}</span>
                                                <span className="font-semibold">{formatCurrency(item.cost)}</span>
                                                <span className="text-gray-600">{item.percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ROI Projections */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">ROI Projections</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {getROIProjections(selectedAnalysis).map((projection, index) => (
                                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-900">{projection.timeframe}</span>
                                            <span className={`text-sm font-semibold ${projection.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {projection.roi > 0 ? '+' : ''}{projection.roi.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Savings</span>
                                                <span className="text-xs font-medium">{formatCurrency(projection.savings)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Net Value</span>
                                                <span className={`text-xs font-medium ${projection.netValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(projection.netValue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison Analysis */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Comparison Analysis</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <h4 className="mb-3 font-medium text-gray-900">vs Generic Model</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Cost Difference</span>
                                            <span className="text-sm font-medium">{formatCurrency(selectedAnalysis.comparison.vsGenericModel.costDifference)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Performance Difference</span>
                                            <span className="text-sm font-medium">{formatPercentage(selectedAnalysis.comparison.vsGenericModel.performanceDifference)}</span>
                                        </div>
                                        <div className="p-3 mt-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">{selectedAnalysis.comparison.vsGenericModel.recommendation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <h4 className="mb-3 font-medium text-gray-900">Alternative Solutions</h4>
                                    <div className="space-y-3">
                                        {selectedAnalysis.comparison.vsAlternatives.map((alt: any, index: number) => (
                                            <div key={index} className="p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-900">{alt.alternative}</span>
                                                    <span className="text-sm text-gray-600">{formatCurrency(alt.costComparison)}</span>
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <p>Pros: {alt.pros.join(', ')}</p>
                                                    <p>Cons: {alt.cons.join(', ')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FineTuningAnalysis; 