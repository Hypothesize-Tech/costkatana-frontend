import React, { useState } from 'react';
import { Database, Sparkles, BookOpen, Settings, TrendingUp, Brain } from 'lucide-react';
import CKQLQueryInterface from '../components/ckql/CKQLQueryInterface';
import VectorizationManager from '../components/ckql/VectorizationManager';
import NotebookGallery from '../components/notebooks/NotebookGallery';
import InteractiveNotebook from '../components/notebooks/InteractiveNotebook';
import AIInsightsDashboard from '../components/insights/AIInsightsDashboard';
import TelemetryViewer from '../components/telemetry/TelemetryViewer';
import { AutoScalingRecommendations } from '../components/optimization/AutoScalingRecommendations';
import { Notebook } from '../services/notebook.service';

export const CostLake: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'query' | 'notebooks' | 'vectorization' | 'insights' | 'telemetry' | 'optimization'>('query');
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [showNotebookGallery, setShowNotebookGallery] = useState(true);

  const handleSelectNotebook = (notebookId: string) => {
    setSelectedNotebook(notebookId);
    setShowNotebookGallery(false);
  };

  const handleCreateNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook.id);
    setShowNotebookGallery(false);
  };

  const handleBackToGallery = () => {
    setSelectedNotebook(null);
    setShowNotebookGallery(true);
  };

  const tabs = [
    {
      id: 'query' as const,
      name: 'Natural Language Queries',
      icon: Sparkles,
      description: 'Ask questions about your costs in plain English'
    },
    {
      id: 'notebooks' as const,
      name: 'Analysis Notebooks',
      icon: BookOpen,
      description: 'Interactive cost analysis and exploration'
    },
    {
      id: 'vectorization' as const,
      name: 'Vector Search Setup',
      icon: Settings,
      description: 'Configure semantic search capabilities'
    },
    {
      id: 'insights' as const,
      name: 'AI Insights',
      icon: Brain,
      description: 'Automated cost insights and recommendations'
    },
    {
      id: 'telemetry' as const,
      name: 'Telemetry Data',
      icon: Database,
      description: 'View and vectorize telemetry records for semantic search'
    },
    {
      id: 'optimization' as const,
      name: 'Auto-Scaling',
      icon: TrendingUp,
      description: 'AI-powered scaling recommendations and cost optimization'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cost Lake</h1>
              <p className="text-gray-600 mt-1">
                Unified telemetry lake with semantic search and AI-powered cost analysis
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Natural Language Queries</div>
                <div className="text-sm text-blue-700">Ask "why did costs spike?" in plain English</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Semantic Search</div>
                <div className="text-sm text-green-700">Find patterns and anomalies automatically</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">AI-Powered Insights</div>
                <div className="text-sm text-purple-700">Get intelligent cost narratives</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'query' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ask Anything About Your Costs</h2>
              <p className="text-gray-600">
                Use natural language to query your telemetry data. Ask questions like "What are my most expensive AI operations?"
                or "Show me slow requests that cost more than $0.01"
              </p>
            </div>
            <CKQLQueryInterface />
          </div>
        )}

        {activeTab === 'notebooks' && (
          <div>
            {showNotebookGallery ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Notebooks</h2>
                  <p className="text-gray-600">
                    Create and execute interactive cost analysis notebooks with embedded queries,
                    visualizations, and AI-generated insights.
                  </p>
                </div>
                <NotebookGallery
                  onSelectNotebook={handleSelectNotebook}
                  onCreateNotebook={handleCreateNotebook}
                />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <button
                    onClick={handleBackToGallery}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Notebooks
                  </button>
                </div>
                <InteractiveNotebook
                  notebookId={selectedNotebook || undefined}
                  onSave={() => {/* Handle save */ }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'vectorization' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vector Search Setup</h2>
              <p className="text-gray-600">
                Configure and manage semantic search capabilities for your telemetry data
              </p>
            </div>
            <VectorizationManager />
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <AIInsightsDashboard />
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Telemetry Data Management</h2>
              <p className="text-gray-600">
                View your telemetry records and vectorize them for semantic search capabilities.
                Vectorized data enables natural language queries and AI-powered insights.
              </p>
            </div>
            <TelemetryViewer />
          </div>
        )}

        {activeTab === 'optimization' && (
          <div>
            <AutoScalingRecommendations usagePatterns={[
              { day: 'Monday', timeSlot: 'Night', requests: 5142, cost: 0.68, avgDuration: 8124, errors: 0 },
              { day: 'Sunday', timeSlot: 'Evening', requests: 3978, cost: 1.21, avgDuration: 7777, errors: 0 },
              { day: 'Sunday', timeSlot: 'Morning', requests: 236, cost: 2.03, avgDuration: 1435, errors: 0 },
              { day: 'Sunday', timeSlot: 'Afternoon', requests: 247, cost: 1.94, avgDuration: 1440, errors: 0 },
              { day: 'Sunday', timeSlot: 'Night', requests: 249, cost: 1.98, avgDuration: 1267, errors: 0 },
              { day: 'Saturday', timeSlot: 'Evening', requests: 148, cost: 1.05, avgDuration: 1430, errors: 0 }
            ]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CostLake;
