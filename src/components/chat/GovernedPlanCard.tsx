import React, { useState, useEffect } from 'react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CodeBracketIcon,
    ArrowPathIcon,
    PencilIcon,
    ChatBubbleLeftIcon,
    SparklesIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    CpuChipIcon,
    BeakerIcon,
    DocumentTextIcon,
    FolderOpenIcon
} from '@heroicons/react/24/outline';
import { GovernedTask, AgentMode, type ExecutionResult as GovernedExecutionResult } from '../../types/governedAgent';
import { apiClient } from '@/config/api';
import TerminalOutput from './TerminalOutput';
import { GitHubRepoCard, VercelDeploymentCard } from './ResourceCards';

interface GovernedPlanCardProps {
    taskId: string;
    chatId: string;
    initialTask?: GovernedTask;
    onInteract?: (action: string, data?: Record<string, unknown>) => void;
}

const GovernedPlanCard: React.FC<GovernedPlanCardProps> = ({
    taskId,
    chatId,
    initialTask,
    onInteract
}) => {
    const [task, setTask] = useState<GovernedTask | null>(initialTask || null);
    const [expanded, setExpanded] = useState(false);
    const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
    const [expandedResults, setExpandedResults] = useState(false);
    const [loading, setLoading] = useState(!initialTask);
    const [questionInput, setQuestionInput] = useState('');
    const [askingQuestion, setAskingQuestion] = useState(false);

    // Fetch task details if not provided
    useEffect(() => {
        if (!initialTask && taskId) {
            const loadTask = async () => {
                try {
                    setLoading(true);
                    const response = await apiClient.get(`/governed-agent/${taskId}`);
                    setTask(response.data.data);
                } catch (error) {
                    console.error('Failed to fetch task:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadTask();
        }
    }, [taskId, initialTask]);

    // Helper functions to extract URLs from nested result structure
    const extractGitHubUrl = (result: GovernedExecutionResult): string | null => {
        // Check multiple possible locations for GitHub URL
        const data = result.result?.output?.data as Record<string, unknown>;
        if (!data) return null;

        // Direct URL fields
        if (data.html_url) return data.html_url as string;
        if (data.url && (data.url as string).includes('github.com')) return data.url as string;

        // Check in fullResult
        const fullResult = data.fullResult as Record<string, unknown> | undefined;
        if (fullResult?.data) {
            const fullData = fullResult.data as Record<string, unknown>;
            if (fullData.html_url) return fullData.html_url as string;
        }

        // Check in nested integration response
        if (data.integration === 'github' && fullResult?.data) {
            const fullData = fullResult.data as Record<string, unknown>;
            return (fullData.html_url || fullData.url) as string || null;
        }

        return null;
    };

    const extractVercelUrl = (result: GovernedExecutionResult): string | null => {
        const data = result.result?.output?.data as Record<string, unknown>;
        if (!data) return null;

        // Check for deployment URL
        if (data.deploymentUrl) return data.deploymentUrl as string;
        if (data.url && (data.url as string).includes('vercel.app')) return data.url as string;

        // Check in fullResult
        const fullResult = data.fullResult as Record<string, unknown> | undefined;
        if (fullResult?.deploymentUrl) return fullResult.deploymentUrl as string;
        if (fullResult?.url && (fullResult.url as string).includes('vercel.app')) return fullResult.url as string;

        // Check in nested data
        if (fullResult?.data) {
            const nestedData = fullResult.data as Record<string, unknown>;
            if (nestedData.deploymentUrl) return nestedData.deploymentUrl as string;
            if (nestedData.url && (nestedData.url as string).includes('vercel.app')) return nestedData.url as string;
        }

        // Check if it's a Vercel integration response
        if (data.integration === 'vercel' && fullResult?.data) {
            const vercelData = fullResult.data as Record<string, unknown>;
            return (vercelData.deploymentUrl || vercelData.url) as string || null;
        }

        return null;
    };

    // Helper to extract Vercel project and team info
    const extractVercelInfo = (result: GovernedExecutionResult): { projectName: string; teamName: string } | null => {
        const data = result.result?.output?.data as Record<string, unknown> | undefined;
        if (!data) return null;

        // Check in fullResult for Vercel data
        const fullResult = data.fullResult as Record<string, unknown> | undefined;

        // Try to extract from Vercel integration response
        if (data.integration === 'vercel' && fullResult?.data) {
            const vercelData = fullResult.data as Record<string, unknown>;
            return {
                projectName: (vercelData.projectName || vercelData.name || result.stepId || 'app-frontend') as string,
                teamName: (vercelData.teamName || vercelData.team || 'abdulgeek') as string
            };
        }

        // Try to extract from step ID or other fields
        if (result.stepId?.toLowerCase().includes('vercel')) {
            // Extract from step ID like "vercel_frontend" or "deploy_vercel"
            const projectName = result.stepId.replace(/vercel_?/i, '').replace(/_/g, '-') || 'app-frontend';
            return {
                projectName,
                teamName: 'abdulgeek' // Default team name
            };
        }

        // Try to get from GitHub repo info if it's a frontend deployment
        const githubUrl = extractGitHubUrl(result);
        if (githubUrl) {
            const repoInfo = extractRepoInfo(githubUrl);
            if (repoInfo && repoInfo.name.includes('frontend')) {
                return {
                    projectName: repoInfo.name,
                    teamName: repoInfo.owner
                };
            }
        }

        return null;
    };

    const extractRepoInfo = (url: string) => {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return { owner: match[1], name: match[2] };
        }
        return null;
    };

    const getModeIcon = (mode: AgentMode) => {
        switch (mode) {
            case AgentMode.SCOPE:
                return <BeakerIcon className="w-5 h-5" />;
            case AgentMode.CLARIFY:
                return <ChatBubbleLeftIcon className="w-5 h-5" />;
            case AgentMode.PLAN:
                return <DocumentTextIcon className="w-5 h-5" />;
            case AgentMode.BUILD:
                return <CpuChipIcon className="w-5 h-5" />;
            case AgentMode.VERIFY:
                return <ShieldCheckIcon className="w-5 h-5" />;
            case AgentMode.DONE:
                return <RocketLaunchIcon className="w-5 h-5 text-primary-500" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    const getModeColor = (mode: AgentMode) => {
        switch (mode) {
            case AgentMode.SCOPE:
                return 'bg-highlight-500/10 text-highlight-500 border-highlight-500/30';
            case AgentMode.CLARIFY:
                return 'bg-accent-500/10 text-accent-500 border-accent-500/30';
            case AgentMode.PLAN:
                return 'bg-primary-500/10 text-primary-500 border-primary-500/30';
            case AgentMode.BUILD:
                return 'bg-highlight-500/10 text-highlight-500 border-highlight-500/30';
            case AgentMode.VERIFY:
                return 'bg-success-500/10 text-success-500 border-success-500/30';
            case AgentMode.DONE:
                return 'bg-primary-500/10 text-primary-500 border-primary-500/30';
            default:
                return 'bg-secondary-500/10 text-secondary-500 border-secondary-500/30';
        }
    };

    const getComplexityColor = (complexity?: string) => {
        switch (complexity) {
            case 'low':
                return 'bg-success-500/10 text-success-500 border-success-500/30';
            case 'medium':
                return 'bg-accent-500/10 text-accent-500 border-accent-500/30';
            case 'high':
                return 'bg-danger-500/10 text-danger-500 border-danger-500/30';
            default:
                return 'bg-secondary-500/10 text-secondary-500 border-secondary-500/30';
        }
    };

    const getRiskLevelColor = (riskLevel?: string) => {
        switch (riskLevel) {
            case 'none':
                return 'bg-success-500/10 text-success-500';
            case 'low':
                return 'bg-highlight-500/10 text-highlight-500';
            case 'medium':
                return 'bg-accent-500/10 text-accent-500';
            case 'high':
                return 'bg-danger-500/10 text-danger-500';
            default:
                return 'bg-secondary-500/10 text-secondary-500';
        }
    };

    const handleModifyPlan = () => {
        if (onInteract) {
            onInteract('modify_plan', { taskId });
        }
    };

    const handleAskQuestion = async () => {
        if (!questionInput.trim()) return;

        try {
            setAskingQuestion(true);
            const response = await apiClient.post(`/chat/${chatId}/plan/question`, {
                taskId,
                question: questionInput
            });

            // Show answer in chat or modal
            if (onInteract) {
                onInteract('question_answered', {
                    question: questionInput,
                    answer: response.data.data.answer
                });
            }

            setQuestionInput('');
        } catch (error) {
            console.error('Failed to ask question:', error);
        } finally {
            setAskingQuestion(false);
        }
    };

    const handleRequestChanges = () => {
        if (onInteract) {
            onInteract('request_changes', { taskId });
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 rounded-2xl shadow-2xl border border-primary-500/20 p-6 animate-pulse">
                <div className="h-8 bg-primary-500/10 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-primary-500/5 rounded w-1/2"></div>
            </div>
        );
    }

    if (!task) {
        return null;
    }

    const totalSteps = task.plan?.phases.reduce((acc, phase) => acc + phase.steps.length, 0) || 0;
    const completedSteps = task.executionProgress?.completedSteps?.length || 0;
    const _failedSteps = task.executionProgress?.failedSteps?.length || 0;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <div className="relative group">
            {/* Premium glassmorphism card */}
            <div className="bg-gradient-to-br from-dark-panel/95 to-dark-bg-100/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-500/20 overflow-hidden hover:shadow-primary-500/10 transition-all duration-300">
                {/* Premium Header with gradient accent */}
                <div
                    className="relative p-5 cursor-pointer bg-gradient-to-r from-primary-500/5 via-transparent to-highlight-500/5 hover:from-primary-500/10 hover:to-highlight-500/10 transition-all duration-300"
                    onClick={() => setExpanded(!expanded)}
                >
                    {/* Animated gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-transparent to-highlight-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Expand/Collapse with animation */}
                            <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 transition-transform duration-200">
                                {expanded ? (
                                    <ChevronDownIcon className="w-5 h-5 text-primary-500" />
                                ) : (
                                    <ChevronRightIcon className="w-5 h-5 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
                                )}
                            </div>

                            {/* Mode Icon and Title */}
                            <div className="flex items-center gap-3 flex-1">
                                <div className="p-3 bg-gradient-to-br from-primary-500/20 to-highlight-500/20 rounded-xl border border-primary-500/30 shadow-lg">
                                    {getModeIcon(task.mode)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="group/title relative">
                                        <h3 className="font-display font-bold text-lg text-white truncate" title={task.userRequest}>
                                            {task.userRequest}
                                        </h3>
                                        {/* Tooltip on hover */}
                                        <div className="absolute left-0 top-full mt-2 p-3 bg-dark-panel border border-primary-500/30 rounded-lg shadow-2xl 
                                                      opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 
                                                      z-50 max-w-md w-max pointer-events-none">
                                            <p className="text-sm text-white whitespace-normal">{task.userRequest}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <SparklesIcon className="w-4 h-4 text-primary-500" />
                                        <p className="text-sm text-primary-400 font-medium">
                                            AI Autonomous Agent
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Premium Mode Badge */}
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getModeColor(task.mode)} backdrop-blur-sm`}>
                                {task.mode}
                            </span>

                            {/* Animated Progress Ring for BUILD mode */}
                            {task.mode === AgentMode.BUILD && totalSteps > 0 && (
                                <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12 transform -rotate-90">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-gray-700"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${progress * 1.26} 126`}
                                            className="text-primary-500 transition-all duration-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary-500">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Status Indicator */}
                            {task.status === 'completed' && <CheckCircleIcon className="w-6 h-6 text-success-500" />}
                            {task.status === 'failed' && <XCircleIcon className="w-6 h-6 text-danger-500" />}
                            {task.status === 'in_progress' && <ArrowPathIcon className="w-6 h-6 text-highlight-500 animate-spin" />}
                            {task.status === 'pending' && <ClockIcon className="w-6 h-6 text-secondary-500" />}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {expanded && (
                    <div className="border-t border-primary-500/10">
                        {/* Action Buttons Bar */}
                        <div className="p-4 bg-gradient-to-r from-primary-500/5 to-highlight-500/5 border-b border-primary-500/10">
                            <div className="flex items-center gap-3 flex-wrap">
                                {task.mode === AgentMode.PLAN && (
                                    <button
                                        onClick={handleModifyPlan}
                                        className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-primary-500/25"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Modify Plan
                                    </button>
                                )}

                                {task.mode === AgentMode.DONE && (
                                    <button
                                        onClick={handleRequestChanges}
                                        className="px-4 py-2 bg-gradient-to-r from-highlight-500 to-highlight-600 hover:from-highlight-600 hover:to-highlight-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-highlight-500/25"
                                    >
                                        <CodeBracketIcon className="w-4 h-4" />
                                        Request Changes
                                    </button>
                                )}

                                {/* Premium Question Input */}
                                <div className="flex-1 flex items-center gap-2 min-w-[300px]">
                                    <input
                                        type="text"
                                        value={questionInput}
                                        onChange={(e) => setQuestionInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                                        placeholder="Ask about this plan..."
                                        className="flex-1 px-4 py-2 text-sm border border-primary-500/20 rounded-lg bg-dark-bg-100/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                                    />
                                    <button
                                        onClick={handleAskQuestion}
                                        disabled={!questionInput.trim() || askingQuestion}
                                        className="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold border border-primary-500/30"
                                    >
                                        <ChatBubbleLeftIcon className="w-4 h-4" />
                                        Ask
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="p-6 space-y-6">
                            {/* Premium Scope Analysis Cards */}
                            {task.scopeAnalysis && (
                                <div className="space-y-4">
                                    <h4 className="font-display font-bold text-lg text-white flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-highlight-500/20 to-primary-500/20 rounded-lg">
                                            <BeakerIcon className="w-5 h-5 text-highlight-500" />
                                        </div>
                                        Scope Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Complexity Card */}
                                        <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 p-4 rounded-xl border border-primary-500/10 hover:border-primary-500/30 transition-all duration-200">
                                            <div className="text-xs text-gray-400 mb-1">Complexity</div>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${getComplexityColor(task.classification?.complexity)}`}>
                                                {task.classification?.complexity || 'N/A'}
                                            </div>
                                        </div>

                                        {/* Risk Level Card */}
                                        <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 p-4 rounded-xl border border-primary-500/10 hover:border-primary-500/30 transition-all duration-200">
                                            <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getRiskLevelColor(task.classification?.riskLevel)}`}>
                                                <ShieldCheckIcon className="w-4 h-4" />
                                                {task.classification?.riskLevel || 'N/A'}
                                            </div>
                                        </div>

                                        {/* Duration Card */}
                                        <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 p-4 rounded-xl border border-primary-500/10 hover:border-primary-500/30 transition-all duration-200">
                                            <div className="text-xs text-gray-400 mb-1">Est. Duration</div>
                                            <div className="text-lg font-bold text-primary-500">
                                                {task.classification?.estimatedDuration || 0}s
                                            </div>
                                        </div>

                                        {/* Integrations Card */}
                                        <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 p-4 rounded-xl border border-primary-500/10 hover:border-primary-500/30 transition-all duration-200">
                                            <div className="text-xs text-gray-400 mb-1">Integrations</div>
                                            <div className="flex flex-wrap gap-1">
                                                {task.classification?.integrations?.map((integration, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-highlight-500/10 text-highlight-500 rounded text-xs font-medium">
                                                        {integration}
                                                    </span>
                                                )) || <span className="text-gray-500">None</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Premium Execution Plan Timeline */}
                            {task.plan && (
                                <div className="space-y-4">
                                    <h4 className="font-display font-bold text-lg text-white flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-primary-500/20 to-highlight-500/20 rounded-lg">
                                            <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                                        </div>
                                        Execution Plan
                                        <span className="px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded-full text-xs font-bold">
                                            {task.plan.phases.length} phases
                                        </span>
                                    </h4>

                                    {/* Timeline Design */}
                                    <div className="space-y-3">
                                        {task.plan.phases.map((phase, idx) => (
                                            <div key={idx} className="relative">
                                                {/* Connecting Line */}
                                                {idx < task.plan!.phases.length - 1 && (
                                                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-primary-500/30 to-transparent"></div>
                                                )}

                                                <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 rounded-xl border border-primary-500/10 hover:border-primary-500/30 transition-all duration-200 overflow-hidden">
                                                    <button
                                                        onClick={() => setExpandedPhase(expandedPhase === idx ? null : idx)}
                                                        className="w-full p-4 hover:bg-primary-500/5 transition-colors flex items-center gap-3"
                                                    >
                                                        {/* Phase Number Circle */}
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-highlight-500/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-500">
                                                            {idx + 1}
                                                        </div>

                                                        <div className="flex-1 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-white">{phase.name}</span>
                                                                <span className="px-2 py-0.5 bg-highlight-500/10 text-highlight-500 rounded text-xs font-medium">
                                                                    {phase.steps.length} steps
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {expandedPhase === idx ? (
                                                            <ChevronDownIcon className="w-5 h-5 text-primary-500" />
                                                        ) : (
                                                            <ChevronRightIcon className="w-5 h-5 text-primary-500" />
                                                        )}
                                                    </button>

                                                    {expandedPhase === idx && (
                                                        <div className="border-t border-primary-500/10 p-4 bg-dark-bg-100/50">
                                                            <div className="space-y-2">
                                                                {phase.steps.map((step) => {
                                                                    const isCompleted = task.executionProgress?.completedSteps?.includes(step.id);
                                                                    const isFailed = task.executionProgress?.failedSteps?.some(f => f.stepId === step.id);
                                                                    const isCurrent = task.executionProgress?.currentStep === step.id;

                                                                    return (
                                                                        <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-500/5 transition-colors">
                                                                            <div className="mt-0.5">
                                                                                {isCompleted && <CheckCircleIcon className="w-5 h-5 text-success-500" />}
                                                                                {isFailed && <XCircleIcon className="w-5 h-5 text-danger-500" />}
                                                                                {isCurrent && <ArrowPathIcon className="w-5 h-5 text-highlight-500 animate-spin" />}
                                                                                {!isCompleted && !isFailed && !isCurrent && <ClockIcon className="w-5 h-5 text-gray-500" />}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className={`text-sm ${isCompleted ? 'text-success-500 font-medium' :
                                                                                    isFailed ? 'text-danger-500 line-through' :
                                                                                        'text-gray-300'
                                                                                    }`}>
                                                                                    {step.description}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Premium Execution Results */}
                            {task.mode === AgentMode.DONE && task.executionResults && task.executionResults.length > 0 && (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setExpandedResults(!expandedResults)}
                                        className="w-full p-4 bg-gradient-to-r from-success-500/10 via-primary-500/10 to-highlight-500/10 border border-success-500/30 rounded-xl hover:border-success-500/50 transition-all duration-200 flex items-center justify-between group"
                                    >
                                        <h4 className="font-display font-bold text-lg text-white flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-success-500/20 to-primary-500/20 rounded-lg">
                                                <RocketLaunchIcon className="w-5 h-5 text-success-500" />
                                            </div>
                                            Execution Results
                                            <span className="px-2 py-0.5 bg-success-500/10 text-success-500 rounded-full text-xs font-bold">
                                                {task.executionResults.length} items
                                            </span>
                                        </h4>
                                        {expandedResults ? (
                                            <ChevronDownIcon className="w-5 h-5 text-success-500 group-hover:translate-y-0.5 transition-transform" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5 text-success-500 group-hover:translate-x-0.5 transition-transform" />
                                        )}
                                    </button>

                                    {expandedResults && (
                                        <div className="space-y-4">
                                            {task.executionResults.map((result: GovernedExecutionResult, idx: number) => {
                                                const githubUrl = extractGitHubUrl(result);
                                                const vercelUrl = extractVercelUrl(result);
                                                const repoInfo = githubUrl ? extractRepoInfo(githubUrl) : null;

                                                // Check if this is a command/terminal output
                                                const isCommand = result.stepId?.toLowerCase().includes('command') ||
                                                    result.stepId?.toLowerCase().includes('install') ||
                                                    result.stepId?.toLowerCase().includes('build') ||
                                                    result.stepId?.toLowerCase().includes('commit') ||
                                                    result.stepId?.toLowerCase().includes('push');

                                                // Check if it's a GitHub or Vercel step that should show terminal
                                                const isGitHubStep = result.stepId?.toLowerCase().includes('github');
                                                const isVercelStep = result.stepId?.toLowerCase().includes('vercel') ||
                                                    result.stepId?.toLowerCase().includes('deploy');

                                                return (
                                                    <div key={idx} className="space-y-3">
                                                        {/* Step Header */}
                                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-dark-panel to-dark-bg-100 rounded-lg border border-primary-500/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-highlight-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-500">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="font-semibold text-white">
                                                                    {result.stepId || `Step ${idx + 1}`}
                                                                </span>
                                                            </div>
                                                            {result.status === 'completed' && (
                                                                <span className="px-3 py-1 bg-success-500/10 text-success-500 border border-success-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    Completed
                                                                </span>
                                                            )}
                                                            {result.status === 'failed' && (
                                                                <span className="px-3 py-1 bg-danger-500/10 text-danger-500 border border-danger-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                                                                    <XCircleIcon className="w-4 h-4" />
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* GitHub Repository Card */}
                                                        {githubUrl && (
                                                            <GitHubRepoCard
                                                                repoUrl={githubUrl}
                                                                repoName={repoInfo?.name}
                                                                owner={repoInfo?.owner}
                                                                description={result.result?.output?.message as string}
                                                            />
                                                        )}

                                                        {/* Vercel Deployment Card */}
                                                        {vercelUrl && (() => {
                                                            const vercelInfo = extractVercelInfo(result);
                                                            const projectName = vercelInfo?.projectName || repoInfo?.name || result.stepId || 'app-frontend';
                                                            const teamName = vercelInfo?.teamName || repoInfo?.owner || 'abdulgeek';

                                                            return (
                                                                <VercelDeploymentCard
                                                                    deploymentUrl={vercelUrl}
                                                                    projectName={projectName}
                                                                    teamName={teamName}
                                                                    status="ready"
                                                                />
                                                            );
                                                        })()}

                                                        {/* Terminal Output for GitHub/Vercel operations */}
                                                        {(isGitHubStep || isVercelStep) && !githubUrl && !vercelUrl && result.result?.output?.message && (
                                                            <TerminalOutput
                                                                command={`# ${result.stepId}`}
                                                                output={result.result.output.message as string}
                                                            />
                                                        )}

                                                        {/* Terminal Output for Commands */}
                                                        {isCommand && result.result?.output?.message && !githubUrl && !vercelUrl && !isGitHubStep && !isVercelStep && (
                                                            <TerminalOutput
                                                                command={result.stepId || ''}
                                                                output={result.result.output.message as string}
                                                            />
                                                        )}

                                                        {/* Generated Files */}
                                                        {result.result?.output?.files && result.result.output.files.length > 0 && (
                                                            <div className="bg-gradient-to-br from-dark-panel to-dark-bg-100 rounded-xl border border-primary-500/10 p-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <FolderOpenIcon className="w-5 h-5 text-primary-500" />
                                                                    <span className="font-semibold text-white">Generated Files</span>
                                                                    <span className="px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded text-xs font-medium">
                                                                        {result.result.output.files.length}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {result.result.output.files.map((file, fileIdx) => (
                                                                        <div key={fileIdx} className="flex items-center gap-2 p-2 hover:bg-primary-500/5 rounded transition-colors">
                                                                            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                                                                            <span className="font-mono text-sm text-gray-300">{file.path}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Default message display if no special handling */}
                                                        {!githubUrl && !vercelUrl && !isCommand && result.result?.output?.message && (
                                                            <div className="p-4 bg-gradient-to-br from-dark-panel to-dark-bg-100 rounded-lg border border-primary-500/10">
                                                                <p className="text-sm text-gray-300">
                                                                    {result.result.output.message as string}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GovernedPlanCard;