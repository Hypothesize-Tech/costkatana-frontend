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
                return 'text-green-600 bg-green-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'high':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getImplementationColor = (implementation: string) => {
        switch (implementation) {
            case 'easy':
                return 'text-green-600 bg-green-100';
            case 'moderate':
                return 'text-yellow-600 bg-yellow-100';
            case 'complex':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
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
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <BeakerIcon className="h-6 w-6 text-purple-600 mr-2" />
                                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                            What-If Cost Simulation
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Original Usage Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-gray-900 mb-2">Original Request</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Model:</span>
                                            <p className="font-medium">{usage?.model || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Cost:</span>
                                            <p className="font-medium">{formatCurrency(usage?.cost || 0)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Tokens:</span>
                                            <p className="font-medium">{(usage?.totalTokens || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Response Time:</span>
                                            <p className="font-medium">{usage?.responseTime || 0}ms</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-gray-500">Prompt:</span>
                                        <p className="text-sm mt-1 p-2 bg-white rounded border">
                                            {usage?.prompt && usage.prompt.length > 200
                                                ? `${usage.prompt.substring(0, 200)}...`
                                                : usage?.prompt || 'No prompt available'}
                                        </p>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-gray-600">Running simulation...</span>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                        <div className="flex">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                                            <div>
                                                <h4 className="text-red-800 font-medium">Simulation Failed</h4>
                                                <p className="text-red-700 text-sm mt-1">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Simulation Results */}
                                {simulationResult && (
                                    <div className="space-y-6">
                                        {/* Summary */}
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h4>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {formatCurrency(simulationResult.potentialSavings || 0)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Potential Savings</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                                                <span className="text-sm text-gray-600">
                                                    Confidence: {Math.round((simulationResult.confidence || 0) * 100)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Optimization Options */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Optimization Options</h4>
                                            <div className="space-y-3">
                                                {(simulationResult.optimizedOptions || []).map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center mb-2">
                                                                    <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                                                                    <h5 className="font-medium text-gray-900">
                                                                        {typeof option.description === 'string' ? option.description :
                                                                            typeof option.description === 'object' && option.description !== null ?
                                                                                JSON.stringify(option.description) :
                                                                                String(option.description || '')}
                                                                    </h5>
                                                                </div>
                                                                {option.newModel && (
                                                                    <p className="text-sm text-gray-600 mb-2">
                                                                        Switch to: <span className="font-medium">{option.newModel}</span>
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center space-x-4 text-sm">
                                                                    <div className="flex items-center">
                                                                        <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                                                                        <span className="text-green-600 font-medium">
                                                                            Save {(() => {
                                                                                if (typeof option.savings === 'number') {
                                                                                    return formatCurrency(option.savings);
                                                                                } else if (typeof option.savings === 'object' && option.savings !== null) {
                                                                                    const savings = option.savings as any;
                                                                                    if (savings.cost) {
                                                                                        return formatCurrency(savings.cost);
                                                                                    } else if (savings.percentage) {
                                                                                        return `${savings.percentage.toFixed(1)}%`;
                                                                                    } else {
                                                                                        return formatCurrency(0);
                                                                                    }
                                                                                } else {
                                                                                    return formatCurrency(0);
                                                                                }
                                                                            })()} ({(option.savingsPercentage || 0).toFixed(1)}%)
                                                                        </span>
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(option.risk || 'medium')}`}>
                                                                        {option.risk || 'medium'} risk
                                                                    </span>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImplementationColor(option.implementation || 'moderate')}`}>
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
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h4>
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <ul className="space-y-2">
                                                        {(simulationResult.recommendations || []).map((rec, index) => {
                                                            const recommendation = typeof rec === 'string' ? { title: rec } : rec;
                                                            return (
                                                                <li key={index} className="flex items-start">
                                                                    <div className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></div>
                                                                    <div className="flex-1">
                                                                        <span className="text-sm text-blue-800 font-medium">
                                                                            {recommendation.title || recommendation.description || recommendation.message || recommendation.action || 'Optimization recommendation'}
                                                                        </span>
                                                                        {recommendation.priority && (
                                                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-green-100 text-green-800'
                                                                                }`}>
                                                                                {recommendation.priority} priority
                                                                            </span>
                                                                        )}
                                                                        {recommendation.savings && (
                                                                            <div className="text-xs text-green-600 mt-1">
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
                                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Close
                                    </button>
                                    {simulationResult && (
                                        <button
                                            onClick={runSimulation}
                                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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