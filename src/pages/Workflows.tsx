import React, { useState } from 'react';
import { WorkflowDashboard } from '../components/workflows/WorkflowDashboard';
import { WorkflowService } from '../services/workflow.service';

const Workflows: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [showDocumentation, setShowDocumentation] = useState(false);

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            // Get workflow data and export as CSV
            const workflows = await WorkflowService.getUserWorkflows({ limit: 1000 });
            if (workflows.success && workflows.data.length > 0) {
                const csvData = WorkflowService.exportToCSV(workflows.data);
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workflows-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('No workflow data to export');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export workflow data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleViewDocumentation = () => {
        setShowDocumentation(true);
    };

    const handleLearnWorkflows = () => {
        // Scroll to the implementation guide section
        const guideElement = document.getElementById('implementation-guide');
        if (guideElement) {
            guideElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Cost Workflows
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Track and analyze the total cost of multi-step AI operations
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <button
                                type="button"
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {isExporting ? 'Exporting...' : 'Export Data'}
                            </button>
                            <button
                                type="button"
                                onClick={handleViewDocumentation}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                About Cost Workflows
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Cost Workflows group related AI API calls into traceable operations, allowing you to see the
                                    total end-to-end cost of complex multi-step processes. Use workflow headers in your requests
                                    to track entire AI agent conversations, not just individual calls.
                                </p>
                            </div>
                            <div className="mt-3">
                                <div className="text-sm">
                                    <button
                                        onClick={handleLearnWorkflows}
                                        className="font-medium text-blue-800 underline hover:text-blue-600 bg-transparent border-none cursor-pointer"
                                    >
                                        Learn how to implement workflows →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workflow Dashboard */}
                <WorkflowDashboard />

                {/* Implementation Guide */}
                <div id="implementation-guide" className="mt-8 bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Quick Implementation Guide</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Required Headers</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <code className="text-sm text-gray-800">
                                        <div className="mb-1">CostKatana-Workflow-Id: workflow_123</div>
                                        <div className="mb-1">CostKatana-Workflow-Name: "AI Agent"</div>
                                        <div>CostKatana-Workflow-Step: "/analyze"</div>
                                    </code>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Add these headers to every API request in your workflow
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Example Use Cases</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Multi-step AI agents with analysis, validation, and summary
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Code generation with refinement and testing steps
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Complex research workflows with multiple data sources
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Customer support bots with escalation paths
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documentation Modal */}
                {showDocumentation && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Workflow Implementation Documentation</h3>
                                <button
                                    onClick={() => setShowDocumentation(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="prose max-w-none">
                                    <h4 className="text-md font-semibold mb-3">What are Cost Workflows?</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Cost Workflows group multiple AI API calls into a single traceable operation, allowing you to see the total cost of complex multi-step processes like AI agents, code generation pipelines, or research workflows.
                                    </p>

                                    <h4 className="text-md font-semibold mb-3">Required Headers</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <code className="text-sm">
                                            <div className="mb-2"><strong>CostKatana-Workflow-Id:</strong> unique_workflow_id</div>
                                            <div className="mb-2"><strong>CostKatana-Workflow-Name:</strong> "WorkflowTypeName"</div>
                                            <div><strong>CostKatana-Workflow-Step:</strong> "/step/path"</div>
                                        </code>
                                    </div>

                                    <h4 className="text-md font-semibold mb-3">Example Implementation</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <pre className="text-xs overflow-x-auto">
                                            {`// Node.js Example
const workflowId = crypto.randomUUID();

// Step 1: Analysis
await callAI({
  prompt: "Analyze this data...",
  headers: {
    "CostKatana-Workflow-Id": workflowId,
    "CostKatana-Workflow-Name": "DataAnalysisAgent",
    "CostKatana-Workflow-Step": "/analyze"
  }
});

// Step 2: Validation
await callAI({
  prompt: "Validate the analysis...",
  headers: {
    "CostKatana-Workflow-Id": workflowId,
    "CostKatana-Workflow-Name": "DataAnalysisAgent", 
    "CostKatana-Workflow-Step": "/analyze/validate"
  }
});`}
                                        </pre>
                                    </div>

                                    <h4 className="text-md font-semibold mb-3">Best Practices</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Use unique UUIDs for each workflow instance</li>
                                        <li>• Keep workflow names consistent for similar operations</li>
                                        <li>• Use hierarchical step paths (e.g., /analyze/validate/refine)</li>
                                        <li>• Include all related API calls in the same workflow</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workflows;