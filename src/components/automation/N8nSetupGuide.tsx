import React, { useState } from 'react';
import {
    CheckCircleIcon,
    ClipboardIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    BoltIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import { AutomationConnection } from '../../types/automation.types';

interface N8nSetupGuideProps {
    connection?: AutomationConnection;
    apiKey?: string;
}

export const N8nSetupGuide: React.FC<N8nSetupGuideProps> = ({ connection, apiKey }) => {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [copied, setCopied] = useState<string>('');

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const steps = [
        {
            id: 1,
            title: 'Get Your API Key',
            content: (
                <div className="space-y-4">
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        You need an API key to authenticate webhook requests from n8n.
                    </p>
                    <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-body font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                                    API Key
                                </label>
                                <code className="text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                                    {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not available'}
                                </code>
                            </div>
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Go to Settings → API Keys to generate and copy your API key
                        </p>
                        <div className="mt-2 p-2 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-purple-700 dark:text-purple-300">
                                <strong>Note:</strong> API keys are only shown once when created. If you don't have one, create a new key in Settings and copy it immediately.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: 'Create Connection',
            content: (
                <div className="space-y-4">
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Create a connection in CostKatana to get your webhook URL.
                    </p>
                    {connection ? (
                        <div className="p-4 rounded-lg border border-green-200/30 dark:border-green-500/20 bg-green-50/50 dark:bg-green-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-display font-semibold text-green-700 dark:text-green-300">
                                    Connection Created
                                </span>
                            </div>
                            <div className="mt-3">
                                <label className="text-xs font-body font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                                    Webhook URL
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono text-light-text-primary dark:text-dark-text-primary flex-1 truncate">
                                        {connection.webhookUrl}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(connection.webhookUrl, 'webhook')}
                                        className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex-shrink-0"
                                    >
                                        <ClipboardIcon className={`w-5 h-5 ${copied === 'webhook' ? 'text-green-600' : 'text-light-text-secondary dark:text-dark-text-secondary'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg border border-yellow-200/30 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Create a connection using the form above to get your webhook URL.
                            </p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 3,
            title: 'Set Up n8n HTTP Request',
            content: (
                <div className="space-y-4">
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        In your n8n workflow, add an HTTP Request node to send cost data to CostKatana.
                    </p>

                    <div className="space-y-3">
                        <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                            <h4 className="font-display font-semibold text-sm mb-2 text-light-text-primary dark:text-dark-text-primary">
                                1. Add HTTP Request Node
                            </h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                <li>In n8n, click <strong>+</strong> to add a new node</li>
                                <li>Search for <strong>"HTTP Request"</strong></li>
                                <li>Select <strong>"HTTP Request"</strong> node</li>
                            </ol>
                        </div>

                        <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                            <h4 className="font-display font-semibold text-sm mb-2 text-light-text-primary dark:text-dark-text-primary">
                                2. Configure HTTP Request Node
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div>
                                    <label className="font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                        Method: POST
                                    </label>
                                </div>
                                <div>
                                    <label className="font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                        URL:
                                    </label>
                                    <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded block">
                                        {connection?.webhookUrl || 'YOUR_WEBHOOK_URL'}
                                    </code>
                                </div>
                                <div>
                                    <label className="font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                        Headers:
                                    </label>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs">
                                        <div>CostKatana-Auth: {apiKey ? `${apiKey.substring(0, 20)}...` : 'YOUR_API_KEY'}</div>
                                        <div>Content-Type: application/json</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                        Body Content Type: JSON
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                            <h4 className="font-display font-semibold text-sm mb-2 text-light-text-primary dark:text-dark-text-primary">
                                3. Request Body (JSON)
                            </h4>
                            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Use this JSON structure (map fields from your AI node):
                            </p>
                            <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                                {`{
  "platform": "n8n",
  "workflowId": "{{$workflow.id}}",
  "workflowName": "{{$workflow.name}}",
  "workflowStep": "AI Node",
  "service": "openai",
  "model": "gpt-4",
  "promptTokens": 100,
  "completionTokens": 150,
  "totalTokens": 250,
  "cost": 0.01,
  "responseTime": 1200,
  "tags": ["n8n"]
}`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(`{
  "platform": "n8n",
  "workflowId": "{{$workflow.id}}",
  "workflowName": "{{$workflow.name}}",
  "workflowStep": "AI Node",
  "service": "openai",
  "model": "gpt-4",
  "promptTokens": 100,
  "completionTokens": 150,
  "totalTokens": 250,
  "cost": 0.01,
  "responseTime": 1200,
  "tags": ["n8n"]
}`, 'payload')}
                                className="mt-2 text-xs text-[#06ec9e] dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <ClipboardIcon className="w-4 h-4" />
                                Copy Payload Template
                            </button>
                        </div>

                        <div className="p-4 rounded-lg border border-purple-200/30 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/20">
                            <div className="flex items-start gap-2">
                                <InformationCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-purple-700 dark:text-purple-300">
                                    <strong>Tip:</strong> For multi-step workflows, you can send a batch payload with all nodes in one request. See the documentation for batch payload format.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            title: 'View Costs in Dashboard',
            content: (
                <div className="space-y-4">
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        After your n8n workflow runs, view the tracked costs in CostKatana.
                    </p>
                    <div className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                        <ol className="list-decimal list-inside space-y-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            <li>Go to <strong>Automation</strong> → <strong>Dashboard</strong> tab</li>
                            <li>You'll see costs organized by platform and workflow</li>
                            <li>Check the <strong>By Workflow</strong> tab to see individual workflow costs</li>
                            <li>Use date filters to see costs over time</li>
                        </ol>
                    </div>
                    <div className="p-4 rounded-lg border border-purple-200/30 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/20">
                        <div className="flex items-start gap-2">
                            <InformationCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-purple-700 dark:text-purple-300">
                                <strong>Tip:</strong> Costs appear within seconds after your workflow runs. If you don't see them, check that your HTTP Request node completed successfully in n8n.
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center">
                    <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-display font-bold gradient-text-primary">
                        n8n Setup Guide
                    </h2>
                    <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Step-by-step instructions to connect n8n
                    </p>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <button
                            onClick={() => setActiveStep(step.id)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeStep === step.id
                                    ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                                    : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                }`}
                        >
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                                {step.id}
                            </span>
                            <span className="hidden sm:inline">{step.title}</span>
                        </button>
                        {index < steps.length - 1 && (
                            <div className={`h-0.5 w-4 sm:w-8 md:w-12 ${activeStep > step.id ? 'bg-[#06ec9e]' : 'bg-gray-300 dark:bg-gray-600'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[250px] sm:min-h-[300px]">
                {steps.find(s => s.id === activeStep)?.content}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary-200/30 dark:border-primary-500/20 gap-2">
                <button
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    disabled={activeStep === 1}
                    className="btn btn-secondary px-3 sm:px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                    Previous
                </button>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Step {activeStep} of {steps.length}
                </div>
                <button
                    onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                    disabled={activeStep === steps.length}
                    className="btn btn-primary px-3 sm:px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                    Next
                </button>
            </div>

            {/* Quick Links */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary-200/30 dark:border-primary-500/20">
                <div className="flex flex-wrap gap-2">
                    <a
                        href="https://n8n.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                        <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Open n8n</span>
                        <span className="sm:hidden">n8n</span>
                    </a>
                    <a
                        href="/settings"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="hidden sm:inline">Get API Key</span>
                        <span className="sm:hidden">API Key</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

