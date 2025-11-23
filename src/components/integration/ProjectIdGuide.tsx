import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  InformationCircleIcon,
  FolderIcon,
  CodeBracketIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  HashtagIcon,
  PencilIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ProjectService } from "../../services/project.service";
import { useNotification } from "../../contexts/NotificationContext";

export const ProjectIdGuide: React.FC = () => {
  const [copied, setCopied] = useState<string>("");
  const { showNotification } = useNotification();

  const { data: projectsData, isLoading, error } = useQuery(
    ["projects"],
    ProjectService.getProjects,
    {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );

  // Ensure projects is always an array - handle different response structures
  const projects = React.useMemo(() => {
    if (!projectsData) return [];
    if (Array.isArray(projectsData)) return projectsData;
    if (typeof projectsData === 'object' && 'data' in projectsData && Array.isArray((projectsData as any).data)) {
      return (projectsData as any).data;
    }
    return [];
  }, [projectsData]);

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
    <div className="space-y-6 sm:space-y-8">
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 p-4 sm:p-6">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
            <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
            <HashtagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#06ec9e] dark:text-emerald-400" />
            Project ID Integration
          </h3>
        </div>
        <p className="text-sm sm:text-base font-body text-emerald-800 dark:text-emerald-200">
          Project IDs help you organize and track AI usage across different
          projects, teams, and departments.
        </p>
      </div>

      {/* Project List */}
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center mr-3 shadow-lg">
            <FolderIcon className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg sm:text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
            <FolderIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#06ec9e] dark:text-emerald-400" />
            Available Projects
          </h4>
        </div>
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
              <FolderIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-base sm:text-lg font-display font-bold gradient-text-primary mb-2">Loading projects...</p>
            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Please wait while we fetch your projects
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-base sm:text-lg font-display font-bold text-red-600 dark:text-red-400 mb-2">Error loading projects</p>
            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              {error instanceof Error ? error.message : "Failed to load projects. Please try again."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {projects && Array.isArray(projects) && projects.length > 0 ? projects.map((project) => {
              if (!project || !project._id) return null;
              return (
                <div
                  key={project._id || `project-${Math.random()}`}
                  className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl overflow-hidden"
                >
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border-b border-green-200/30 dark:border-green-500/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                          <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-display font-bold text-base sm:text-lg text-green-700 dark:text-green-300 truncate">
                            {project.name}
                          </h5>
                          <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                            {project.description || (
                              <>
                                <PencilIcon className="h-3 w-3 text-light-text-secondary dark:text-dark-text-secondary" />
                                <span>No description</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(project._id, `project-${project._id}`)
                        }
                        className="btn btn-success flex items-center gap-2 min-h-[36px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:shadow-lg hover:shadow-green-500/30 dark:hover:shadow-green-500/50 transition-all duration-300 [touch-action:manipulation] active:scale-95 flex-shrink-0"
                      >
                        {copied === `project-${project._id}` ? (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied!</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy ID</span>
                            <span className="sm:hidden">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-3 sm:mt-4 glass p-3 rounded-xl border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl bg-white/50 dark:bg-dark-card/50">
                      <code className="text-xs sm:text-sm font-mono text-green-700 dark:text-green-300 break-all flex items-center gap-2">
                        <HashtagIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="break-all">{project._id}</span>
                      </code>
                    </div>
                  </div>

                  {/* Usage Example for this project */}
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/30 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/20 dark:to-[#009454]/20">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center mr-2 shadow-lg">
                          <CodeBracketIcon className="w-3 h-3 text-white" />
                        </div>
                        <h6 className="text-xs sm:text-sm font-display font-bold gradient-text-primary flex items-center gap-1">
                          <CodeBracketIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          Usage Example
                        </h6>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            generateProjectUsageExample(project._id, project.name),
                            `example-${project._id}`,
                          )
                        }
                        className="btn btn-ghost p-2 min-h-[32px] min-w-[32px] flex items-center justify-center [touch-action:manipulation]"
                      >
                        {copied === `example-${project._id}` ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="glass p-3 sm:p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-white/50 dark:bg-dark-card/50">
                      <pre className="text-xs font-mono text-light-text-primary dark:text-dark-text-primary overflow-x-auto">
                        <code>
                          {generateProjectUsageExample(project._id, project.name)}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                  <FolderIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-base sm:text-lg font-display font-bold gradient-text-primary mb-2">No projects found</p>
                <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Create a project to get started with project-based tracking
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integration Tips */}
      <div className="glass rounded-2xl border border-purple-200/30 dark:border-purple-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center mr-3 shadow-lg">
            <LightBulbIcon className="w-4 h-4 text-white" />
          </div>
          <h5 className="text-lg sm:text-xl font-display font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            Integration Tips
          </h5>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {[
            "Use project IDs to separate costs by team, department, or client",
            "Set up budget alerts for each project to monitor spending",
            "Use cost allocation metadata for detailed tracking",
            "Tag your usage data for better organization and reporting",
            "Monitor project analytics to optimize AI usage"
          ].map((tip, index) => (
            <div key={index} className="glass p-3 rounded-xl border border-purple-200/30 dark:border-purple-500/20 shadow-lg backdrop-blur-xl hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-all duration-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full mr-3 mt-2 flex-shrink-0 shadow-lg"></div>
                <span className="text-xs sm:text-sm font-body text-purple-700 dark:text-purple-300">{tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="glass rounded-2xl border border-yellow-200/30 dark:border-yellow-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 flex items-center justify-center mr-3 shadow-lg">
            <Cog6ToothIcon className="w-4 h-4 text-white" />
          </div>
          <h5 className="text-lg sm:text-xl font-display font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
            <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            Environment Variables
          </h5>
        </div>
        <p className="text-xs sm:text-sm font-body text-yellow-700 dark:text-yellow-300 mb-3 sm:mb-4">
          Set these environment variables in your application:
        </p>
        <div className="space-y-2 sm:space-y-3">
          <div className="glass p-3 sm:p-4 rounded-xl border border-yellow-200/30 dark:border-yellow-500/20 shadow-lg backdrop-blur-xl bg-yellow-100/20 dark:bg-yellow-800/20">
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs sm:text-sm font-mono text-yellow-800 dark:text-yellow-200 break-all flex-1">
                API_KEY=ck_live_sk_a7b9c2d4e8f1g3h5j6k9l2m4n7p0q3r5s8t1u4v7w0x3y6z9
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    "ck_live_sk_a7b9c2d4e8f1g3h5j6k9l2m4n7p0q3r5s8t1u4v7w0x3y6z9",
                    "api-key-sample",
                  )
                }
                className="btn btn-ghost ml-2 sm:ml-3 p-2 min-h-[32px] min-w-[32px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation]"
              >
                {copied === "api-key-sample" ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="glass p-3 sm:p-4 rounded-xl border border-yellow-200/30 dark:border-yellow-500/20 shadow-lg backdrop-blur-xl bg-yellow-100/20 dark:bg-yellow-800/20">
            <code className="text-xs sm:text-sm font-mono text-yellow-800 dark:text-yellow-200">
              DEFAULT_PROJECT_ID=your-project-id
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
