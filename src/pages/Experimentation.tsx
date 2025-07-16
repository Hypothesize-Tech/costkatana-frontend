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
            icon: <ChartBarIcon className="h-5 w-5" />,
            description: 'Compare different AI models side-by-side',
            color: 'text-blue-600'
        },
        {
            id: 'what-if-scenarios' as Tab,
            name: 'What-If Scenarios',
            icon: <LightBulbIcon className="h-5 w-5" />,
            description: 'Simulate financial impact of changes',
            color: 'text-green-600'
        },
        {
            id: 'fine-tuning-analysis' as Tab,
            name: 'Fine-Tuning Analysis',
            icon: <CogIcon className="h-5 w-5" />,
            description: 'Analyze custom model development costs',
            color: 'text-purple-600'
        }
    ];

    const statCards = [
        {
            title: 'Total Experiments',
            value: stats.totalExperiments,
            icon: <BeakerIcon className="h-8 w-8 text-blue-600" />,
            color: 'bg-blue-50',
            change: '+12%',
            changeType: 'increase' as const
        },
        {
            title: 'Average Cost Savings',
            value: `$${stats.avgCostSavings.toFixed(2)}`,
            icon: <CurrencyDollarIcon className="h-8 w-8 text-green-600" />,
            color: 'bg-green-50',
            change: '+8%',
            changeType: 'increase' as const
        },
        {
            title: 'Success Rate',
            value: `${(stats.successRate * 100).toFixed(1)}%`,
            icon: <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />,
            color: 'bg-purple-50',
            change: '+5%',
            changeType: 'increase' as const
        },
        {
            title: 'Models Compared',
            value: stats.totalModelsCompared,
            icon: <ChartBarIcon className="h-8 w-8 text-yellow-600" />,
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
        try {
            // Load experimentation statistics
            const experiments = await ExperimentationService.getExperimentHistory();
            const projects = await ExperimentationService.getFineTuningProjects();
            
            // Calculate stats
            const totalExperiments = experiments.length;
            const completedExperiments = experiments.filter(exp => exp.status === 'completed');
            const successRate = totalExperiments > 0 ? completedExperiments.length / totalExperiments : 0;
            
            // Mock calculations for demo - in real app, these would come from actual data
            const avgCostSavings = 142.50;
            const totalModelsCompared = experiments.filter(exp => exp.type === 'model_comparison').length * 3;
            const activeProjects = projects.filter(p => p.status === 'training' || p.status === 'planning').length;
            const totalSavings = avgCostSavings * totalExperiments;

            setStats({
                totalExperiments,
                avgCostSavings,
                successRate,
                totalModelsCompared,
                activeProjects,
                totalSavings
            });

            // Load recommendations
            const recs = await ExperimentationService.getExperimentRecommendations('current-user');
            setRecommendations(recs);
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
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
                                Experimentation & A/B Testing
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Discover the most cost-effective solutions for your unique use cases
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <SparklesIcon className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {recommendations.length} recommendations available
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                    <div className="flex items-center mt-2">
                                        <span className={`text-xs font-medium ${
                                            card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {card.change}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">from last month</span>
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <SparklesIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                Quick Recommendations
                            </h2>
                            <span className="text-sm text-gray-500">
                                Based on your usage patterns
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.slice(0, 3).map((rec, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">{rec.title}</h3>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
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
                                <p className="text-sm text-gray-600 mt-1">
                                    {tabs.find(tab => tab.id === activeTab)?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                                    <span className="text-sm text-red-800">{error}</span>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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