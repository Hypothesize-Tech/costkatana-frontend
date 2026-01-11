import React from 'react';
import { ExecutionPlan, TaskType } from '../../types/governedAgent';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    CodeBracketIcon,
    LinkIcon,
    ChartBarIcon,
    BookOpenIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface PlanViewProps {
    plan: ExecutionPlan;
    approvalToken?: string;
    taskType?: TaskType;
    onApprove?: () => void;
    onCancel?: () => void;
    onRequestChanges?: (feedback: string) => void;
    onGoBack?: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
    plan,
    approvalToken,
    taskType,
    onApprove,
    onCancel,
    onRequestChanges,
    onGoBack
}) => {
    const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
    const [feedback, setFeedback] = React.useState('');

    // Professional taskType configuration
    const getTaskTypeConfig = () => {
        switch (taskType) {
            case 'simple_query':
                return {
                    Icon: MagnifyingGlassIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Execute Query',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Query Ready',
                    noApprovalSubtitle: 'Read-only query will execute automatically',
                    planTitle: 'Query Execution Steps'
                };
            case 'complex_query':
                return {
                    Icon: ChartBarIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Execute Complex Query',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Advanced Query Ready',
                    noApprovalSubtitle: 'Multi-step query will execute automatically',
                    planTitle: 'Advanced Query Pipeline'
                };
            case 'cross_integration':
                return {
                    Icon: LinkIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Approve Integration Flow',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Integration Flow Ready',
                    noApprovalSubtitle: 'Data will flow between systems as planned',
                    planTitle: 'Cross-System Integration'
                };
            case 'data_transformation':
                return {
                    Icon: ChartBarIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Approve Transformation',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Transformation Ready',
                    noApprovalSubtitle: 'Data transformation pipeline is safe to execute',
                    planTitle: 'Transformation Pipeline'
                };
            case 'coding':
                return {
                    Icon: CodeBracketIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Approve & Deploy',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Deployment Ready',
                    noApprovalSubtitle: 'Code generation and deployment plan is ready',
                    planTitle: 'Development & Deployment'
                };
            case 'research':
                return {
                    Icon: BookOpenIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Start Research',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'Research Ready',
                    noApprovalSubtitle: 'Web search and synthesis will begin automatically',
                    planTitle: 'Research & Synthesis'
                };
            default:
                return {
                    Icon: Cog6ToothIcon,
                    headerGradient: 'from-green-500 to-green-600',
                    headerBg: 'bg-green-50/50 dark:bg-black/50',
                    headerBorder: 'border-green-200/30 dark:border-green-700/30',
                    textColor: 'text-green-600 dark:text-green-400',
                    approveText: 'Approve & Execute',
                    approveGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                    noApprovalTitle: 'No approval required',
                    noApprovalSubtitle: 'This operation has been assessed as safe',
                    planTitle: 'Execution Plan'
                };
        }
    };

    const taskConfig = getTaskTypeConfig();

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
            case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-green-50/30 dark:bg-black/80">
            {/* Task Type Badge */}
            {taskType && (
                <div className={`rounded-xl border p-5 ${taskConfig.headerBorder} ${taskConfig.headerBg} backdrop-blur-sm`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${taskConfig.headerGradient} flex items-center justify-center shadow-lg`}>
                            <taskConfig.Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-green-100">
                                {taskConfig.planTitle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-green-300">
                                {taskType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Research Findings */}
            {plan.researchSources && plan.researchSources.length > 0 && (
                <div className="rounded-xl border border-green-200/30 dark:border-green-700/30 p-6 bg-green-50/50 dark:bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-green-900 dark:text-green-100">
                            Research Findings
                        </h3>
                    </div>

                    {plan.researchSources.map((research, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="bg-white dark:bg-black/80 rounded-lg p-4 border border-green-200/30 dark:border-green-700/30">
                                <h4 className="font-semibold text-gray-900 dark:text-green-100 mb-2">
                                    {research.query}
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-green-200 mb-3">
                                    {research.synthesis}
                                </p>
                                {research.keyFindings && research.keyFindings.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-green-300 uppercase">
                                            Key Findings:
                                        </p>
                                        <ul className="space-y-1">
                                            {research.keyFindings.map((finding, fidx) => (
                                                <li key={fidx} className="text-sm text-gray-700 dark:text-green-200 flex items-start gap-2">
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{finding}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Execution Phases */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${taskConfig.headerGradient} flex items-center justify-center shadow-lg`}>
                        <Cog6ToothIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-green-100">
                        Execution Plan ({plan.phases.length} {plan.phases.length === 1 ? 'Phase' : 'Phases'})
                    </h3>
                </div>

                {plan.phases.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="rounded-xl border border-green-200/30 dark:border-green-700/30 overflow-hidden backdrop-blur-sm">
                        <div className={`${taskConfig.headerBg} p-4 border-b ${taskConfig.headerBorder}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${taskConfig.headerGradient} text-white font-bold text-sm shadow-sm`}>
                                        {phaseIdx + 1}
                                    </span>
                                    <div>
                                        <h4 className="font-display font-bold text-gray-900 dark:text-green-100">
                                            {phase.name}
                                        </h4>
                                        {phase.approvalRequired && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 mt-1">
                                                <ExclamationTriangleIcon className="w-3 h-3" />
                                                Requires Approval
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRiskColor(phase.riskLevel)}`}>
                                    {phase.riskLevel.toUpperCase()} RISK
                                </span>
                            </div>
                        </div>

                        <div className="p-4 space-y-2 bg-green-50/50 dark:bg-black/80">
                            {phase.steps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex items-start gap-3 p-3 rounded-lg border border-green-200/30 dark:border-green-700/30 hover:border-green-300 dark:hover:border-green-600 hover:shadow-sm transition-all">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br ${taskConfig.headerGradient} text-white flex items-center justify-center text-xs font-bold`}>
                                        {stepIdx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-green-100 mb-1">
                                            {step.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-green-300">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30">
                                                <Cog6ToothIcon className="w-3 h-3" />
                                                {step.tool}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30">
                                                {step.action}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30">
                                                <ClockIcon className="w-3 h-3" />
                                                ~{step.estimatedDuration}s
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Risk Assessment */}
            <div className={`rounded-xl border p-6 backdrop-blur-sm ${getRiskColor(plan.riskAssessment.level)}`}>
                <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    <h3 className="text-lg font-display font-bold">
                        Risk Assessment
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold mb-2">Risk Level: {plan.riskAssessment.level.toUpperCase()}</p>
                        {plan.riskAssessment.reasons.length > 0 && (
                            <ul className="space-y-2">
                                {plan.riskAssessment.reasons.map((reason, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {plan.riskAssessment.mitigationStrategies && plan.riskAssessment.mitigationStrategies.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-2">Mitigation Strategies:</p>
                            <ul className="space-y-2">
                                {plan.riskAssessment.mitigationStrategies.map((strategy, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{strategy}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Estimates Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Cost Estimate */}
                {plan.estimatedCost !== undefined && plan.estimatedCost > 0 && (
                    <div className="rounded-xl border border-green-200/30 dark:border-green-700/30 p-4 bg-green-50/50 dark:bg-black/60 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-green-100">Estimated Cost</h4>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${plan.estimatedCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-green-300">per month</p>
                    </div>
                )}

                {/* Duration Estimate */}
                <div className="rounded-xl border border-green-200/30 dark:border-green-700/30 p-4 bg-green-50/50 dark:bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-green-100">Est. Duration</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {plan.estimatedDuration < 60
                            ? `${plan.estimatedDuration}s`
                            : `${Math.round(plan.estimatedDuration / 60)}m`}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-green-300">total time</p>
                </div>
            </div>

            {/* Rollback Plan */}
            {plan.rollbackPlan && (
                <div className="rounded-xl border border-green-200/30 dark:border-green-700/30 p-6 bg-green-50/50 dark:bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <ArrowPathIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Rollback Instructions</h4>
                    </div>
                    <pre className="text-xs text-gray-700 dark:text-green-300 bg-white dark:bg-black/80 p-3 rounded-lg border border-green-200/30 dark:border-green-700/30 overflow-x-auto whitespace-pre-wrap font-mono">
                        {plan.rollbackPlan}
                    </pre>
                </div>
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-black/90 border-t border-green-200/30 dark:border-green-700/30 p-4 -m-6 mt-6">
                {plan.riskAssessment.requiresApproval ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            {onGoBack && (
                                <button
                                    onClick={onGoBack}
                                    className="px-6 py-3 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-black/80 text-gray-600 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => onApprove?.()}
                                className={`flex-1 px-6 py-3 rounded-xl bg-gradient-to-r ${taskConfig.approveGradient} text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                {taskConfig.approveText}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-700 bg-white dark:bg-black/80 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>
                        {onRequestChanges && (
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="w-full px-6 py-3 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-black/80 text-gray-600 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Request Changes
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-green-200/30 dark:border-green-700/30 p-4 bg-green-50/50 dark:bg-black/60 text-center backdrop-blur-sm">
                        <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                            {taskConfig.noApprovalTitle}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {taskConfig.noApprovalSubtitle}
                        </p>
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-2xl border border-green-200/30 dark:border-green-700/30 p-6 max-w-lg w-full bg-white dark:bg-black/90 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-green-100 mb-4">
                            Request Changes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-green-300 mb-4">
                            What changes would you like to see in the execution plan?
                        </p>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="E.g., Use a different deployment strategy, add testing steps, etc."
                            className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-black/80 text-gray-900 dark:text-green-100 placeholder-gray-400 dark:placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    if (feedback.trim()) {
                                        onRequestChanges?.(feedback);
                                        setShowFeedbackModal(false);
                                        setFeedback('');
                                    }
                                }}
                                disabled={!feedback.trim()}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Feedback
                            </button>
                            <button
                                onClick={() => {
                                    setShowFeedbackModal(false);
                                    setFeedback('');
                                }}
                                className="px-6 py-3 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-black/80 text-gray-600 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-black/60 transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
