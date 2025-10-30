import React, { useState, useEffect } from 'react';
import {
    CheckIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    SparklesIcon,
    CurrencyDollarIcon,
    ChatBubbleLeftRightIcon,
    BuildingStorefrontIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { OnboardingService } from '../services/onboarding.service';
import { ProjectService } from '../services/project.service';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    completed: boolean;
}

interface ProjectFormData {
    name: string;
    description: string;
    budget: {
        amount: number;
        period: 'monthly' | 'yearly';
        alerts: {
            enabled: boolean;
            thresholds: number[];
        };
    };
}

interface LlmQueryFormData {
    query: string;
    model: string;
}

interface OnboardingProps {
    onComplete?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [projectData, setProjectData] = useState<ProjectFormData>({
        name: '',
        description: '',
        budget: {
            amount: 100,
            period: 'monthly',
            alerts: {
                enabled: true,
                thresholds: [50, 80, 90]
            }
        },
    });

    const [llmQueryData, setLlmQueryData] = useState<LlmQueryFormData>({
        query: '',
        model: 'gpt-3.5-turbo',
    });

    const [llmResponse, setLlmResponse] = useState<string>('');

    // Available LLM models
    const availableModels = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
        { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    ];

    // Onboarding steps
    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to Cost Katana',
            description: 'Let\'s set up your AI cost tracking in just a few simple steps',
            icon: <SparklesIcon className="w-8 h-8" />,
            completed: false,
        },
        {
            id: 'project_creation',
            title: 'Create Your First Project',
            description: 'Set up a project to organize and track your AI usage costs',
            icon: <BuildingStorefrontIcon className="w-8 h-8" />,
            completed: false,
        },
        {
            id: 'project_pricing',
            title: 'Configure Budget & Pricing',
            description: 'Set spending limits and pricing preferences for your project',
            icon: <CurrencyDollarIcon className="w-8 h-8" />,
            completed: false,
        },
        {
            id: 'llm_query',
            title: 'Test Your First AI Query',
            description: 'Make a real AI call to see how cost tracking works in action',
            icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
            completed: false,
        },
        {
            id: 'completion',
            title: 'You\'re All Set!',
            description: 'Your AI cost tracking is now active and ready to use',
            icon: <RocketLaunchIcon className="w-8 h-8" />,
            completed: false,
        },
    ];

    // Initialize onboarding based on user data - no need for API calls
    useEffect(() => {
        if (user?.onboarding) {
            // Ensure onboarding field has proper structure
            if (!user.onboarding.stepsCompleted) {
                user.onboarding.stepsCompleted = [];
            }

            // Check if user has already completed some steps
            const completedSteps = user.onboarding.stepsCompleted || [];
            steps.forEach(step => {
                step.completed = completedSteps.includes(step.id);
            });

            // Set current step based on completed steps
            const lastCompletedIndex = steps.findIndex(step => !step.completed);
            setCurrentStep(lastCompletedIndex === -1 ? steps.length - 1 : lastCompletedIndex);
            setLoading(false);
        } else {
            // User doesn't have onboarding data, start from beginning
            setCurrentStep(0);
            setLoading(false);
        }
    }, [user?.onboarding]);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleProjectSubmit = async () => {
        if (!projectData.name.trim()) {
            showNotification('Project name is required', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await ProjectService.createProject({
                name: projectData.name,
                description: projectData.description,
                budget: projectData.budget,
                members: [],
                tags: [],
                settings: {
                    costOptimization: {
                        enabled: true,
                        autoApply: false,
                        strategies: []
                    },
                    notifications: {
                        budgetAlerts: true,
                        monthlyReports: true
                    }
                }
            });

            // Complete project creation step
            await OnboardingService.completeStep('project_creation');

            showNotification('Project created successfully!', 'success');
            handleNext();
        } catch (error) {
            console.error('Error creating project:', error);
            showNotification('Failed to create project', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLlmQuerySubmit = async () => {
        if (!llmQueryData.query.trim()) {
            showNotification('Please enter a query', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const response = await OnboardingService.executeLlmQuery({
                query: llmQueryData.query,
                model: llmQueryData.model,
                projectId: 'current', // This would be the project created in previous step
                userId: user?.id || '',
            });

            setLlmResponse(response.content);

            // Complete LLM query step
            await OnboardingService.completeStep('llm_query');

            showNotification('AI query executed successfully!', 'success');
            handleNext();
        } catch (error) {
            console.error('Error executing LLM query:', error);
            showNotification('Failed to execute AI query', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteOnboarding = async () => {
        try {
            setSubmitting(true);
            await OnboardingService.completeOnboarding();

            // Update user in localStorage immediately to prevent race conditions
            if (user) {
                const updatedUser = {
                    ...user,
                    onboarding: {
                        ...user.onboarding,
                        completed: true,
                        completedAt: new Date().toISOString()
                    }
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            showNotification('Welcome to Cost Katana! 🎉', 'success');

            // Call the completion callback
            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            console.error('Error completing onboarding:', error);
            showNotification('Failed to complete onboarding', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkipOnboarding = async () => {
        try {
            setSubmitting(true);
            await OnboardingService.skipOnboarding();

            if (user) {
                const updatedUser = {
                    ...user,
                    onboarding: {
                        ...user.onboarding,
                        skipped: true,
                        skippedAt: new Date().toISOString()
                    }
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            showNotification('Onboarding skipped. You can access it later from settings.', 'info');

            // Call the completion callback
            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            console.error('Error skipping onboarding:', error);
            showNotification('Failed to skip onboarding', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-medium text-secondary-600 dark:text-secondary-300">
                        Loading onboarding...
                    </p>
                </div>
            </div>
        );
    }

    const currentStepData = steps[currentStep];

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header with Logo and Progress */}
            <div className="relative z-10 p-8 border-b border-primary-200/30 dark:border-primary-800/30">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg glow-primary">
                                <SparklesIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text-primary">Cost Katana</h1>
                                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                    AI Cost Intelligence Setup
                                </p>
                            </div>
                        </div>

                        {/* Progress Steps - More Compact */}
                        <div className="hidden md:flex items-center space-x-1 bg-white/50 dark:bg-secondary-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-secondary-200/50 dark:border-secondary-700/50">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${index === currentStep
                                        ? 'bg-gradient-primary text-white shadow-md scale-110'
                                        : index < currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-secondary-300 dark:bg-secondary-600 text-secondary-600 dark:text-secondary-300'
                                        }`}>
                                        {step.completed ? (
                                            <CheckIcon className="w-3 h-3" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-6 h-0.5 mx-1 transition-colors duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-secondary-300 dark:bg-secondary-600'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 p-8">
                <div className="max-w-6xl mx-auto h-full flex flex-col">
                    {/* Content Container - 80% width */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-full max-w-4xl">
                            <div className="bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-secondary-200/50 dark:border-secondary-700/50 overflow-hidden">
                                {/* Step Header */}
                                <div className="bg-gradient-to-r from-primary-50/80 to-secondary-50/80 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-secondary-200/50 dark:border-secondary-700/50 p-6 lg:p-8">
                                    <div className="flex items-center space-x-4 lg:space-x-6">
                                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg lg:shadow-xl">
                                            {currentStepData.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
                                                Step {currentStep + 1} of {steps.length}
                                            </div>
                                            <h2 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white mb-1 truncate">
                                                {currentStepData.title}
                                            </h2>
                                            <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed text-sm lg:text-base">
                                                {currentStepData.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 lg:p-8">
                                    <div className="max-w-3xl mx-auto">
                                        {/* Step 0: Welcome */}
                                        {currentStep === 0 && (
                                            <div className="text-center space-y-6 lg:space-y-8">
                                                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                                    <SparklesIcon className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                                                </div>
                                                <div className="space-y-4 lg:space-y-6">
                                                    <h3 className="text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white leading-tight">
                                                        Welcome to Cost Katana! 🚀
                                                    </h3>
                                                    <p className="text-base lg:text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed max-w-xl mx-auto">
                                                        We're excited to help you take control of your AI costs. In just a few minutes,
                                                        you'll have everything set up to track, analyze, and optimize your AI spending.
                                                    </p>
                                                </div>
                                                <div className="bg-gradient-to-br from-primary-50/80 to-secondary-50/80 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 lg:p-8 border border-primary-200/50 dark:border-primary-700/50">
                                                    <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-4 lg:mb-6 text-base lg:text-lg">
                                                        🚀 What you'll accomplish:
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                        <div className="flex items-start space-x-2 lg:space-x-3">
                                                            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100 text-sm lg:text-base">Create Your First Project</div>
                                                                <div className="text-xs lg:text-sm text-primary-700 dark:text-primary-300">Organize and track AI usage costs</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-2 lg:space-x-3">
                                                            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100 text-sm lg:text-base">Set Budget Limits</div>
                                                                <div className="text-xs lg:text-sm text-primary-700 dark:text-primary-300">Control spending with smart alerts</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-2 lg:space-x-3">
                                                            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100 text-sm lg:text-base">Make Your First AI Call</div>
                                                                <div className="text-xs lg:text-sm text-primary-700 dark:text-primary-300">Experience real-time cost tracking</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-2 lg:space-x-3">
                                                            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100 text-sm lg:text-base">View Live Analytics</div>
                                                                <div className="text-xs lg:text-sm text-primary-700 dark:text-primary-300">See costs in real-time dashboard</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1: Project Creation */}
                                        {currentStep === 1 && (
                                            <div className="space-y-6 lg:space-y-8">
                                                <div className="text-center mb-6 lg:mb-8">
                                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-xl">
                                                        <BuildingStorefrontIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                                    </div>
                                                    <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white mb-1 lg:mb-2">Create Your First Project</h3>
                                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm lg:text-base">Set up a project to organize and track your AI usage costs</p>
                                                </div>

                                                <div className="space-y-4 lg:space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2 lg:mb-3">
                                                            Project Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={projectData.name}
                                                            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                                            placeholder="e.g., Marketing Analytics, Customer Support, etc."
                                                            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 transition-all duration-300 text-sm lg:text-base"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2 lg:mb-3">
                                                            Description (Optional)
                                                        </label>
                                                        <textarea
                                                            value={projectData.description}
                                                            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                                            placeholder="Brief description of what this project will be used for..."
                                                            rows={3}
                                                            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 transition-all duration-300 resize-none text-sm lg:text-base"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Project Pricing */}
                                        {currentStep === 2 && (
                                            <div className="space-y-8">
                                                <div className="text-center mb-8">
                                                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                                        <CurrencyDollarIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Configure Budget & Pricing</h3>
                                                    <p className="text-secondary-600 dark:text-secondary-300">Set spending limits to keep your AI costs under control</p>
                                                </div>

                                                <div className="bg-gradient-to-br from-primary-50/80 to-secondary-50/80 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200/50 dark:border-primary-700/50 mb-8">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <CheckIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">💡 Smart Budget Management</h4>
                                                            <p className="text-sm text-primary-800 dark:text-primary-200">
                                                                Set spending limits to keep your AI costs under control. You can always adjust these later, and we'll send alerts when you approach limits.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                                                            Monthly Budget ($)
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500 dark:text-secondary-400">
                                                                $
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={projectData.budget.amount}
                                                                onChange={(e) => setProjectData({
                                                                    ...projectData,
                                                                    budget: { ...projectData.budget, amount: parseInt(e.target.value) || 0 }
                                                                })}
                                                                placeholder="100"
                                                                className="w-full pl-8 pr-4 py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 transition-all duration-300"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">We'll alert you at 50%, 80%, and 90% of this budget</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                                                            Budget Period
                                                        </label>
                                                        <select
                                                            value={projectData.budget.period}
                                                            onChange={(e) => setProjectData({
                                                                ...projectData,
                                                                budget: { ...projectData.budget, period: e.target.value as 'monthly' | 'yearly' }
                                                            })}
                                                            className="w-full px-4 py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white transition-all duration-300"
                                                        >
                                                            <option value="monthly">Monthly</option>
                                                            <option value="yearly">Yearly</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: LLM Query */}
                                        {currentStep === 3 && (
                                            <div className="space-y-8">
                                                <div className="text-center mb-8">
                                                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Test Your First AI Query</h3>
                                                    <p className="text-secondary-600 dark:text-secondary-300">Make a real AI call to see how cost tracking works in action</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                                                            Choose AI Model
                                                        </label>
                                                        <select
                                                            value={llmQueryData.model}
                                                            onChange={(e) => setLlmQueryData({ ...llmQueryData, model: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white transition-all duration-300"
                                                        >
                                                            {availableModels.map((model) => (
                                                                <option key={model.id} value={model.id}>
                                                                    {model.name} ({model.provider})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                                                            Your Query
                                                        </label>
                                                        <textarea
                                                            value={llmQueryData.query}
                                                            onChange={(e) => setLlmQueryData({ ...llmQueryData, query: e.target.value })}
                                                            placeholder="Ask me anything! This will be your first tracked AI query..."
                                                            rows={4}
                                                            className="w-full px-4 py-3 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 transition-all duration-300 resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                {llmResponse && (
                                                    <div className="bg-gradient-to-br from-primary-50/80 to-secondary-50/80 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200/50 dark:border-primary-700/50">
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h4 className="font-semibold text-primary-900 dark:text-primary-100">
                                                                🤖 AI Response
                                                            </h4>
                                                        </div>
                                                        <div className="text-secondary-800 dark:text-secondary-200 bg-white/50 dark:bg-secondary-800/50 rounded-xl p-6 border border-primary-200/30 dark:border-primary-600/30 leading-relaxed">
                                                            {llmResponse}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 4: Completion */}
                                        {currentStep === 4 && (
                                            <div className="text-center space-y-8">
                                                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                                    <RocketLaunchIcon className="w-12 h-12 text-white" />
                                                </div>
                                                <div className="space-y-6">
                                                    <h3 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white leading-tight">
                                                        You're All Set! 🎉
                                                    </h3>
                                                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed max-w-2xl mx-auto">
                                                        Your Cost Katana setup is complete! You can now track, analyze, and optimize your AI costs with confidence.
                                                    </p>
                                                </div>
                                                <div className="bg-gradient-to-br from-primary-50/80 to-secondary-50/80 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 border border-primary-200/50 dark:border-primary-700/50 max-w-2xl mx-auto">
                                                    <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-6 text-lg">
                                                        What's next?
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100">Explore Dashboard</div>
                                                                <div className="text-sm text-primary-700 dark:text-primary-300">View real-time cost analytics</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100">Set Up Alerts</div>
                                                                <div className="text-sm text-primary-700 dark:text-primary-300">Get notified about budget limits</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100">Optimize Costs</div>
                                                                <div className="text-sm text-primary-700 dark:text-primary-300">Get AI-powered recommendations</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-primary-900 dark:text-primary-100">Create More Projects</div>
                                                                <div className="text-sm text-primary-700 dark:text-primary-300">Scale across multiple use cases</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Navigation - Separate Row */}
            <div className="bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-t border-secondary-200/50 dark:border-secondary-700/50 p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`flex items-center px-6 lg:px-8 py-3 lg:py-4 font-semibold rounded-xl lg:rounded-2xl transition-all duration-300 ${currentStep === 0
                                ? 'opacity-50 cursor-not-allowed text-secondary-400 dark:text-secondary-500 bg-secondary-100 dark:bg-secondary-800'
                                : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 border border-secondary-200 dark:border-secondary-600 hover:border-primary-300 dark:hover:border-primary-600'
                                }`}
                        >
                            <ArrowLeftIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                            Previous
                        </button>

                        <div className="flex items-center space-x-2 lg:space-x-3">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${index === currentStep
                                        ? 'bg-gradient-primary w-8 lg:w-12'
                                        : index < currentStep
                                            ? 'bg-green-500'
                                            : 'bg-secondary-300 dark:bg-secondary-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center space-x-3">
                            {currentStep !== steps.length - 1 && (
                                <button
                                    onClick={handleSkipOnboarding}
                                    disabled={submitting}
                                    className="flex items-center px-4 lg:px-6 py-2 lg:py-3 font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg lg:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Skip Setup
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    if (currentStep === 0) {
                                        handleNext();
                                    } else if (currentStep === 1) {
                                        handleProjectSubmit();
                                    } else if (currentStep === 2) {
                                        handleNext(); // Skip to LLM query
                                    } else if (currentStep === 3) {
                                        handleLlmQuerySubmit();
                                    } else if (currentStep === 4) {
                                        handleCompleteOnboarding();
                                    }
                                }}
                                disabled={submitting}
                                className="flex items-center px-8 lg:px-10 py-3 lg:py-4 font-semibold text-white bg-gradient-primary rounded-xl lg:rounded-2xl hover:bg-gradient-success transition-all duration-300 shadow-lg lg:shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 lg:mr-3" />
                                        Processing...
                                    </>
                                ) : currentStep === steps.length - 1 ? (
                                    <>
                                        <RocketLaunchIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                                        Get Started
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRightIcon className="w-4 h-4 lg:w-5 lg:h-5 ml-2 lg:ml-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
