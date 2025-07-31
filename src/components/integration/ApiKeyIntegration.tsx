import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KeyIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  BookOpenIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
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
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {[
              { id: "setup", name: "Setup", icon: CogIcon },
              { id: "usage", name: "Usage Guide", icon: BookOpenIcon },
              { id: "examples", name: "Code Examples", icon: CodeBracketIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="mr-2 w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="space-y-6">
            {/* API Key Status */}
            <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <div className="flex items-center">
                <InformationCircleIcon className="mr-2 w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Dashboard API Key Integration
                </h3>
              </div>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Your dashboard API keys provide secure access to your project
                data, usage tracking, and analytics.
              </p>
            </div>

            {/* API Keys List */}
            <div>
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                Available Dashboard API Keys
              </h4>
              <div className="space-y-2">
                {apiKeys?.map((apiKey) => (
                  <div
                    key={apiKey.keyId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                  >
                    <div className="flex items-center">
                      <KeyIcon className="mr-3 w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apiKey.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apiKey.maskedKey} • Permissions:{" "}
                          {apiKey.permissions.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckIcon className="mr-1 w-4 h-4" />
                      <span className="text-sm">
                        {apiKey.isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
                {(!apiKeys || apiKeys.length === 0) && (
                  <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                    <KeyIcon className="mx-auto mb-2 w-12 h-12 opacity-50" />
                    <p>No dashboard API keys configured</p>
                    <p className="text-sm">
                      Create API keys in Settings to enable integration
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                Select Project for Integration
              </h4>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a project...</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <div className="p-3 mt-2 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Project selected:{" "}
                    {projects?.find((p) => p._id === selectedProject)?.name}
                  </p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Project ID:{" "}
                    <code className="px-1 bg-green-100 rounded dark:bg-green-800">
                      {selectedProject}
                    </code>
                  </p>
                </div>
              )}
            </div>

            {/* Integration Warning */}
            {(!apiKeys || apiKeys.length === 0) && (
              <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="mr-2 w-5 h-5 text-yellow-500" />
                  <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Setup Required
                  </h3>
                </div>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Create dashboard API keys in Settings to enable integration
                  features.
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
                      className="rounded-lg border dark:border-gray-700"
                    >
                      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-medium text-gray-900 capitalize dark:text-white">
                          {language}
                        </span>
                        <button
                          onClick={() => copyToClipboard(code, language)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          {copied === language ? (
                            <CheckIcon className="mr-1 w-4 h-4" />
                          ) : (
                            <DocumentDuplicateIcon className="mr-1 w-4 h-4" />
                          )}
                          {copied === language ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <pre className="overflow-x-auto p-4 text-sm text-gray-800 dark:text-gray-200">
                        <code>{code}</code>
                      </pre>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Environment Variables */}
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <h5 className="mb-2 font-medium text-gray-900 dark:text-white">
                Environment Variables
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="text-blue-600 dark:text-blue-400">
                    DASHBOARD_API_KEY
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">
                    {" "}
                    ={" "}
                    {apiKeys?.find((k) => k.permissions.includes("read"))
                      ?.maskedKey || "Create an API key in Settings"}
                  </span>
                </div>
                <div>
                  <code className="text-blue-600 dark:text-blue-400">
                    DASHBOARD_URL
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">
                    {" "}
                    = {window.location.origin}/api
                  </span>
                </div>
                <div>
                  <code className="text-blue-600 dark:text-blue-400">
                    PROJECT_ID
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">
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
                <div className="p-4 rounded-lg border dark:border-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Track AI Usage
                  </h4>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Automatically track AI API calls and costs
                  </p>
                  <code className="block p-2 text-xs bg-gray-100 rounded dark:bg-gray-800">
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
