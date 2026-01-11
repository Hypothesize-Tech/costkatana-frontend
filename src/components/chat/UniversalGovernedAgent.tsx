import React, { useState, useEffect } from 'react';
import { AgentMode, GovernedTask } from '../../types/governedAgent';
import { ModeHeader } from './ModeHeader';
import { ScopeAnalysisView } from './ScopeAnalysisView';
import { PlanView } from './PlanView';
import { VerificationView } from './VerificationView';
import { ClarifyingQuestionsView } from './ClarifyingQuestionsView';
import { BuildProgressView } from './BuildProgressView';
import { FileGenerationView } from './FileGenerationView';
import { apiClient } from '../../config/api';
import {
    DocumentTextIcon,
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

// Enhanced Loader Component with multiple states
const Loader: React.FC<{ message?: string; subMessage?: string; size?: 'sm' | 'md' | 'lg' }> = ({
    message = 'Loading...',
    subMessage,
    size = 'md'
}) => {
    const sizes = {
        sm: 'h-8 w-8 border-2',
        md: 'h-16 w-16 border-4',
        lg: 'h-24 w-24 border-6'
    };

    return (
        <div className="text-center">
            <div className={`animate-spin rounded-full ${sizes[size]} border-primary-200 dark:border-primary-700/30 border-t-primary-600 dark:border-t-primary-400 mx-auto mb-4`}></div>
            <p className="text-secondary-600 dark:text-secondary-400 font-display font-semibold">{message}</p>
            {subMessage && (
                <p className="text-sm text-secondary-500 dark:text-secondary-500 mt-2">{subMessage}</p>
            )}
        </div>
    );
};

// GitHub Codespaces Button Component
const GitHubCodespacesButton: React.FC<{ repoUrl: string }> = ({ repoUrl }) => {
    const getCodespacesUrl = (githubUrl: string) => {
        // Convert https://github.com/user/repo to codespaces URL
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            const [, owner, repo] = match;
            return `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${owner}/${repo}`;
        }
        return null;
    };

    const codespacesUrl = getCodespacesUrl(repoUrl);

    if (!codespacesUrl) return null;

    return (
        <a
            href={codespacesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-secondary-800 dark:bg-secondary-700 hover:bg-secondary-700 dark:hover:bg-secondary-600 rounded-lg transition-colors shadow-sm"
            title="Open in GitHub Codespaces"
        >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 5.5A5.5 5.5 0 0 1 5.5 0h.5a.5.5 0 0 1 0 1h-.5A4.5 4.5 0 0 0 1 5.5v.5a.5.5 0 0 1-1 0v-.5ZM16 5.5v.5a.5.5 0 0 1-1 0v-.5A4.5 4.5 0 0 0 10.5 1h-.5a.5.5 0 0 1 0-1h.5A5.5 5.5 0 0 1 16 5.5ZM1 10.5v.5A4.5 4.5 0 0 0 5.5 15h.5a.5.5 0 0 1 0 1h-.5A5.5 5.5 0 0 1 0 10.5v-.5a.5.5 0 0 1 1 0Zm14 0v.5a5.5 5.5 0 0 1-5.5 5.5h-.5a.5.5 0 0 1 0-1h.5a4.5 4.5 0 0 0 4.5-4.5v-.5a.5.5 0 0 1 1 0Z" />
            </svg>
            Open in VS Code
        </a>
    );
};

interface UniversalGovernedAgentProps {
    taskId: string;
    onComplete?: () => void;
}

export const UniversalGovernedAgent: React.FC<UniversalGovernedAgentProps> = ({
    taskId,
    onComplete
}) => {
    const [task, setTask] = useState<GovernedTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Track specific actions
    const [error, setError] = useState<string | null>(null);
    const [currentMode, setCurrentMode] = useState<AgentMode>(AgentMode.SCOPE);

    // Clarifying questions state
    const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
    const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
    const [showClarification, setShowClarification] = useState(false);
    const [submittingAnswers, setSubmittingAnswers] = useState(false);
    const [fileGenerationProgress, setFileGenerationProgress] = useState<any>(null);
    const [generatingFiles, setGeneratingFiles] = useState<Array<{
        path: string;
        status: 'pending' | 'generating' | 'complete' | 'error';
        githubUrl?: string;
        error?: string;
    }>>([]);

    // Fetch task details
    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');
                const response = await apiClient.get(`/governed-agent/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setTask(response.data.data);
                setCurrentMode(response.data.data.mode);

                // Check for clarifying questions in SCOPE or CLARIFY mode
                const hasQuestions = response.data.data.scopeAnalysis?.clarificationNeeded?.length > 0;
                const needsClarification =
                    (response.data.data.mode === AgentMode.SCOPE && hasQuestions && !response.data.data.scopeAnalysis?.canProceed) ||
                    response.data.data.mode === AgentMode.CLARIFY;

                if (needsClarification && hasQuestions) {
                    setClarifyingQuestions(response.data.data.scopeAnalysis.clarificationNeeded);
                    setShowClarification(true);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load task');
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    const handleSubmitAnswers = async () => {
        try {
            setSubmittingAnswers(true);
            setActionLoading('submitting_answers');

            // Submit answers via the submit-answers endpoint
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/submit-answers`,
                { answers: clarifyingAnswers },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            // Hide clarification view and reset state
            setShowClarification(false);
            setClarifyingQuestions([]);
            setClarifyingAnswers({});

            // Refresh task to get updated mode and plan
            const response = await apiClient.get(`/governed-agent/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setTask(response.data.data);
            setCurrentMode(response.data.data.mode);

        } catch (err: any) {
            setError(err.message || 'Failed to submit answers');
        } finally {
            setSubmittingAnswers(false);
            setActionLoading(null);
        }
    };

    const handleAnswerChange = (question: string, answer: string) => {
        setClarifyingAnswers(prev => ({
            ...prev,
            [question]: answer
        }));
    };

    // Set up SSE for real-time progress updates
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL + '/api' || 'http://localhost:8000/api'}/chat/governed/${taskId}/stream?token=${token}`);

        // Listen to 'connected' event
        eventSource.addEventListener('connected', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('✅ SSE connected for task:', data.taskId, 'at', data.timestamp);
            setLoading(false); // Hide initial loader once connected
        });

        // Listen to 'file_generation' event for file-by-file progress
        eventSource.addEventListener('file_generation', (event: MessageEvent) => {
            const fileGenData = JSON.parse(event.data);
            console.log('📝 File generation update:', fileGenData);
            setFileGenerationProgress(fileGenData);

            // Update file list based on phase
            if (fileGenData.phase === 'structure_complete' && fileGenData.totalFiles) {
                // Initialize file list with empty paths
                const files = Array(fileGenData.totalFiles).fill(null).map(() => ({
                    path: '',
                    status: 'pending' as const
                }));
                setGeneratingFiles(files);
            } else if (fileGenData.phase === 'generating_file' && fileGenData.currentFile) {
                // Update current file status
                setGeneratingFiles(prev => {
                    const newFiles = [...prev];
                    const emptyIndex = newFiles.findIndex(f => f.path === '');
                    const existingIndex = newFiles.findIndex(f => f.path === fileGenData.currentFile);
                    const index = existingIndex >= 0 ? existingIndex : emptyIndex;

                    if (index >= 0) {
                        newFiles[index] = {
                            path: fileGenData.currentFile,
                            status: 'generating'
                        };
                    }
                    return newFiles;
                });
            } else if ((fileGenData.phase === 'file_complete' || fileGenData.phase === 'file_committed') && fileGenData.currentFile) {
                // Mark file as complete
                setGeneratingFiles(prev => {
                    const newFiles = [...prev];
                    const index = newFiles.findIndex(f => f.path === fileGenData.currentFile || f.path === fileGenData.file);
                    if (index >= 0) {
                        newFiles[index].status = 'complete';
                        if (fileGenData.githubUrl) {
                            newFiles[index].githubUrl = fileGenData.githubUrl;
                        }
                    }
                    return newFiles;
                });
            } else if (fileGenData.phase === 'file_error') {
                // Mark file as error
                setGeneratingFiles(prev => {
                    const newFiles = [...prev];
                    const index = newFiles.findIndex(f => f.path === fileGenData.currentFile || f.path === fileGenData.file);
                    if (index >= 0) {
                        newFiles[index].status = 'error';
                        newFiles[index].error = fileGenData.error;
                    }
                    return newFiles;
                });
            }
        });

        // Listen to 'update' event
        eventSource.addEventListener('update', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('📊 Task update received:', data.mode, data.status);

            // Update task state with real-time data
            setTask(prev => prev ? {
                ...prev,
                mode: data.mode,
                status: data.status,
                classification: data.classification || prev.classification,
                scopeAnalysis: data.scopeAnalysis || prev.scopeAnalysis,
                plan: data.plan || prev.plan,
                executionProgress: data.executionProgress || prev.executionProgress,
                verification: data.verification || prev.verification,
                error: data.error || prev.error
            } : null);
            setCurrentMode(data.mode);
            setLoading(false); // Ensure loader is hidden
            setActionLoading(null); // Clear action-specific loading

            // Check if we need to show clarifying questions
            const hasQuestions = data.scopeAnalysis?.clarificationNeeded?.length > 0;
            if (data.mode === AgentMode.CLARIFY && hasQuestions) {
                setClarifyingQuestions(data.scopeAnalysis.clarificationNeeded);
                setShowClarification(true);
            }
        });

        // Listen to 'heartbeat' event
        eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('💓 Heartbeat at', data.timestamp);
        });

        // Listen to 'complete' event
        eventSource.addEventListener('complete', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('✅ Task completed:', data.status);
            // Don't automatically close - let user review results
            // if (onComplete) {
            //     onComplete();
            // }
            eventSource.close();
        });

        // Listen to 'error' or 'timeout' event
        eventSource.addEventListener('error', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.error('❌ Task error:', data.message);
            setError(data.message || 'Unknown error occurred');
            setLoading(false);
            eventSource.close();
        });

        eventSource.addEventListener('timeout', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.warn('⏱️ Task timeout:', data.message);
            // Don't set error or close connection - this is just a warning
            // The backend is still working, just the SSE stream timed out
            // The EventSource will automatically reconnect
        });

        // Generic error handler (connection issues)
        eventSource.onerror = (error) => {
            console.error('❌ SSE Connection Error:', error);
            // Check if it's a connection error or just a normal close
            if (eventSource.readyState === EventSource.CLOSED) {
                setError('Connection closed by server');
                setLoading(false);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [taskId, onComplete]);

    useEffect(() => {
        if (task) {
            setCurrentMode(task.mode);
        }
    }, [task?.mode]);

    const handleApprove = async () => {
        try {
            setActionLoading('approving');
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            // Task will transition to BUILD_MODE via SSE updates
        } catch (err: any) {
            setError(err.message || 'Failed to approve and execute plan');
            setActionLoading(null);
        }
    };

    const handleRequestPlan = async () => {
        try {
            setActionLoading('generating_plan');
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/request-plan`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            // Task will transition to PLAN_MODE and generate plan via SSE updates
        } catch (err: any) {
            setError(err.message || 'Failed to request plan generation');
            setActionLoading(null);
        }
    };

    const handleRequestChanges = async (feedback: string) => {
        try {
            setActionLoading('requesting_changes');
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/request-changes`,
                { feedback },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            // Plan will be regenerated via SSE updates
        } catch (err: any) {
            setError(err.message || 'Failed to request plan changes');
            setActionLoading(null);
        }
    };

    const handleGoBack = async () => {
        try {
            setActionLoading('going_back');
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/go-back`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            // Task will navigate back via SSE updates
        } catch (err: any) {
            setError(err.message || 'Failed to go back');
            setActionLoading(null);
        }
    };

    const handleModeClick = async (mode: AgentMode) => {
        try {
            setActionLoading('navigating');
            const authToken = localStorage.getItem('access_token');
            await apiClient.post(`/chat/governed/${taskId}/navigate`,
                { mode },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            // Task will navigate to the selected mode via SSE updates
        } catch (err: any) {
            setError(err.message || 'Failed to navigate to mode');
            setActionLoading(null);
        }
    };

    const handleCancel = () => {
        if (onComplete) {
            onComplete();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader
                    message="Initializing Governed Agent..."
                    subMessage="Connecting to task stream"
                    size="lg"
                />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-danger-600 dark:text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                        Failed to load task
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{error || 'Unknown error'}</p>
                    <button
                        onClick={handleCancel}
                        className="mt-4 px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-display font-medium transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg-100 relative">
            {/* Action Loading Overlay */}
            {actionLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-dark-bg-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="glass rounded-2xl p-8 shadow-2xl border border-secondary-200/50 dark:border-secondary-700/50">
                        <Loader
                            message={
                                actionLoading === 'approving' ? 'Approving and starting execution...' :
                                    actionLoading === 'generating_plan' ? 'Generating execution plan...' :
                                        actionLoading === 'requesting_changes' ? 'Requesting plan modifications...' :
                                            actionLoading === 'going_back' ? 'Navigating back...' :
                                                actionLoading === 'navigating' ? 'Switching mode...' :
                                                    'Processing...'
                            }
                            subMessage="Please wait, this may take a moment"
                        />
                    </div>
                </div>
            )}

            {/* Mode Header */}
            <ModeHeader
                current={currentMode}
                taskType={task.classification?.type}
                status={task.status}
                onModeClick={handleModeClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg-100">
                {/* Show Clarifying Questions if needed */}
                {showClarification && clarifyingQuestions.length > 0 ? (
                    <ClarifyingQuestionsView
                        questions={clarifyingQuestions}
                        answers={clarifyingAnswers}
                        onAnswerChange={handleAnswerChange}
                        onSubmit={handleSubmitAnswers}
                        submitting={submittingAnswers}
                    />
                ) : (
                    <>
                        {/* SCOPE MODE */}
                        {currentMode === AgentMode.SCOPE && (
                            <div className="p-6 space-y-6">
                                {task.scopeAnalysis ? (
                                    <ScopeAnalysisView
                                        analysis={task.scopeAnalysis}
                                        onProceed={handleRequestPlan}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        <Loader
                                            message="Analyzing scope..."
                                            subMessage="Understanding your requirements"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PLAN MODE */}
                        {currentMode === AgentMode.PLAN && (
                            <div className="p-6 space-y-6">
                                {task.plan ? (
                                    <PlanView
                                        plan={task.plan}
                                        approvalToken={task.approvalToken}
                                        taskType={task.classification?.type}
                                        onApprove={handleApprove}
                                        onCancel={handleCancel}
                                        onRequestChanges={handleRequestChanges}
                                        onGoBack={handleGoBack}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        <Loader
                                            message="Generating execution plan..."
                                            subMessage="Creating detailed step-by-step plan"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BUILD MODE */}
                        {currentMode === AgentMode.BUILD && (
                            <>
                                {/* Show file generation progress if active */}
                                {fileGenerationProgress && (
                                    <div className="mb-6">
                                        <FileGenerationView
                                            progress={fileGenerationProgress}
                                            files={generatingFiles}
                                        />
                                    </div>
                                )}

                                <BuildProgressView
                                    progress={task.executionProgress}
                                    progressUpdates={(() => {
                                        // Transform all steps from plan into progress updates
                                        const updates: any[] = [];
                                        if (task.plan) {
                                            let stepCounter = 0;
                                            const totalSteps = task.plan.phases.reduce((sum, phase) => sum + phase.steps.length, 0);

                                            task.plan.phases.forEach((phase) => {
                                                phase.steps.forEach((step) => {
                                                    stepCounter++;
                                                    const isCompleted = task.executionProgress?.completedSteps?.includes(step.id);
                                                    const isFailed = task.executionProgress?.failedSteps?.some(f => f.stepId === step.id);
                                                    const isRunning = task.executionProgress?.currentStep === step.id;
                                                    const stepResult = task.executionResults?.find(r => r.stepId === step.id);

                                                    updates.push({
                                                        step: stepCounter,
                                                        total: totalSteps,
                                                        action: step.description,
                                                        status: isFailed ? 'failed' : isCompleted ? 'completed' : isRunning ? 'running' : 'pending',
                                                        timestamp: stepResult?.timestamp || new Date().toISOString(),
                                                        error: isFailed ? task.executionProgress?.failedSteps?.find(f => f.stepId === step.id)?.error : undefined
                                                    });
                                                });
                                            });
                                        }
                                        return updates;
                                    })()}
                                    taskType={task.classification?.type}
                                    onCancel={handleCancel}
                                />
                            </>
                        )}

                        {/* VERIFY MODE */}
                        {currentMode === AgentMode.VERIFY && (
                            <>
                                {task.verification ? (
                                    <VerificationView
                                        verification={task.verification}
                                        taskType={task.classification?.type}
                                    />
                                ) : (
                                    <div className="p-6 space-y-6">
                                        {/* URLs Summary - NEW SECTION */}
                                        {task.executionResults && task.executionResults.length > 0 && (() => {
                                            const urls = {
                                                github: [] as string[],
                                                vercel: [] as string[],
                                                other: [] as string[]
                                            };

                                            // Extract all URLs from execution results - check multiple possible paths
                                            task.executionResults.forEach((result: any) => {
                                                // Check multiple possible URL locations
                                                const possibleUrls = [
                                                    result.result?.output?.link,
                                                    result.result?.output?.url,
                                                    result.result?.output?.html_url,
                                                    result.result?.output?.data?.url,
                                                    result.result?.output?.data?.html_url,
                                                    result.result?.output?.data?.clone_url,
                                                    result.result?.data?.url,
                                                    result.result?.data?.html_url,
                                                    result.result?.url,
                                                    result.result?.html_url,
                                                    result.data?.url,
                                                    result.data?.html_url
                                                ];

                                                possibleUrls.forEach((url) => {
                                                    if (url && typeof url === 'string') {
                                                        if (url.includes('github.com')) {
                                                            urls.github.push(url);
                                                        } else if (url.includes('vercel.com') || url.includes('vercel.app')) {
                                                            urls.vercel.push(url);
                                                        } else if (url.startsWith('http')) {
                                                            urls.other.push(url);
                                                        }
                                                    }
                                                });
                                            });

                                            // Remove duplicates
                                            urls.github = [...new Set(urls.github)];
                                            urls.vercel = [...new Set(urls.vercel)];
                                            urls.other = [...new Set(urls.other)];

                                            const hasUrls = urls.github.length > 0 || urls.vercel.length > 0 || urls.other.length > 0;

                                            return hasUrls ? (
                                                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 p-6 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent">
                                                    <h3 className="text-lg font-display font-bold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                        🎉 Your Resources Are Ready!
                                                    </h3>

                                                    <div className="space-y-4">
                                                        {urls.github.length > 0 && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                                    </svg>
                                                                    GitHub Repositories
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {urls.github.map((url, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-dark-card border border-secondary-200/30 dark:border-secondary-700/30 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all duration-300 group">
                                                                            <a
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex-1 min-w-0"
                                                                            >
                                                                                <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                                                    {url.replace('https://github.com/', '')}
                                                                                </span>
                                                                                <svg className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                                </svg>
                                                                            </a>

                                                                            {/* Codespaces Button */}
                                                                            <GitHubCodespacesButton repoUrl={url} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {urls.vercel.length > 0 && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M24 22.525H0l12-21.05 12 21.05z" />
                                                                    </svg>
                                                                    Vercel Deployments
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {urls.vercel.map((url, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block p-3 rounded-lg bg-white dark:bg-dark-card border border-secondary-200/30 dark:border-secondary-700/30 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all duration-300 group"
                                                                        >
                                                                            <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                                                {url.includes('vercel.app') ? url : url.replace('https://vercel.com/', '')}
                                                                            </span>
                                                                            <svg className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                            </svg>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}

                                        {/* Execution Summary */}
                                        <div className="glass rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 p-6">
                                            <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                                                <DocumentTextIcon className="w-5 h-5" />
                                                Execution Summary
                                            </h3>

                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-secondary-200/30 dark:border-secondary-700/30">
                                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                        {task.plan?.phases.reduce((acc, phase) => acc + phase.steps.length, 0) || 0}
                                                    </p>
                                                    <p className="text-xs text-secondary-700 dark:text-secondary-300 mt-1">
                                                        Total Steps
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-700/30">
                                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                        {task.executionProgress?.completedSteps?.length || 0}
                                                    </p>
                                                    <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                                                        Completed
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-white dark:bg-dark-card border border-danger-200/30 dark:border-danger-700/30">
                                                    <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                                                        {task.executionProgress?.failedSteps?.length || 0}
                                                    </p>
                                                    <p className="text-xs text-danger-700 dark:text-danger-300 mt-1">
                                                        Failed
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Failed Steps Details */}
                                            {task.executionProgress?.failedSteps && task.executionProgress.failedSteps.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-semibold text-danger-900 dark:text-danger-100 mb-3 flex items-center gap-2">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                        Failed Steps:
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {task.executionProgress.failedSteps.map((failed, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-4 rounded-lg bg-danger-50/50 dark:bg-danger-900/10 border border-danger-200/30 dark:border-danger-700/30"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 w-6 h-6 rounded bg-danger-500 flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-danger-900 dark:text-danger-100">
                                                                            Step: {failed.stepId}
                                                                        </p>
                                                                        <p className="text-xs text-danger-700 dark:text-danger-300 mt-1">
                                                                            {failed.error}
                                                                        </p>
                                                                        <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">
                                                                            {new Date(failed.timestamp).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* No failed steps */}
                                            {(!task.executionProgress?.failedSteps || task.executionProgress.failedSteps.length === 0) && (
                                                <div className="text-center p-8 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200/30 dark:border-primary-700/30">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-display font-bold text-primary-900 dark:text-primary-100 mb-2">
                                                        All Steps Completed Successfully!
                                                    </h4>
                                                    <p className="text-sm text-primary-700 dark:text-primary-300">
                                                        Your task has been executed without errors
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Execution Results */}
                                        {task.executionResults && task.executionResults.length > 0 && (
                                            <div className="glass rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 p-6">
                                                <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                                                    <ArchiveBoxIcon className="w-5 h-5" />
                                                    Execution Results
                                                </h3>

                                                <div className="space-y-3">
                                                    {task.executionResults.map((result, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-4 rounded-lg border-l-4 ${result.success
                                                                ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-500'
                                                                : 'bg-danger-50 dark:bg-danger-900/10 border-danger-500'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {result.success ? (
                                                                    <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                                                                ) : (
                                                                    <XCircleIcon className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                                                                )}
                                                                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                                                                    {result.stepId}
                                                                </span>
                                                            </div>

                                                            {/* Links with Codespaces button */}
                                                            {result.output?.link && (
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <a
                                                                        href={result.output.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        {result.output.link}
                                                                    </a>

                                                                    {/* Add Codespaces button if it's a GitHub URL */}
                                                                    {result.output.link.includes('github.com') && (
                                                                        <GitHubCodespacesButton repoUrl={result.output.link} />
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Message */}
                                                            {result.output?.message && (
                                                                <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-2">
                                                                    {result.output.message}
                                                                </p>
                                                            )}

                                                            {/* Files/Code */}
                                                            {result.output?.files && result.output.files.length > 0 && (
                                                                <div className="space-y-2 mt-2">
                                                                    {result.output.files.map((file: any, fileIdx: number) => (
                                                                        <details key={fileIdx} className="group">
                                                                            <summary className="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:underline font-mono flex items-center gap-2">
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                {file.path || `file-${fileIdx + 1}`}
                                                                            </summary>
                                                                            <pre className="mt-2 p-3 text-xs bg-secondary-900 text-secondary-100 rounded overflow-x-auto">
                                                                                {file.content}
                                                                            </pre>
                                                                        </details>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Error */}
                                                            {!result.success && result.error && (
                                                                <div className="mt-2 p-2 rounded bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700">
                                                                    <p className="text-xs text-danger-700 dark:text-danger-300 font-mono">
                                                                        {result.error}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* DONE MODE */}
                        {currentMode === AgentMode.DONE && (
                            <div className="p-6 flex items-center justify-center h-full">
                                <div className="text-center max-w-2xl">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-2xl animate-scale-in glow-primary">
                                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-display font-bold gradient-text-primary mb-3">
                                        Task Completed Successfully!
                                    </h2>
                                    <p className="text-secondary-600 dark:text-secondary-400 text-lg mb-6">
                                        Your task has been executed and verified successfully.
                                    </p>

                                    {task.verification && task.verification.deploymentUrls && task.verification.deploymentUrls.length > 0 && (
                                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 p-6 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent shadow-lg">
                                            <h4 className="font-display font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                Deployment URLs:
                                            </h4>
                                            <div className="space-y-2">
                                                {task.verification.deploymentUrls.map((url, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 p-3 rounded-lg bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-700/30 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all duration-300 text-primary-700 dark:text-primary-300 font-mono text-sm group"
                                                        >
                                                            <span className="group-hover:underline">{url}</span>
                                                            <svg className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                        {url.includes('github.com') && (
                                                            <button
                                                                onClick={() => window.open(`vscode://github.remotehub/open?url=${encodeURIComponent(url)}`, '_blank')}
                                                                className="p-3 rounded-lg bg-secondary-900 dark:bg-secondary-800 border border-secondary-700 hover:border-secondary-600 hover:shadow-md transition-all duration-300 text-secondary-300 hover:text-white group"
                                                                title="Open in VS Code"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.987 7.071A.999.999 0 00.934 8.16l3.799 2.844L.045 19.033a.993.993 0 00.057 1.276l1.122 1.468a.993.993 0 001.276.057l3.799-2.844 4.915 3.909a1.06 1.06 0 00.905.115l4.94-1.377a1.49 1.49 0 001.705-1.293l1.436-10.852 3.828-3.493a1.494 1.494 0 00.29-1.705zm-4.505 6.894l-5.735 5.108L10.963 7.6l5.682-5.159z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* GitHub Repositories */}
                                    {task.executionResults && task.executionResults.length > 0 && (() => {
                                        const githubRepos = task.executionResults
                                            .filter((result: any) => result.result?.output?.link && result.result.output.link.includes('github.com'))
                                            .map((result: any) => result.result.output.link);

                                        return githubRepos.length > 0 ? (
                                            <div className="glass rounded-xl border border-secondary-200/30 dark:border-secondary-700/30 p-6 bg-gradient-to-br from-secondary-50/50 to-transparent dark:from-secondary-900/20 dark:to-transparent shadow-lg">
                                                <h4 className="font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                    GitHub Repositories:
                                                </h4>
                                                <div className="space-y-2">
                                                    {githubRepos.map((url: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 p-3 rounded-lg bg-white dark:bg-dark-card border border-secondary-200/30 dark:border-secondary-700/30 hover:border-secondary-400 dark:hover:border-secondary-500 hover:shadow-md transition-all duration-300 text-secondary-700 dark:text-secondary-300 font-mono text-sm group"
                                                            >
                                                                <span className="group-hover:underline">{url.split('/').slice(-2).join('/')}</span>
                                                                <svg className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                            <button
                                                                onClick={() => window.open(`vscode://github.remotehub/open?url=${encodeURIComponent(url)}`, '_blank')}
                                                                className="p-3 rounded-lg bg-secondary-900 dark:bg-secondary-800 border border-secondary-700 hover:border-secondary-600 hover:shadow-md transition-all duration-300 text-secondary-300 hover:text-white group"
                                                                title="Open in VS Code"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.987 7.071A.999.999 0 00.934 8.16l3.799 2.844L.045 19.033a.993.993 0 00.057 1.276l1.122 1.468a.993.993 0 001.276.057l3.799-2.844 4.915 3.909a1.06 1.06 0 00.905.115l4.94-1.377a1.49 1.49 0 001.705-1.293l1.436-10.852 3.828-3.493a1.494 1.494 0 00.29-1.705zm-4.505 6.894l-5.735 5.108L10.963 7.6l5.682-5.159z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    <button
                                        onClick={handleCancel}
                                        className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-display font-semibold shadow-lg hover:shadow-xl transition-all duration-300 glow-primary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UniversalGovernedAgent;
