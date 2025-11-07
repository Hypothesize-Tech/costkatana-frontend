import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  Check,
  Info,
  Folder,
  Code,
  Lightbulb,
  Settings,
} from "lucide-react";
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
    <div className="space-y-8">
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-primary/10 dark:bg-gradient-primary/20 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
            <span className="text-lg">🆔</span>
            Project ID Integration
          </h3>
        </div>
        <p className="font-body text-primary-700 dark:text-primary-300">
          Project IDs help you organize and track AI usage across different
          projects, teams, and departments.
        </p>
      </div>

      {/* Project List */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center mr-3 shadow-lg">
            <Folder className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Available Projects
          </h4>
        </div>
        <div className="space-y-6">
          {projects?.map((project) => (
            <div
              key={project._id}
              className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20 border-b border-success-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
                      <Folder className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-lg gradient-text-success">
                        {project.name}
                      </h5>
                      <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                        {project.description || (
                          <>
                            <span className="text-xs">📝</span>
                            No description
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(project._id, `project-${project._id}`)
                    }
                    className="btn btn-success flex items-center gap-2"
                  >
                    {copied === `project-${project._id}` ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy ID
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 glass p-3 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
                  <code className="text-sm font-mono text-success-700 dark:text-success-300 break-all flex items-center gap-1">
                    <span className="text-xs">🆔</span>
                    {project._id}
                  </code>
                </div>
              </div>

              {/* Usage Example for this project */}
              <div className="p-6 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center mr-2 shadow-lg">
                      <Code className="w-3 h-3 text-white" />
                    </div>
                    <h6 className="text-sm font-display font-bold gradient-text-primary flex items-center gap-1">
                      <Code className="h-4 w-4" />
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
                    className="btn btn-ghost p-2"
                  >
                    {copied === `example-${project._id}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-dark-bg/5 dark:bg-light-bg/5">
                  <pre className="text-xs font-mono text-light-text-primary dark:text-dark-text-primary overflow-x-auto">
                    <code>
                      {generateProjectUsageExample(project._id, project.name)}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ))}

          {(!projects || projects.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                <Folder className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-display font-bold gradient-text-primary mb-2">No projects found</p>
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Create a project to get started with project-based tracking
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Tips */}
      <div className="glass rounded-xl border border-accent-200/30 shadow-2xl backdrop-blur-xl bg-gradient-accent/10 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h5 className="text-xl font-display font-bold gradient-text-accent flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            Integration Tips
          </h5>
        </div>
        <div className="space-y-3">
          {[
            "Use project IDs to separate costs by team, department, or client",
            "Set up budget alerts for each project to monitor spending",
            "Use cost allocation metadata for detailed tracking",
            "Tag your usage data for better organization and reporting",
            "Monitor project analytics to optimize AI usage"
          ].map((tip, index) => (
            <div key={index} className="glass p-3 rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl hover:bg-accent-500/5 transition-all duration-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gradient-accent rounded-full mr-3 mt-2 flex-shrink-0 shadow-lg"></div>
                <span className="text-sm font-body text-accent-700 dark:text-accent-300">{tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="glass rounded-xl border border-warning-200/30 shadow-2xl backdrop-blur-xl bg-gradient-warning/10 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h5 className="text-xl font-display font-bold gradient-text-warning flex items-center gap-2">
            <Settings className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            Environment Variables
          </h5>
        </div>
        <p className="text-sm font-body text-warning-700 dark:text-warning-300 mb-4">
          Set these environment variables in your application:
        </p>
        <div className="space-y-3">
          <div className="glass p-4 rounded-xl border border-warning-200/30 dark:border-warning-500/30 shadow-lg backdrop-blur-xl bg-warning-100/20 dark:bg-warning-800/20">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-warning-800 dark:text-warning-200 break-all">
                API_KEY=ck_live_sk_a7b9c2d4e8f1g3h5j6k9l2m4n7p0q3r5s8t1u4v7w0x3y6z9
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    "ck_live_sk_a7b9c2d4e8f1g3h5j6k9l2m4n7p0q3r5s8t1u4v7w0x3y6z9",
                    "api-key-sample",
                  )
                }
                className="btn btn-ghost ml-3 p-2"
              >
                {copied === "api-key-sample" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-warning-100/20 dark:bg-warning-800/20">
            <code className="text-sm font-mono text-warning-800 dark:text-warning-200">
              DEFAULT_PROJECT_ID=your-project-id
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
