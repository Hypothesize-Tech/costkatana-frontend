import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    ChartBarIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import {
    TrainingAnalytics,
    TrainingCandidatesList,
    CreateDatasetModal,
    DatasetCard,
    ExportDatasetModal
} from '../components/training';
import { trainingService, TrainingDataset } from '../services/training.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type TabType = 'overview' | 'scoring' | 'datasets' | 'candidates';

export const Training: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState<TrainingDataset | null>(null);

    useEffect(() => {
        loadDatasets();
    }, []);

    const loadDatasets = async () => {
        setLoading(true);
        try {
            const data = await trainingService.datasets.getUserDatasets();
            setDatasets(data);
        } catch (error) {
            console.error('Failed to load datasets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDatasetCreated = (dataset: TrainingDataset) => {
        setDatasets(prev => [dataset, ...prev]);
    };

    const handleDatasetPopulate = async (datasetId: string) => {
        try {
            const updatedDataset = await trainingService.datasets.populateDataset(datasetId);
            setDatasets(prev => prev.map(d => d._id === datasetId ? updatedDataset : d));
        } catch (error) {
            console.error('Failed to populate dataset:', error);
        }
    };

    const handleDatasetDelete = async (datasetId: string) => {
        if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
            return;
        }

        try {
            await trainingService.datasets.deleteDataset(datasetId);
            setDatasets(prev => prev.filter(d => d._id !== datasetId));
        } catch (error) {
            console.error('Failed to delete dataset:', error);
        }
    };

    const handleDatasetExport = (dataset: TrainingDataset) => {
        setSelectedDataset(dataset);
        setShowExportModal(true);
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'scoring', name: 'Request Scoring', icon: StarIcon },
        { id: 'datasets', name: 'Training Datasets', icon: DocumentTextIcon },
        { id: 'candidates', name: 'Training Candidates', icon: AcademicCapIcon }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Cost-Effective Model Training</h1>
                <p className="mt-2 text-gray-600">
                    Create specialized, cost-efficient AI models from your high-quality production data
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                5-Step Training Workflow
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                        1
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Score Requests</h3>
                                    <p className="text-xs text-gray-600">Rate your AI responses 1-5 stars</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                        2
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Filter by Use Case</h3>
                                    <p className="text-xs text-gray-600">Isolate specific business functions</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                        3
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Create Dataset</h3>
                                    <p className="text-xs text-gray-600">Group high-quality requests</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                        4
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Curate Data</h3>
                                    <p className="text-xs text-gray-600">Remove inefficient examples</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                        5
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Export & Train</h3>
                                    <p className="text-xs text-gray-600">Download JSONL for fine-tuning</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    onClick={() => setActiveTab('scoring')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Start Scoring Requests
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                                >
                                    Create Dataset
                                </button>
                            </div>
                        </div>

                        {/* Analytics */}
                        <TrainingAnalytics />
                    </div>
                )}

                {activeTab === 'scoring' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Request Scoring
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Score your AI requests to identify high-quality examples for training.
                                Requests with 4+ stars automatically become training candidates.
                            </p>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Note:</strong> Request scoring is integrated into your usage history and chat interface.
                                    Visit the Usage page or chat with the AI to start scoring requests.
                                </p>
                            </div>
                        </div>

                        <TrainingAnalytics />
                    </div>
                )}

                {activeTab === 'datasets' && (
                    <div className="space-y-6">
                        {/* Header with Create Button */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Training Datasets</h2>
                                <p className="text-gray-600">
                                    Manage your training datasets and export them for fine-tuning
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Create Dataset</span>
                            </button>
                        </div>

                        {/* Datasets Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                                <span className="ml-3 text-gray-600">Loading datasets...</span>
                            </div>
                        ) : datasets.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Datasets Yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Create your first training dataset to get started with cost-effective model training.
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create First Dataset
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {datasets.map((dataset) => (
                                    <DatasetCard
                                        key={dataset._id}
                                        dataset={dataset}
                                        onPopulate={handleDatasetPopulate}
                                        onDelete={handleDatasetDelete}
                                        onExport={handleDatasetExport}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'candidates' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Training Candidates</h2>
                            <p className="text-gray-600">
                                High-quality requests (4+ stars) suitable for training datasets
                            </p>
                        </div>

                        <TrainingCandidatesList />
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateDatasetModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onDatasetCreated={handleDatasetCreated}
            />

            <ExportDatasetModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                dataset={selectedDataset}
            />
        </div>
    );
};