import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Key,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Settings,
  BookOpen,
  Code,
  Link2,
} from "lucide-react";
import { userService } from "../../services/user.service";
import { ProjectService } from "../../services/project.service";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "../../contexts/NotificationContext";
import { Modal } from "../common/Modal";

interface ApiKeyIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyIntegration: React.FC<ApiKeyIntegrationProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"setup" | "usage" | "examples">(
    "setup",
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const { showNotification } = useNotifications();

  const { data: apiKeys, isLoading: loadingKeys } = useQuery(
    ["dashboard-api-keys"],
    userService.getDashboardApiKeys,
  );

  const { data: projects, isLoading: loadingProjects } = useQuery(
    ["projects"],
    ProjectService.getProjects,
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showNotification("Copied to clipboard!", "success");
    setTimeout(() => setCopied(""), 2000);
  };

  const generateIntegrationCode = () => {
    const selectedApiKey = apiKeys?.find((key) =>
      key.permissions.includes("read"),
    );
    const selectedProjectData = projects?.find(
      (p) => p._id === selectedProject,
    );

    return {
      javascript: `// Install the AI Cost Tracker SDK
// npm install ai-cost-tracker

import { AICostTracker } from 'ai-cost-tracker';

// Initialize with your dashboard API key
const tracker = new AICostTracker({
    dashboardUrl: '${window.location.origin}/api',
    apiKey: '${selectedApiKey?.maskedKey || "your_dashboard_api_key"}',
    defaultProjectId: '${selectedProject || "your_project_id"}',
});

// Track usage for a project
await tracker.trackUsage({
    projectId: '${selectedProject || "your_project_id"}',
    service: 'openai',
    model: 'gpt-4',
    prompt: 'Generate a product description for...',
    completion: 'This innovative product...',
    promptTokens: 25,
    completionTokens: 150,
    totalTokens: 175,
    cost: 0.0035,
    responseTime: 1200,
    metadata: {
        endpoint: '/api/completions',
        temperature: 0.7
    },
    costAllocation: {
        department: '${selectedProjectData?.department || "engineering"}',
        team: '${selectedProjectData?.team || "ai-team"}',
        purpose: 'content-generation'
    },
    tags: ['product', 'marketing', 'ai-generated']
});

// Get project data
const projectData = await tracker.getProject('${selectedProject || "your_project_id"}');
console.log('Project:', projectData);

// Get analytics
const analytics = await tracker.getAnalytics({
    projectId: '${selectedProject || "your_project_id"}',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
});
console.log('Analytics:', analytics);`,

      python: `# Install the AI Cost Tracker SDK
# pip install ai-cost-tracker

from ai_cost_tracker import AICostTracker

# Initialize with your dashboard API key
tracker = AICostTracker(
    dashboard_url='${window.location.origin}/api',
    api_key='${selectedApiKey?.maskedKey || "your_dashboard_api_key"}',
    default_project_id='${selectedProject || "your_project_id"}'
)

# Track usage for a project
tracker.track_usage(
    project_id='${selectedProject || "your_project_id"}',
    service='openai',
    model='gpt-4',
    prompt='Generate a product description for...',
    completion='This innovative product...',
    prompt_tokens=25,
    completion_tokens=150,
    total_tokens=175,
    cost=0.0035,
    response_time=1200,
    metadata={
        'endpoint': '/api/completions',
        'temperature': 0.7
    },
    cost_allocation={
        'department': '${selectedProjectData?.department || "engineering"}',
        'team': '${selectedProjectData?.team || "ai-team"}',
        'purpose': 'content-generation'
    },
    tags=['product', 'marketing', 'ai-generated']
)

# Get project data
project_data = tracker.get_project('${selectedProject || "your_project_id"}')
print(f"Project: {project_data}")

# Get analytics
analytics = tracker.get_analytics(
    project_id='${selectedProject || "your_project_id"}',
    start_date='2024-01-01',
    end_date='2024-12-31'
)
print(f"Analytics: {analytics}")`,

      curl: `# Direct API integration using cURL with Dashboard API Key

# Track usage
curl -X POST "${window.location.origin}/api/usage/track" \\
  -H "Authorization: Bearer ${selectedApiKey?.maskedKey || "your_dashboard_api_key"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "${selectedProject || "your_project_id"}",
    "service": "openai",
    "model": "gpt-4",
    "prompt": "Generate a product description for...",
    "completion": "This innovative product...",
    "promptTokens": 25,
    "completionTokens": 150,
    "totalTokens": 175,
    "cost": 0.0035,
    "responseTime": 1200,
    "metadata": {
        "endpoint": "/api/completions",
        "temperature": 0.7
    },
    "costAllocation": {
        "department": "${selectedProjectData?.department || "engineering"}",
        "team": "${selectedProjectData?.team || "ai-team"}",
        "purpose": "content-generation"
    },
    "tags": ["product", "marketing", "ai-generated"]
}'

# Get project data
curl -X GET "${window.location.origin}/api/projects/${selectedProject || "your_project_id"}" \\
  -H "Authorization: Bearer ${selectedApiKey?.maskedKey || "your_dashboard_api_key"}"

# Get analytics
curl -X GET "${window.location.origin}/api/analytics?projectId=${selectedProject || "your_project_id"}" \\
  -H "Authorization: Bearer ${selectedApiKey?.maskedKey || "your_dashboard_api_key"}"`,

      webhook: `# Webhook Integration for Real-time Usage Tracking
# Set up webhook endpoint to receive usage data

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Webhook to receive AI usage events
app.post('/webhook/ai-usage', async (req, res) => {
    const usageData = req.body;
    
    try {
        // Forward to AI Cost Tracker
        await axios.post('${window.location.origin}/api/usage/track', {
            projectId: '${selectedProject || "your_project_id"}',
            service: usageData.service,
            model: usageData.model,
            prompt: usageData.prompt,
            completion: usageData.completion,
            promptTokens: usageData.prompt_tokens,
            completionTokens: usageData.completion_tokens,
            totalTokens: usageData.total_tokens,
            cost: usageData.cost,
            responseTime: usageData.response_time,
            metadata: usageData.metadata,
            costAllocation: usageData.cost_allocation,
            tags: usageData.tags
        }, {
            headers: {
                'Authorization': 'Bearer ${selectedApiKey?.maskedKey || "your_dashboard_api_key"}',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Usage tracked:', usageData);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error tracking usage:', error);
        res.status(500).json({ error: 'Failed to track usage' });
    }
});

app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
});`,
    };
  };

  if (loadingKeys || loadingProjects) {
    return <LoadingSpinner />;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dashboard API Integration">
      <div className="mx-auto max-w-4xl">
        {/* Header with Icon */}
        <div className="mb-6 flex items-center gap-2">
          <Link2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-2xl font-display font-bold gradient-text-primary">Dashboard API Integration</h2>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
          <div className="flex space-x-4">
            {[
              { id: "setup", name: "Setup", icon: Settings },
              { id: "usage", name: "Usage Guide", icon: BookOpen },
              { id: "examples", name: "Code Examples", icon: Code },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn ${activeTab === tab.id
                    ? "btn-primary"
                    : "btn-secondary"
                    } flex items-center gap-2`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="space-y-8">
            {/* API Key Status */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-primary/10 dark:bg-gradient-primary/20 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Dashboard API Key Integration
                </h3>
              </div>
              <p className="font-body text-primary-700 dark:text-primary-300">
                Your dashboard API keys provide secure access to your project
                data, usage tracking, and analytics.
              </p>
            </div>

            {/* API Keys List */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center mr-3 shadow-lg">
                  <Key className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
                  <Key className="h-5 w-5 text-success-600 dark:text-success-400" />
                  Available Dashboard API Keys
                </h4>
              </div>
              <div className="space-y-4">
                {apiKeys?.map((apiKey) => (
                  <div
                    key={apiKey.keyId}
                    className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-4 bg-gradient-to-br from-success-50/50 to-success-100/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg gradient-text-success">
                            {apiKey.name}
                          </p>
                          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                            <Key className="h-3 w-3" />
                            {apiKey.maskedKey} •
                            <span className="flex items-center gap-1">
                              <span className="text-xs">🛡️</span>
                              Permissions: {apiKey.permissions.join(", ")}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-display font-bold shadow-lg ${apiKey.isExpired
                        ? "bg-gradient-danger text-white"
                        : "bg-gradient-success text-white"
                        }`}>
                        {apiKey.isExpired ? (
                          <>
                            <AlertTriangle className="mr-1 w-4 h-4" />
                            Expired
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 w-4 h-4" />
                            Active
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!apiKeys || apiKeys.length === 0) && (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-display font-bold gradient-text-primary mb-2">No dashboard API keys configured</p>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      Create API keys in Settings to enable integration
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Selection */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
                  <span className="text-lg">📁</span>
                  Select Project for Integration
                </h4>
              </div>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="input w-full font-display font-semibold"
              >
                <option value="">Select a project...</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-success/10 dark:bg-gradient-success/20 p-4 mt-4">
                  <p className="text-sm font-display font-bold gradient-text-success mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Project selected: {projects?.find((p) => p._id === selectedProject)?.name}
                  </p>
                  <p className="text-xs font-body text-success-600 dark:text-success-400 flex items-center gap-2">
                    <span className="text-xs">🆔</span>
                    Project ID:{" "}
                    <code className="px-2 py-1 bg-success-100 dark:bg-success-800 rounded font-mono text-xs">
                      {selectedProject}
                    </code>
                  </p>
                </div>
              )}
            </div>

            {/* Integration Warning */}
            {(!apiKeys || apiKeys.length === 0) && (
              <div className="glass rounded-xl border border-warning-200/30 dark:border-warning-500/30 shadow-2xl backdrop-blur-xl bg-gradient-warning/10 dark:bg-gradient-warning/20 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center mr-4 shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-warning flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                    Setup Required
                  </h3>
                </div>
                <p className="font-body text-warning-700 dark:text-warning-300">
                  Create dashboard API keys in Settings to enable integration features.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === "usage" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Integration Code Examples
              </h3>
              <div className="space-y-4">
                {Object.entries(generateIntegrationCode()).map(
                  ([language, code]) => (
                    <div
                      key={language}
                      className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-b border-primary-200/30 rounded-t-xl">
                        <span className="font-medium gradient-text-primary capitalize">
                          {language}
                        </span>
                        <button
                          onClick={() => copyToClipboard(code, language)}
                          className="btn btn-ghost flex items-center text-sm gap-1"
                        >
                          {copied === language ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copied === language ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <pre className="overflow-x-auto p-4 text-sm text-light-text-primary dark:text-dark-text-primary bg-gradient-to-br from-secondary-50/30 to-secondary-100/30">
                        <code>{code}</code>
                      </pre>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Environment Variables */}
            <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30">
              <h5 className="mb-2 font-medium gradient-text-primary">
                Environment Variables
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="gradient-text-primary">
                    DASHBOARD_API_KEY
                  </code>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    {" "}
                    ={" "}
                    {apiKeys?.find((k) => k.permissions.includes("read"))
                      ?.maskedKey || "Create an API key in Settings"}
                  </span>
                </div>
                <div>
                  <code className="gradient-text-primary">
                    DASHBOARD_URL
                  </code>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    {" "}
                    = {window.location.origin}/api
                  </span>
                </div>
                <div>
                  <code className="gradient-text-primary">
                    PROJECT_ID
                  </code>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    {" "}
                    = {selectedProject || "Select a project above"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === "examples" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Common Use Cases
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
                  <h4 className="mb-2 font-medium gradient-text-primary">
                    Track AI Usage
                  </h4>
                  <p className="mb-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Automatically track AI API calls and costs
                  </p>
                  <code className="block p-2 text-xs bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 rounded">
                    POST /api/usage/track
                  </code>
                </div>

                <div className="p-4 rounded-lg border dark:border-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Get Project Analytics
                  </h4>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Retrieve cost and usage analytics
                  </p>
                  <code className="block p-2 text-xs bg-gray-100 rounded dark:bg-gray-800">
                    GET /api/analytics?projectId=...
                  </code>
                </div>

                <div className="p-4 rounded-lg border dark:border-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    List Projects
                  </h4>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Get all accessible projects
                  </p>
                  <code className="block p-2 text-xs bg-gray-100 rounded dark:bg-gray-800">
                    GET /api/projects
                  </code>
                </div>

                <div className="p-4 rounded-lg border dark:border-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Export Data
                  </h4>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Export usage data in various formats
                  </p>
                  <code className="block p-2 text-xs bg-gray-100 rounded dark:bg-gray-800">
                    GET /api/projects/:id/export
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
