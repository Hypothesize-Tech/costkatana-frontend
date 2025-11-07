import React, { useState } from 'react';
import { BookOpen, Lightbulb, Search, BarChart3, FileText, ChevronRight, Play, Sparkles, TrendingUp, DollarSign, Clock, X } from 'lucide-react'; // Added icons for replacements
import { NotebookGuideProps } from './NotebookGallery';

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
            color: 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300'
        },
        {
            type: 'query',
            icon: Search,
            name: 'Query',
            description: 'Ask questions in natural language',
            example: 'Show me expensive AI operations from the last 24 hours',
            color: 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300'
        },
        {
            type: 'visualization',
            icon: BarChart3,
            name: 'Visualization',
            description: 'Create charts and graphs from your data',
            example: 'cost_timeline, model_comparison, usage_heatmap',
            color: 'bg-gradient-success/20 text-success-700 dark:text-success-300'
        },
        {
            type: 'insight',
            icon: Lightbulb,
            name: 'AI Insight',
            description: 'Get AI-powered analysis and recommendations',
            example: 'analyze_cost_spike, analyze_model_efficiency',
            color: 'bg-gradient-accent/20 text-accent-700 dark:text-accent-300'
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
            templateId: 'cost_spike',
            icon: TrendingUp
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
            templateId: 'model_performance',
            icon: BarChart3
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
            templateId: 'usage_patterns',
            icon: TrendingUp
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
            ],
            icon: DollarSign
        },
        {
            category: 'Performance',
            queries: [
                'Show me slow operations from the last hour',
                'Find requests that took longer than 5 seconds',
                'What are the fastest AI models?',
                'Show me operations with high error rates'
            ],
            icon: Clock
        },
        {
            category: 'Usage Patterns',
            queries: [
                'Show me usage patterns by hour of day',
                'Find peak usage times this week',
                'What are the most frequently called operations?',
                'Show me weekend vs weekday usage'
            ],
            icon: TrendingUp
        }
    ];

    return (
        <div className={`glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-primary-200/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-bold gradient-text-primary">Notebook Guide</h2>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                Learn how to create powerful cost analysis notebooks
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex mt-6 border-b border-primary-200/30">
                    {[
                        { id: 'overview' as const, name: 'Overview' },
                        { id: 'examples' as const, name: 'Examples' },
                        { id: 'cells' as const, name: 'Cell Types' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-display font-semibold border-b-2 transition-all duration-300 ${activeTab === tab.id
                                ? 'border-primary-500 gradient-text-primary'
                                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
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
                            <h3 className="font-display text-2xl font-bold gradient-text-primary mb-4">What are Analysis Notebooks?</h3>
                            <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-6 text-lg">
                                Notebooks are interactive documents that combine queries, visualizations, and AI insights
                                to help you investigate cost issues and discover optimization opportunities.
                            </p>
                            <div className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-lg font-bold gradient-text-primary mb-3">Key Benefits</h4>
                                        <ul className="font-body text-light-text-primary dark:text-dark-text-primary space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>Ask questions in plain English - no complex queries needed</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>Get AI-powered insights and recommendations automatically</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>Create visual charts to spot patterns and trends</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>Document your findings and share with your team</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-display text-2xl font-bold gradient-text-primary mb-4">How to Get Started</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center font-display font-bold shadow-lg">1</div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-lg font-semibold gradient-text-primary mb-2">Choose a Template</h4>
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Start with a pre-built template for common scenarios like cost spikes or performance analysis</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center font-display font-bold shadow-lg">2</div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-lg font-semibold gradient-text-primary mb-2">Run the Analysis</h4>
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Click "Run All" to execute all cells and see your data come to life</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center font-display font-bold shadow-lg">3</div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-lg font-semibold gradient-text-primary mb-2">Customize & Explore</h4>
                                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Modify queries, add new cells, and dive deeper into your findings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'examples' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-2xl font-bold gradient-text-primary mb-4">Common Use Cases</h3>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6 text-lg">
                                Here are some real-world scenarios where notebooks can help you solve problems:
                            </p>
                        </div>

                        {examples.map((example, index) => {
                            const Icon = example.icon;
                            return (
                                <div key={index} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h4 className="font-display text-lg font-bold gradient-text-primary">{example.title}</h4>
                                            </div>
                                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">{example.description}</p>
                                        </div>
                                        <button
                                            onClick={() => onCreateExample?.(example.templateId)}
                                            className="btn btn-primary flex items-center gap-2 ml-4"
                                        >
                                            <Play className="w-3 h-3" />
                                            Try It
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="font-display font-semibold gradient-text-primary">Typical workflow:</div>
                                        {example.steps.map((step, stepIndex) => (
                                            <div key={stepIndex} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-gradient-primary/20 flex items-center justify-center shadow-lg mt-0.5">
                                                    <ChevronRight className="w-3 h-3 text-primary-600" />
                                                </div>
                                                <span className="font-body text-light-text-primary dark:text-dark-text-primary flex-1">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="glass p-6 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                                    <Lightbulb className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-display text-lg font-bold gradient-text-success">Sample Query Ideas</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {queryExamples.map((category, index) => {
                                    const Icon = category.icon;
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon className="w-4 h-4 text-primary-500" />
                                                <h5 className="font-display font-semibold gradient-text-primary">{category.category}</h5>
                                            </div>
                                            <ul className="space-y-2">
                                                {category.queries.map((query, qIndex) => (
                                                    <li key={qIndex} className="glass p-3 rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl font-body text-sm text-light-text-primary dark:text-dark-text-primary">
                                                        "{query}"
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cells' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-2xl font-bold gradient-text-primary mb-4">Cell Types Explained</h3>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6 text-lg">
                                Notebooks are made up of different types of cells. Each cell type serves a specific purpose:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cellTypes.map((cellType) => {
                                const Icon = cellType.icon;
                                return (
                                    <div key={cellType.type} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${cellType.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-display text-lg font-bold gradient-text-primary mb-1">{cellType.name}</h4>
                                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">{cellType.description}</p>
                                            </div>
                                        </div>
                                        <div className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl">
                                            <div className="font-display font-semibold gradient-text-primary text-sm mb-2">Example:</div>
                                            <code className="font-mono text-sm gradient-text-primary block">
                                                {cellType.example}
                                            </code>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="glass p-6 rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                                    <Lightbulb className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-display text-lg font-bold gradient-text-accent">Pro Tips</h4>
                            </div>
                            <ul className="font-body text-light-text-primary dark:text-dark-text-primary space-y-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span>Start with markdown cells to document your investigation goals</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span>Use query cells to ask specific questions about your data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span>Add visualization cells after queries to see patterns visually</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span>Use insight cells to get AI recommendations based on your data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span>End with markdown cells to summarize your findings and next steps</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotebookGuide;
