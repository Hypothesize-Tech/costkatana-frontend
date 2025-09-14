import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  StarIcon,
  CogIcon,
  EyeIcon,
  ShieldExclamationIcon,
  DocumentDuplicateIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  TrainingAnalytics,
  TrainingCandidatesList,
  CreateDatasetModal,
  ExportDatasetModal,
  FineTuningPipeline,
  DatasetVersionsModal,
  PIIAnalysisModal,
  CreateFineTuneJobModal,
} from "../components/training";
import { trainingService, TrainingDataset, FineTuneJob, EvaluationJob } from "../services/training.service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

type TabType = "overview" | "pipeline" | "datasets" | "fine-tuning" | "evaluations" | "scoring" | "candidates";

export const Training: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [fineTuneJobs, setFineTuneJobs] = useState<FineTuneJob[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showPIIModal, setShowPIIModal] = useState(false);
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<TrainingDataset | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [datasetsData, jobsData, evaluationsData] = await Promise.all([
        trainingService.datasets.getUserDatasets(),
        trainingService.fineTune.getUserFineTuneJobs(),
        trainingService.evaluations.getUserEvaluationJobs(),
      ]);
      setDatasets(datasetsData);
      setFineTuneJobs(jobsData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error("Failed to load training data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetCreated = (dataset: TrainingDataset) => {
    setDatasets((prev) => [dataset, ...prev]);
  };

  const handleDatasetUpdated = (dataset: TrainingDataset) => {
    setDatasets((prev) =>
      prev.map((d) => (d._id === dataset._id ? dataset : d))
    );
  };

  const handleFineTuneJobCreated = (job: FineTuneJob) => {
    setFineTuneJobs((prev) => [job, ...prev]);
  };

  const handleDatasetPopulate = async (datasetId: string) => {
    try {
      const updatedDataset =
        await trainingService.datasets.populateDataset(datasetId);
      setDatasets((prev) =>
        prev.map((d) => (d._id === datasetId ? updatedDataset : d)),
      );
    } catch (error) {
      console.error("Failed to populate dataset:", error);
    }
  };

  const handleDatasetDelete = async (datasetId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this dataset? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await trainingService.datasets.deleteDataset(datasetId);
      setDatasets((prev) => prev.filter((d) => d._id !== datasetId));
    } catch (error) {
      console.error("Failed to delete dataset:", error);
    }
  };

  const handleDatasetExport = (dataset: TrainingDataset) => {
    setSelectedDataset(dataset);
    setShowExportModal(true);
  };

  const handleShowVersions = (dataset: TrainingDataset) => {
    setSelectedDataset(dataset);
    setShowVersionsModal(true);
  };

  const handleShowPIIAnalysis = (dataset: TrainingDataset) => {
    setSelectedDataset(dataset);
    setShowPIIModal(true);
  };

  const handleStartFineTuning = (dataset: TrainingDataset) => {
    setSelectedDataset(dataset);
    setShowFineTuneModal(true);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "pipeline", name: "Fine-Tuning Pipeline", icon: CogIcon },
    { id: "datasets", name: "Datasets", icon: DocumentTextIcon },
    { id: "fine-tuning", name: "Fine-Tune Jobs", icon: PlayIcon },
    { id: "evaluations", name: "Evaluations", icon: EyeIcon },
    { id: "scoring", name: "Scoring", icon: StarIcon },
    { id: "candidates", name: "Candidates", icon: AcademicCapIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">
                Datasets & Fine-Tuning
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Complete ML pipeline: Dataset management, versioning, PII detection, fine-tuning, and evaluation
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Dataset</span>
              </button>
              <button
                onClick={() => setActiveTab("pipeline")}
                className="btn-secondary flex items-center space-x-2"
              >
                <CogIcon className="h-4 w-4" />
                <span>Pipeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-2 mb-8">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-3 px-4 font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === tab.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10"
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
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 mr-4">
                      <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Datasets</p>
                      <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">{datasets.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CogIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Fine-Tune Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{fineTuneJobs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <EyeIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Evaluations</p>
                      <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">PII Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {datasets.reduce((sum, d) => sum + d.stats.piiStats.totalWithPII, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Workflow */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Complete ML Pipeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <h3 className="font-medium text-gray-900 mb-1">Create Dataset</h3>
                    <p className="text-xs text-gray-600">Build versioned datasets</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <h3 className="font-medium text-gray-900 mb-1">Detect PII</h3>
                    <p className="text-xs text-gray-600">Analyze & sanitize sensitive data</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <h3 className="font-medium text-gray-900 mb-1">Configure Splits</h3>
                    <p className="text-xs text-gray-600">Train/dev/test allocation</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                    <h3 className="font-medium text-gray-900 mb-1">Fine-Tune</h3>
                    <p className="text-xs text-gray-600">Train on AWS/OpenAI</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">5</div>
                    <h3 className="font-medium text-gray-900 mb-1">Evaluate</h3>
                    <p className="text-xs text-gray-600">Automated quality assessment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">6</div>
                    <h3 className="font-medium text-gray-900 mb-1">Deploy</h3>
                    <p className="text-xs text-gray-600">Production integration</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => setActiveTab("pipeline")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    View Pipeline
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
                  >
                    Start Building
                  </button>
                </div>
              </div>

              {/* Analytics */}
              <TrainingAnalytics />
            </div>
          )}

          {activeTab === "pipeline" && (
            <div className="space-y-6">
              <FineTuningPipeline />
            </div>
          )}

          {activeTab === "scoring" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Request Scoring
                </h2>
                <p className="text-gray-600 mb-6">
                  Score your AI requests to identify high-quality examples for
                  training. Requests with 4+ stars automatically become training
                  candidates.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Request scoring is integrated into your
                    usage history and chat interface. Visit the Usage page or chat
                    with the AI to start scoring requests.
                  </p>
                </div>
              </div>

              <TrainingAnalytics />
            </div>
          )}

          {activeTab === "datasets" && (
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Training Datasets
                  </h2>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Datasets Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first dataset with versioning, PII detection, and automated splits.
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
                    <div key={dataset._id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{dataset.name}</h3>
                          <p className="text-sm text-gray-600">v{dataset.version} • {dataset.status}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleShowVersions(dataset)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Manage Versions"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleShowPIIAnalysis(dataset)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="PII Analysis"
                          >
                            <ShieldExclamationIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStartFineTuning(dataset)}
                            className="p-2 text-gray-400 hover:text-purple-600"
                            title="Start Fine-Tuning"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>Items: <span className="font-medium">{dataset.items.length}</span></div>
                        <div>Use Case: <span className="font-medium">{dataset.targetUseCase}</span></div>
                        <div>Target: <span className="font-medium">{dataset.targetModel}</span></div>
                        <div>PII: <span className={dataset.stats.piiStats.totalWithPII > 0 ? 'font-medium text-red-600' : 'font-medium text-green-600'}>
                          {dataset.stats.piiStats.totalWithPII}
                        </span></div>
                      </div>

                      {/* Dataset splits visualization */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Data Splits</span>
                          <span>Train: {dataset.splits.train.count} | Dev: {dataset.splits.dev.count} | Test: {dataset.splits.test.count}</span>
                        </div>
                        <div className="flex w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-l-full"
                            style={{ width: `${dataset.splits.train.percentage}%` }}
                          />
                          <div
                            className="bg-yellow-500 h-2"
                            style={{ width: `${dataset.splits.dev.percentage}%` }}
                          />
                          <div
                            className="bg-purple-500 h-2 rounded-r-full"
                            style={{ width: `${dataset.splits.test.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => handleDatasetPopulate(dataset._id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Populate
                        </button>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleDatasetExport(dataset)}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => handleDatasetDelete(dataset._id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "fine-tuning" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Fine-Tune Jobs</h2>
                  <p className="text-gray-600">Manage and monitor your fine-tuning jobs</p>
                </div>
              </div>

              {fineTuneJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No fine-tune jobs yet. Create a dataset first, then start fine-tuning.</p>
                  <button
                    onClick={() => setActiveTab("datasets")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    View Datasets
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fineTuneJobs.map((job) => (
                    <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{job.name}</h3>
                          <p className="text-sm text-gray-600">{job.provider} • {job.baseModel}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${job.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                          job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="mb-4">
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>Cost: <span className="font-medium">${job.cost.estimated.toFixed(3)}</span></div>
                        <div>Epochs: <span className="font-medium">{job.hyperparameters.epochs}</span></div>
                        <div>Batch Size: <span className="font-medium">{job.hyperparameters.batchSize}</span></div>
                        <div>Started: <span className="font-medium">{new Date(job.timing.queuedAt).toLocaleDateString()}</span></div>
                      </div>

                      {job.results.modelId && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-800">
                          Model ID: {job.results.modelId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "evaluations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Evaluations</h2>
                <p className="text-gray-600">Performance analysis and quality metrics for your models</p>
              </div>

              {evaluations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No evaluations yet. Evaluations are automatically created when fine-tuning completes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation._id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{evaluation.name}</h3>
                          <p className="text-sm text-gray-600">{evaluation.evaluationType} evaluation</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded ${evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            evaluation.status === 'failed' ? 'bg-red-100 text-red-800' :
                              evaluation.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {evaluation.status}
                          </span>
                          {evaluation.status === 'completed' && (
                            <span className="text-lg font-bold text-green-600">
                              {Math.round(evaluation.results.overallScore)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {evaluation.status === 'completed' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">
                              {Math.round(evaluation.results.qualityAnalysis.humanLikenessScore)}%
                            </div>
                            <div className="text-xs text-gray-600">Human-like</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">
                              {Math.round(evaluation.results.qualityAnalysis.coherenceScore)}%
                            </div>
                            <div className="text-xs text-gray-600">Coherence</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">
                              {Math.round(evaluation.results.qualityAnalysis.relevanceScore)}%
                            </div>
                            <div className="text-xs text-gray-600">Relevance</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded">
                            <div className="text-lg font-bold text-red-600">
                              {Math.round(evaluation.results.qualityAnalysis.safetyScore)}%
                            </div>
                            <div className="text-xs text-gray-600">Safety</div>
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        Cost: ${evaluation.cost.estimated.toFixed(3)} •
                        Started: {new Date(evaluation.timing.queuedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Training Candidates
                </h2>
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

        <DatasetVersionsModal
          isOpen={showVersionsModal}
          onClose={() => setShowVersionsModal(false)}
          dataset={selectedDataset}
          onVersionCreated={handleDatasetUpdated}
        />

        <PIIAnalysisModal
          isOpen={showPIIModal}
          onClose={() => setShowPIIModal(false)}
          dataset={selectedDataset}
          onDatasetUpdated={handleDatasetUpdated}
        />

        <CreateFineTuneJobModal
          isOpen={showFineTuneModal}
          onClose={() => setShowFineTuneModal(false)}
          dataset={selectedDataset}
          onJobCreated={handleFineTuneJobCreated}
        />
      </div>
    </div>
  );
};
