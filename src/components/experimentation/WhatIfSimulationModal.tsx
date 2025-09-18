import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    XMarkIcon,
    BeakerIcon,
    SparklesIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Usage } from '../../types';
import { ExperimentationService } from '../../services/experimentation.service';
import { formatCurrency } from '../../utils/formatters';

interface WhatIfSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    usage: Usage | null;
}

interface SimulationResult {
    currentCost: {
        model: string;
        cost: number;
        tokens: number;
    };
    optimizedOptions: Array<{
        type: string;
        description: string;
        newModel?: string;
        savings: number;
        savingsPercentage: number;
        newCost: number;
        risk: 'low' | 'medium' | 'high';
        implementation: 'easy' | 'moderate' | 'complex';
    }>;
    recommendations: (string | {
        priority?: 'high' | 'medium' | 'low';
        title?: string;
        description?: string;
        message?: string;
        action?: string;
        savings?: number | { cost?: number; percentage?: number;[key: string]: any };
        implementation?: string;
        risk?: string;
        [key: string]: any
    })[];
    potentialSavings: number;
    confidence: number;
}

export const WhatIfSimulationModal: React.FC<WhatIfSimulationModalProps> = ({
    isOpen,
    onClose,
    usage,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (isOpen && usage) {
            runSimulation();
        }
    }, [isOpen, usage]); // runSimulation is defined inline, so it's safe to omit

    const runSimulation = async () => {
        if (!usage) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await ExperimentationService.runRealTimeSimulation({
                prompt: usage?.prompt || '',
                currentModel: usage?.model || '',
                simulationType: 'real_time_analysis',
                options: {
                    optimizationGoals: ['cost', 'quality'],
                },
            });

            setSimulationResult(result);
        } catch (err: any) {
            setError(err.message || 'Failed to run simulation');
        } finally {
            setIsLoading(false);
        }
    };



    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'text-success-600 bg-gradient-success/10 border-success-200/30';
            case 'medium':
                return 'text-accent-600 bg-gradient-accent/10 border-accent-200/30';
            case 'high':
                return 'text-danger-600 bg-gradient-danger/10 border-danger-200/30';
            default:
                return 'text-light-text-secondary dark:text-dark-text-secondary bg-primary-100/50 border-primary-200/30';
        }
    };

    const getImplementationColor = (implementation: string) => {
        switch (implementation) {
            case 'easy':
                return 'text-success-600 bg-gradient-success/10 border-success-200/30';
            case 'moderate':
                return 'text-accent-600 bg-gradient-accent/10 border-accent-200/30';
            case 'complex':
                return 'text-danger-600 bg-gradient-danger/10 border-danger-200/30';
            default:
                return 'text-light-text-secondary dark:text-dark-text-secondary bg-primary-100/50 border-primary-200/30';
        }
    };

    if (!usage) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden glass rounded-xl shadow-2xl backdrop-blur-xl border border-primary-200/30 p-8 text-left align-middle transition-all animate-scale-in">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-primary p-3 rounded-xl glow-primary shadow-lg mr-4">
                                            <BeakerIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <Dialog.Title as="h3" className="text-2xl font-display font-bold gradient-text">
                                            What-If Cost Simulation
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-300 hover:scale-110"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Original Usage Info */}
                                <div className="glass p-6 rounded-xl border border-primary-200/30 bg-primary-500/5 mb-6">
                                    <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Original Request</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-body text-light-text-muted dark:text-dark-text-muted">Model:</span>
                                            <p className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{usage?.model || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <span className="font-body text-light-text-muted dark:text-dark-text-muted">Cost:</span>
                                            <p className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{formatCurrency(usage?.cost || 0)}</p>
                                        </div>
                                        <div>
                                            <span className="font-body text-light-text-muted dark:text-dark-text-muted">Tokens:</span>
                                            <p className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{(usage?.totalTokens || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="font-body text-light-text-muted dark:text-dark-text-muted">Response Time:</span>
                                            <p className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{usage?.responseTime || 0}ms</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className="font-body text-light-text-muted dark:text-dark-text-muted">Prompt:</span>
                                        <div className="glass p-3 rounded-xl border border-primary-200/30 bg-primary-500/5 text-sm font-body text-light-text-primary dark:text-dark-text-primary mt-2">
                                            {usage?.prompt && usage.prompt.length > 200
                                                ? `${usage.prompt.substring(0, 200)}...`
                                                : usage?.prompt || 'No prompt available'}
                                        </div>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="spinner-lg text-primary-500"></div>
                                        <span className="ml-3 font-body text-light-text-secondary dark:text-dark-text-secondary">Running simulation...</span>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="glass p-6 bg-danger-500/10 border border-danger-200/30 rounded-xl text-danger-700 dark:text-danger-300 animate-fade-in mb-6">
                                        <div className="flex">
                                            <ExclamationTriangleIcon className="h-6 w-6 text-danger-500 mr-3 glow-danger" />
                                            <div>
                                                <h4 className="font-display font-semibold text-danger-800 dark:text-danger-200">Simulation Failed</h4>
                                                <p className="font-body text-danger-700 dark:text-danger-300 text-sm mt-1">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Simulation Results */}
                                {simulationResult && (
                                    <div className="space-y-6">
                                        {/* Summary */}
                                        <div className="glass p-8 bg-gradient-primary/10 border border-primary-200/30 rounded-xl shadow-lg animate-fade-in">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xl font-display font-bold gradient-text">Optimization Opportunities</h4>
                                                <div className="text-right">
                                                    <p className="text-4xl font-display font-bold gradient-text">
                                                        {formatCurrency(simulationResult.potentialSavings || 0)}
                                                    </p>
                                                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Potential Savings</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ChartBarIcon className="h-5 w-5 text-primary-500 mr-3 glow-primary" />
                                                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Confidence: <span className="font-display font-semibold gradient-text">{Math.round(simulationResult.confidence || 0)}%</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Optimization Options */}
                                        <div className="glass p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
                                            <h4 className="text-xl font-display font-bold gradient-text mb-6">Optimization Options</h4>
                                            <div className="space-y-4">
                                                {(simulationResult.optimizedOptions || []).map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className="glass p-6 rounded-xl border border-primary-200/30 bg-primary-500/5 hover:bg-primary-500/10 transition-all duration-300"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center mb-3">
                                                                    <SparklesIcon className="h-5 w-5 text-accent-500 mr-3 glow-accent" />
                                                                    <h5 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                                        {typeof option.description === 'string' ? option.description :
                                                                            typeof option.description === 'object' && option.description !== null ?
                                                                                JSON.stringify(option.description) :
                                                                                String(option.description || '')}
                                                                    </h5>
                                                                </div>
                                                                {option.newModel && (
                                                                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                                                                        Switch to: <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{option.newModel}</span>
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center space-x-4 text-sm">
                                                                    <div className="flex items-center">
                                                                        {(() => {
                                                                            const savings = option.savings as any;
                                                                            const cost = typeof savings === 'object' && savings !== null && typeof savings.cost === 'number'
                                                                                ? savings.cost
                                                                                : (typeof option.savings === 'number' ? option.savings : 0);
                                                                            const percentage = typeof savings === 'object' && savings !== null && typeof savings.percentage === 'number'
                                                                                ? savings.percentage
                                                                                : (option.savingsPercentage || 0);

                                                                            const isIncrease = cost < 0 || percentage < 0;
                                                                            const iconClass = isIncrease ? "h-4 w-4 text-danger-500 mr-2 glow-danger" : "h-4 w-4 text-success-500 mr-2 glow-success";
                                                                            const textClass = isIncrease ? "font-display font-bold text-danger-600" : "font-display font-bold text-success-600 gradient-text";
                                                                            const actionText = isIncrease ? "Cost increase" : "Save";

                                                                            return (
                                                                                <>
                                                                                    <CurrencyDollarIcon className={iconClass} />
                                                                                    <span className={textClass}>
                                                                                        {actionText} {formatCurrency(Math.abs(cost))} ({Math.abs(percentage).toFixed(1)}%)
                                                                                    </span>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                    <span className={`px-3 py-1 rounded-xl text-xs font-display font-bold shadow-lg border ${getRiskColor(option.risk || 'medium')}`}>
                                                                        {option.risk || 'medium'} risk
                                                                    </span>
                                                                    <span className={`px-3 py-1 rounded-xl text-xs font-display font-bold shadow-lg border ${getImplementationColor(option.implementation || 'moderate')}`}>
                                                                        {option.implementation || 'moderate'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        {(simulationResult.recommendations || []).length > 0 && (
                                            <div className="glass p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
                                                <h4 className="text-xl font-display font-bold gradient-text mb-6">AI Recommendations</h4>
                                                <div className="glass p-6 rounded-xl border border-primary-200/30 bg-primary-500/5">
                                                    <ul className="space-y-4">
                                                        {(simulationResult.recommendations || []).map((rec, index) => {
                                                            const recommendation = typeof rec === 'string' ? { title: rec } : rec;
                                                            return (
                                                                <li key={index} className="flex items-start">
                                                                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                                    <div className="flex-1">
                                                                        <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                                                                            {recommendation.title || recommendation.description || recommendation.message || recommendation.action || 'Optimization recommendation'}
                                                                        </span>
                                                                        {recommendation.priority && (
                                                                            <span className={`ml-3 px-3 py-1 rounded-xl text-xs font-display font-bold shadow-lg ${recommendation.priority === 'high' ? 'bg-gradient-danger text-white' :
                                                                                recommendation.priority === 'medium' ? 'bg-gradient-accent text-white' :
                                                                                    'bg-gradient-success text-white'
                                                                                }`}>
                                                                                {recommendation.priority} priority
                                                                            </span>
                                                                        )}
                                                                        {recommendation.savings && (
                                                                            <div className="font-body text-success-600 mt-1">
                                                                                💰 Potential savings: {(() => {
                                                                                    if (typeof recommendation.savings === 'number') {
                                                                                        return `$${recommendation.savings.toFixed(4)}`;
                                                                                    } else if (typeof recommendation.savings === 'object' && recommendation.savings !== null) {
                                                                                        const savings = recommendation.savings as any;
                                                                                        if (savings.cost) {
                                                                                            return `$${savings.cost.toFixed(4)}`;
                                                                                        } else if (savings.percentage) {
                                                                                            return `${savings.percentage.toFixed(1)}%`;
                                                                                        } else {
                                                                                            return JSON.stringify(savings);
                                                                                        }
                                                                                    } else {
                                                                                        return String(recommendation.savings || '');
                                                                                    }
                                                                                })()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-primary-200/30">
                                    <button
                                        onClick={onClose}
                                        className="btn-secondary font-display font-medium hover:scale-105 transition-all duration-300"
                                    >
                                        Close
                                    </button>
                                    {simulationResult && (
                                        <button
                                            onClick={runSimulation}
                                            className="btn-primary font-display font-semibold hover:scale-105 transition-all duration-300"
                                        >
                                            <BeakerIcon className="h-4 w-4 mr-2 inline" />
                                            Rerun Simulation
                                        </button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};