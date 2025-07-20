import React, { useState, useEffect } from 'react';
import {
    BeakerIcon,
    ChartBarIcon,
    CogIcon,
    LightBulbIcon,
    InformationCircleIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ModelComparison, WhatIfScenarios, FineTuningAnalysis } from '../components/experimentation';
import { ExperimentationService } from '../services/experimentation.service';

type Tab = 'model-comparison' | 'what-if-scenarios' | 'fine-tuning-analysis';

interface ExperimentationStats {
    totalExperiments: number;
    avgCostSavings: number;
    successRate: number;
    totalModelsCompared: number;
    activeProjects: number;
    totalSavings: number;
}

const Experimentation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('model-comparison');
    const [stats, setStats] = useState<ExperimentationStats>({
        totalExperiments: 0,
        avgCostSavings: 0,
        successRate: 0,
        totalModelsCompared: 0,
        activeProjects: 0,
        totalSavings: 0
    });
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tabs = [
        {
            id: 'model-comparison' as Tab,
            name: 'Model Comparison',
            icon: <ChartBarIcon className="w-5 h-5" />,
            description: 'Compare different AI models side-by-side',
            color: 'text-blue-600'
        },
        {
            id: 'what-if-scenarios' as Tab,
            name: 'What-If Scenarios',
            icon: <LightBulbIcon className="w-5 h-5" />,
            description: 'Simulate financial impact of changes',
            color: 'text-green-600'
        },
        {
            id: 'fine-tuning-analysis' as Tab,
            name: 'Fine-Tuning Analysis',
            icon: <CogIcon className="w-5 h-5" />,
            description: 'Analyze custom model development costs',
            color: 'text-purple-600'
        }
    ];

    const statCards = [
        {
            title: 'Total Experiments',
            value: stats.totalExperiments,
            icon: <BeakerIcon className="w-8 h-8 text-blue-600" />,
            color: 'bg-blue-50',
            change: '+12%',
            changeType: 'increase' as const
        },
        {
            title: 'Average Cost Savings',
            value: `$${stats.avgCostSavings.toFixed(2)}`,
            icon: <CurrencyDollarIcon className="w-8 h-8 text-green-600" />,
            color: 'bg-green-50',
            change: '+8%',
            changeType: 'increase' as const
        },
        {
            title: 'Success Rate',
            value: `${(stats.successRate * 100).toFixed(1)}%`,
            icon: <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />,
            color: 'bg-purple-50',
            change: '+5%',
            changeType: 'increase' as const
        },
        {
            title: 'Models Compared',
            value: stats.totalModelsCompared,
            icon: <ChartBarIcon className="w-8 h-8 text-yellow-600" />,
            color: 'bg-yellow-50',
            change: '+25%',
            changeType: 'increase' as const
        }
    ];

    useEffect(() => {
        loadExperimentationData();
    }, []);

    const loadExperimentationData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load real experimentation data
            const [experimentsData, fineTuningData, availableModels] = await Promise.all([
                ExperimentationService.getExperiments(),
                ExperimentationService.getFineTuningProjects(),
                ExperimentationService.getAvailableModels()
            ]);

            // Calculate real stats from actual data
            const experiments = experimentsData.experiments || [];
            const fineTuningProjects = fineTuningData.projects || [];

            const totalExperiments = experiments.length;
            const completedExperiments = experiments.filter((exp: any) => exp.status === 'completed');
            const successRate = totalExperiments > 0 ? completedExperiments.length / totalExperiments : 0;

            // Calculate real cost savings from completed experiments
            const totalSavingsFromExperiments = completedExperiments.reduce((sum: number, exp: any) => {
                return sum + (exp.results?.savings || 0);
            }, 0);

            const avgCostSavings = completedExperiments.length > 0 ?
                totalSavingsFromExperiments / completedExperiments.length : 0;

            // Count actual models compared
            const totalModelsCompared = availableModels.totalModels || 0;

            // Count active fine-tuning projects
            const activeProjects = fineTuningProjects.filter((p: any) =>
                p.status === 'training' || p.status === 'pending'
            ).length;

            setStats({
                totalExperiments,
                avgCostSavings,
                successRate,
                totalModelsCompared,
                activeProjects,
                totalSavings: totalSavingsFromExperiments
            });

            // Set real recommendations from fine-tuning data
            const recommendations = fineTuningData.recommendations?.topCandidates || [];
            setRecommendations(recommendations.map((rec: any) => ({
                title: rec.name,
                description: `Fine-tune ${rec.provider} model for ${rec.projectName}`,
                priority: rec.roi > 200 ? 'high' : rec.roi > 100 ? 'medium' : 'low',
                potentialSavings: rec.estimatedSavings,
                effort: rec.trainingExamples > 1000 ? 'high' : rec.trainingExamples > 500 ? 'medium' : 'low'
            })));

        } catch (error) {
            console.error('Error loading experimentation data:', error);
            setError('Failed to load experimentation data');
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'model-comparison':
                return <ModelComparison />;
            case 'what-if-scenarios':
                return <WhatIfScenarios />;
            case 'fine-tuning-analysis':
                return <FineTuningAnalysis />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="flex items-center text-3xl font-bold text-gray-900">
                                <BeakerIcon className="mr-3 w-8 h-8 text-blue-600" />
                                Experimentation & A/B Testing
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Discover the most cost-effective solutions for your unique use cases
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <SparklesIcon className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {recommendations.length} recommendations available
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, index) => (
                        <div key={index} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                                    <div className="flex items-center mt-2">
                                        <span className={`text-xs font-medium ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {card.change}
                                        </span>
                                        <span className="ml-1 text-xs text-gray-500">from last month</span>
                                    </div>
                                </div>
                                <div className={`flex-shrink-0 ${card.color} rounded-lg p-3`}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Recommendations */}
                {recommendations.length > 0 && (
                    <div className="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="flex items-center text-lg font-semibold text-gray-900">
                                <SparklesIcon className="mr-2 w-5 h-5 text-yellow-600" />
                                Quick Recommendations
                            </h2>
                            <span className="text-sm text-gray-500">
                                Based on your usage patterns
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.slice(0, 3).map((rec, index) => (
                                <div key={index} className="p-4 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">{rec.title}</h3>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-xs text-gray-600">{rec.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-600">
                                                ${rec.potentialSavings.toFixed(2)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {rec.effort} effort
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex px-6 space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={activeTab === tab.id ? tab.color : 'text-gray-400'}>
                                        {tab.icon}
                                    </span>
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Descriptions */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-start space-x-3">
                            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                    {tabs.find(tab => tab.id === activeTab)?.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {tabs.find(tab => tab.id === activeTab)?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {error && (
                            <div className="p-4 mb-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="mr-2 w-5 h-5 text-red-400" />
                                    <span className="text-sm text-red-800">{error}</span>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
                                <span className="ml-2 text-gray-600">Loading...</span>
                            </div>
                        ) : (
                            renderTabContent()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Experimentation; 