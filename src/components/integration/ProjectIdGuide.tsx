import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DocumentDuplicateIcon,
  CheckIcon,
  InformationCircleIcon,
  FolderIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { ProjectService } from "../../services/project.service";
import { useNotification } from "../../contexts/NotificationContext";

export const ProjectIdGuide: React.FC = () => {
  const [copied, setCopied] = useState<string>("");
  const { showNotification } = useNotification();

  const { data: projects } = useQuery(["projects"], ProjectService.getProjects);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showNotification("Copied to clipboard!", "success");
    setTimeout(() => setCopied(""), 2000);
  };

  const generateProjectUsageExample = (
    projectId: string,
    projectName: string,
  ) => {
    return `// Using Project ID in your application
const projectId = '${projectId}'; // ${projectName}

// Example 1: Track usage with project ID
await optimizer.trackUsage({
    prompt: 'Generate product description',
    completion: 'This innovative product...',
    model: 'gpt-4',
    cost: 0.008,
    tokens: 400,
    projectId: projectId,
    costAllocation: {
        department: 'marketing',
        team: 'content',
        purpose: 'product-descriptions'
    },
    tags: ['product', 'marketing', 'ai-generated']
});

// Example 2: Get project analytics
const analytics = await optimizer.getProjectAnalytics(projectId, {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    groupBy: 'day'
});

// Example 3: Check project budget status
const budgetStatus = await optimizer.getBudgetStatus(projectId);
console.log('Budget utilization:', budgetStatus.utilizationPercentage);

// Example 4: Bulk import with project ID
const usageData = [
    {
        prompt: 'Email template generation',
        model: 'gpt-3.5-turbo',
        cost: 0.002,
        tokens: 150,
        projectId: projectId,
        timestamp: '2024-01-15T10:30:00Z'
    }
    // ... more records
];

await optimizer.bulkImport(usageData);`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            Project ID Integration
          </h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Project IDs help you organize and track AI usage across different
          projects, teams, and departments.
        </p>
      </div>

      {/* Project List */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Available Projects
        </h4>
        <div className="space-y-3">
          {projects?.map((project) => (
            <div
              key={project._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(project._id, `project-${project._id}`)
                    }
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {copied === `project-${project._id}` ? (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                    )}
                    {copied === `project-${project._id}`
                      ? "Copied!"
                      : "Copy ID"}
                  </button>
                </div>
                <div className="mt-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                    {project._id}
                  </code>
                </div>
              </div>

              {/* Usage Example for this project */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1" />
                    Usage Example
                  </h6>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        generateProjectUsageExample(project._id, project.name),
                        `example-${project._id}`,
                      )
                    }
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {copied === `example-${project._id}` ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                  <code>
                    {generateProjectUsageExample(project._id, project.name)}
                  </code>
                </pre>
              </div>
            </div>
          ))}

          {(!projects || projects.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FolderIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No projects found</p>
              <p className="text-sm">
                Create a project to get started with project-based tracking
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Tips */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          Integration Tips
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            • Use project IDs to separate costs by team, department, or client
          </li>
          <li>• Set up budget alerts for each project to monitor spending</li>
          <li>• Use cost allocation metadata for detailed tracking</li>
          <li>• Tag your usage data for better organization and reporting</li>
          <li>• Monitor project analytics to optimize AI usage</li>
        </ul>
      </div>

      {/* Environment Variables */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Environment Variables
        </h5>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
          Set these environment variables in your application:
        </p>
        <div className="space-y-1 text-sm font-mono">
          <div className="flex items-center justify-between bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">
            <span className="text-yellow-800 dark:text-yellow-200">
              AI_COST_DASHBOARD_URL={window.location.origin}/api
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  `${window.location.origin}/api`,
                  "dashboard-url",
                )
              }
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              {copied === "dashboard-url" ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <DocumentDuplicateIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">
            <span className="text-yellow-800 dark:text-yellow-200">
              DEFAULT_PROJECT_ID=your-project-id
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
