import React, { useState } from 'react';
import { BookOpen, Lightbulb, Search, BarChart3, FileText, ChevronRight, Play, Sparkles } from 'lucide-react';

interface NotebookGuideProps {
    onClose?: () => void;
    onCreateExample?: (templateId: string) => void;
    className?: string;
}

export const NotebookGuide: React.FC<NotebookGuideProps> = ({
    onClose,
    onCreateExample,
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'cells'>('overview');

    const cellTypes = [
        {
            type: 'markdown',
            icon: FileText,
            name: 'Markdown',
            description: 'Add explanations, headers, and documentation',
            example: '# Cost Analysis\n\nThis section analyzes our AI spending patterns...',
            color: 'bg-gray-100 text-gray-700'
        },
        {
            type: 'query',
            icon: Search,
            name: 'Query',
            description: 'Ask questions in natural language',
            example: 'Show me expensive AI operations from the last 24 hours',
            color: 'bg-blue-100 text-blue-700'
        },
        {
            type: 'visualization',
            icon: BarChart3,
            name: 'Visualization',
            description: 'Create charts and graphs from your data',
            example: 'cost_timeline, model_comparison, usage_heatmap',
            color: 'bg-green-100 text-green-700'
        },
        {
            type: 'insight',
            icon: Lightbulb,
            name: 'AI Insight',
            description: 'Get AI-powered analysis and recommendations',
            example: 'analyze_cost_spike, analyze_model_efficiency',
            color: 'bg-purple-100 text-purple-700'
        }
    ];

    const examples = [
        {
            title: 'Cost Spike Investigation',
            description: 'When costs suddenly increase, use this to find the root cause',
            steps: [
                'Start with a timeline visualization to see when costs spiked',
                'Query for expensive operations during that time',
                'Use AI insights to analyze patterns and get recommendations',
                'Add markdown notes with your findings'
            ],
            templateId: 'cost_spike'
        },
        {
            title: 'Model Performance Analysis',
            description: 'Compare different AI models to optimize cost vs performance',
            steps: [
                'Query all AI model operations from recent period',
                'Create scatter plot comparing cost vs duration',
                'Analyze which models have best cost-per-token ratio',
                'Get AI recommendations for model selection'
            ],
            templateId: 'model_performance'
        },
        {
            title: 'Usage Pattern Discovery',
            description: 'Find patterns in when and how your APIs are used',
            steps: [
                'Query usage data grouped by time periods',
                'Create heatmap showing peak usage times',
                'Identify unusual spikes or patterns',
                'Get insights on capacity planning'
            ],
            templateId: 'usage_patterns'
        }
    ];

    const queryExamples = [
        {
            category: 'Cost Analysis',
            queries: [
                'What are my most expensive operations today?',
                'Show me AI calls that cost more than $0.05',
                'Find operations with unusual cost spikes',
                'Which models have the highest total costs?'
            ]
        },
        {
            category: 'Performance',
            queries: [
                'Show me slow operations from the last hour',
                'Find requests that took longer than 5 seconds',
                'What are the fastest AI models?',
                'Show me operations with high error rates'
            ]
        },
        {
            category: 'Usage Patterns',
            queries: [
                'Show me usage patterns by hour of day',
                'Find peak usage times this week',
                'What are the most frequently called operations?',
                'Show me weekend vs weekday usage'
            ]
        }
    ];

    return (
        <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Notebook Guide</h2>
                            <p className="text-gray-600 text-sm">
                                Learn how to create powerful cost analysis notebooks
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex mt-4 border-b border-gray-200">
                    {[
                        { id: 'overview', name: 'Overview' },
                        { id: 'examples', name: 'Examples' },
                        { id: 'cells', name: 'Cell Types' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">What are Analysis Notebooks?</h3>
                            <p className="text-gray-700 mb-4">
                                Notebooks are interactive documents that combine queries, visualizations, and AI insights
                                to help you investigate cost issues and discover optimization opportunities.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Key Benefits</h4>
                                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                                            <li>• Ask questions in plain English - no complex queries needed</li>
                                            <li>• Get AI-powered insights and recommendations automatically</li>
                                            <li>• Create visual charts to spot patterns and trends</li>
                                            <li>• Document your findings and share with your team</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Get Started</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Choose a Template</h4>
                                        <p className="text-gray-600 text-sm">Start with a pre-built template for common scenarios like cost spikes or performance analysis</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Run the Analysis</h4>
                                        <p className="text-gray-600 text-sm">Click "Run All" to execute all cells and see your data come to life</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Customize & Explore</h4>
                                        <p className="text-gray-600 text-sm">Modify queries, add new cells, and dive deeper into your findings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'examples' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Use Cases</h3>
                            <p className="text-gray-600 mb-4">
                                Here are some real-world scenarios where notebooks can help you solve problems:
                            </p>
                        </div>

                        {examples.map((example, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{example.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{example.description}</p>
                                    </div>
                                    <button
                                        onClick={() => onCreateExample?.(example.templateId)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        <Play className="w-3 h-3" />
                                        Try It
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Typical workflow:</div>
                                    {example.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">Sample Query Ideas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {queryExamples.map((category, index) => (
                                    <div key={index}>
                                        <h5 className="font-medium text-green-800 text-sm mb-2">{category.category}</h5>
                                        <ul className="space-y-1">
                                            {category.queries.map((query, qIndex) => (
                                                <li key={qIndex} className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                                    "{query}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cells' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cell Types Explained</h3>
                            <p className="text-gray-600 mb-4">
                                Notebooks are made up of different types of cells. Each cell type serves a specific purpose:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cellTypes.map((cellType) => {
                                const Icon = cellType.icon;
                                return (
                                    <div key={cellType.type} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${cellType.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{cellType.name}</h4>
                                                <p className="text-gray-600 text-sm">{cellType.description}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded p-3">
                                            <div className="text-xs text-gray-500 mb-1">Example:</div>
                                            <code className="text-xs text-gray-800 font-mono">
                                                {cellType.example}
                                            </code>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-medium text-purple-900 mb-2">Pro Tips</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                                <li>• Start with markdown cells to document your investigation goals</li>
                                <li>• Use query cells to ask specific questions about your data</li>
                                <li>• Add visualization cells after queries to see patterns visually</li>
                                <li>• Use insight cells to get AI recommendations based on your data</li>
                                <li>• End with markdown cells to summarize your findings and next steps</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotebookGuide;
