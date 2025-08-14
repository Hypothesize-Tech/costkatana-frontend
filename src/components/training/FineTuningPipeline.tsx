import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CogIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowRightIcon,
    EyeIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { trainingService, TrainingDataset, FineTuneJob, EvaluationJob } from '../../services/training.service';

export interface FineTuningPipelineProps {
    datasetId?: string;
}

export const FineTuningPipeline: React.FC<FineTuningPipelineProps> = ({ datasetId }) => {
    const [dataset, setDataset] = useState<TrainingDataset | null>(null);
    const [fineTuneJobs, setFineTuneJobs] = useState<FineTuneJob[]>([]);
    const [evaluations, setEvaluations] = useState<EvaluationJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<FineTuneJob | null>(null);

    useEffect(() => {
        loadPipelineData();
    }, [datasetId]);

    const loadPipelineData = async () => {
        setLoading(true);
        try {
            if (datasetId) {
                // Load specific dataset pipeline
                const datasetData = await trainingService.datasets.getDataset(datasetId);
                setDataset(datasetData);

                // Load fine-tune jobs for this dataset
                const allJobs = await trainingService.fineTune.getUserFineTuneJobs();
                const datasetJobs = allJobs.filter(job => job.datasetId === datasetId);
                setFineTuneJobs(datasetJobs);

                // Load evaluations for these jobs
                const allEvaluations = await trainingService.evaluations.getUserEvaluationJobs();
                const relevantEvals = allEvaluations.filter(evaluation =>
                    datasetJobs.some(job => job._id === evaluation.fineTuneJobId)
                );
                setEvaluations(relevantEvals);
            } else {
                // Load all user data
                const [, jobs, evals] = await Promise.all([
                    trainingService.datasets.getUserDatasets(),
                    trainingService.fineTune.getUserFineTuneJobs(),
                    trainingService.evaluations.getUserEvaluationJobs()
                ]);
                setFineTuneJobs(jobs);
                setEvaluations(evals);
            }
        } catch (error) {
            console.error('Failed to load pipeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFineTuneJob = async (dataset: TrainingDataset) => {
        // This would open a modal to create a fine-tune job
        console.log('Create fine-tune job for dataset:', dataset.name);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            case 'running':
                return <CogIcon className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'running':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <CogIcon className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading pipeline...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Fine-Tuning Pipeline Overview
                </h2>

                {/* Pipeline Visualization */}
                <div className="flex items-center space-x-8 mb-8">
                    {/* Dataset Stage */}
                    <div className="flex-1">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Dataset</h3>
                            <p className="text-sm text-gray-500">Training data preparation</p>
                            {dataset && (
                                <div className="mt-2 text-xs text-gray-600">
                                    <div>{dataset.items.length} items</div>
                                    <div className="flex justify-center space-x-1 mt-1">
                                        <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded">
                                            {dataset.splits.train.count} train
                                        </span>
                                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                            {dataset.splits.dev.count} dev
                                        </span>
                                        <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded">
                                            {dataset.splits.test.count} test
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />

                    {/* Fine-Tuning Stage */}
                    <div className="flex-1">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CogIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Fine-Tuning</h3>
                            <p className="text-sm text-gray-500">Model training</p>
                            <div className="mt-2 text-xs text-gray-600">
                                <div>{fineTuneJobs.length} jobs</div>
                                <div className="flex justify-center space-x-1 mt-1">
                                    {['succeeded', 'running', 'failed'].map(status => {
                                        const count = fineTuneJobs.filter(job => job.status === status).length;
                                        if (count > 0) {
                                            return (
                                                <span key={status} className={`px-1 py-0.5 rounded text-xs ${getStatusColor(status)}`}>
                                                    {count} {status}
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />

                    {/* Evaluation Stage */}
                    <div className="flex-1">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <EyeIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Evaluation</h3>
                            <p className="text-sm text-gray-500">Performance analysis</p>
                            <div className="mt-2 text-xs text-gray-600">
                                <div>{evaluations.length} evaluations</div>
                                {evaluations.length > 0 && (
                                    <div className="mt-1">
                                        Avg Score: {Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.results.overallScore, 0) / evaluations.length)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dataset Information */}
                {dataset && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">Dataset: {dataset.name} v{dataset.version}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Total Items:</span>
                                <span className="ml-2 font-medium">{dataset.items.length}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Target Model:</span>
                                <span className="ml-2 font-medium">{dataset.targetModel}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Use Case:</span>
                                <span className="ml-2 font-medium">{dataset.targetUseCase}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">PII Items:</span>
                                <span className="ml-2 font-medium text-red-600">{dataset.stats.piiStats.totalWithPII}</span>
                            </div>
                        </div>

                        {dataset.stats.piiStats.totalWithPII > 0 && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                ⚠️ This dataset contains PII. Consider sanitization before training.
                            </div>
                        )}
                    </div>
                )}

                {/* Fine-Tune Jobs */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Fine-Tune Jobs</h4>
                        {dataset && (
                            <button
                                onClick={() => handleCreateFineTuneJob(dataset)}
                                className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                            >
                                <PlayIcon className="h-4 w-4 mr-1" />
                                Start Training
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {fineTuneJobs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No fine-tune jobs yet. Create one to start training your model.
                            </div>
                        ) : (
                            fineTuneJobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                                    onClick={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            {getStatusIcon(job.status)}
                                            <span className="ml-2 font-medium text-gray-900">{job.name}</span>
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {job.provider} • {job.baseModel}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{job.progress.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Cost and Timing */}
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Est. Cost: ${job.cost.estimated.toFixed(3)}</span>
                                        <span>
                                            {job.timing.completedAt ?
                                                `Completed ${new Date(job.timing.completedAt).toLocaleDateString()}` :
                                                `Started ${new Date(job.timing.queuedAt).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>

                                    {/* Expanded Details */}
                                    {selectedJob?._id === job._id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <h5 className="font-medium mb-2">Hyperparameters</h5>
                                                    <div className="space-y-1 text-xs text-gray-600">
                                                        <div>Learning Rate: {job.hyperparameters.learningRate || 'Default'}</div>
                                                        <div>Batch Size: {job.hyperparameters.batchSize || 'Default'}</div>
                                                        <div>Epochs: {job.hyperparameters.epochs || 'Default'}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium mb-2">Results</h5>
                                                    <div className="space-y-1 text-xs text-gray-600">
                                                        {job.results.modelId && <div>Model ID: {job.results.modelId}</div>}
                                                        {job.error && <div className="text-red-600">Error: {job.error.message}</div>}
                                                        <div>Evaluations: {evaluations.filter(e => e.fineTuneJobId === job._id).length}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Evaluations */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-4">Evaluations</h4>
                    <div className="grid gap-4">
                        {evaluations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No evaluations yet. Evaluations are automatically triggered when fine-tuning completes.
                            </div>
                        ) : (
                            evaluations.map((evaluation) => (
                                <div key={evaluation._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            {getStatusIcon(evaluation.status)}
                                            <span className="ml-2 font-medium text-gray-900">{evaluation.name}</span>
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getStatusColor(evaluation.status)}`}>
                                                {evaluation.status}
                                            </span>
                                        </div>
                                        {evaluation.status === 'completed' && (
                                            <div className="text-sm font-medium text-green-600">
                                                Score: {Math.round(evaluation.results.overallScore)}%
                                            </div>
                                        )}
                                    </div>

                                    {evaluation.status === 'completed' && (
                                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <div className="font-medium text-blue-600">
                                                    {Math.round(evaluation.results.qualityAnalysis.humanLikenessScore)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Human-like</div>
                                            </div>
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <div className="font-medium text-green-600">
                                                    {Math.round(evaluation.results.qualityAnalysis.coherenceScore)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Coherence</div>
                                            </div>
                                            <div className="text-center p-2 bg-purple-50 rounded">
                                                <div className="font-medium text-purple-600">
                                                    {Math.round(evaluation.results.qualityAnalysis.relevanceScore)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Relevance</div>
                                            </div>
                                            <div className="text-center p-2 bg-red-50 rounded">
                                                <div className="font-medium text-red-600">
                                                    {Math.round(evaluation.results.qualityAnalysis.safetyScore)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Safety</div>
                                            </div>
                                        </div>
                                    )}

                                    {evaluation.results.recommendations.length > 0 && (
                                        <div className="mt-3 p-2 bg-gray-50 rounded">
                                            <div className="text-xs font-medium text-gray-700 mb-1">Recommendations:</div>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {evaluation.results.recommendations.slice(0, 3).map((rec, idx) => (
                                                    <li key={idx}>• {rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
