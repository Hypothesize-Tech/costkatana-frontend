import React from 'react';
import { CurrencyDollarIcon, ChartBarIcon, HashtagIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { UserSpendingSummary } from '../../services/adminUserSpending.service';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface UserSpendingModalProps {
    user: UserSpendingSummary | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserSpendingModal: React.FC<UserSpendingModalProps> = ({
    user,
    isOpen,
    onClose,
}) => {
    if (!user) return null;

    // Group features by category
    const featureGroups = {
        'Chat': user.features.filter(f => f.feature === 'Chat'),
        'Experimentation': user.features.filter(f => f.feature === 'Experimentation'),
        'Gateway': user.features.filter(f => f.feature === 'Gateway'),
        'Integration': user.features.filter(f => f.feature === 'Integration'),
        'Workflow': user.features.filter(f => f.feature === 'Workflow'),
        'Optimization': user.features.filter(f => f.feature === 'Optimization'),
        'Analytics': user.features.filter(f => f.feature === 'Analytics'),
        'Notebook': user.features.filter(f => f.feature === 'Notebook'),
        'Template': user.features.filter(f => f.feature === 'Template'),
        'Intelligence': user.features.filter(f => f.feature === 'Intelligence'),
        'Other': user.features.filter(f => f.feature === 'Other'),
    };

    const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        'Chat': ChartBarIcon,
        'Experimentation': ArrowTrendingUpIcon,
        'Gateway': ChartBarIcon,
        'Integration': ChartBarIcon,
        'Workflow': ChartBarIcon,
        'Optimization': ChartBarIcon,
        'Analytics': ChartBarIcon,
        'Notebook': ChartBarIcon,
        'Template': ChartBarIcon,
        'Intelligence': ChartBarIcon,
        'Other': ChartBarIcon,
    };

    const modalFooter = (
        <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-light-text-primary dark:text-dark-text-primary"
        >
            Close
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="User Spending Details"
            maxWidth="4xl"
            showCloseButton={true}
            closeOnBackdropClick={true}
            footer={modalFooter}
        >
            <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-primary-200/30">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl glow-primary shadow-lg">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {user.userName} ({user.userEmail})
                        </p>
                    </div>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex items-center gap-3 mb-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                Total Cost
                            </span>
                        </div>
                        <p className="text-xl font-display font-bold gradient-text-primary">
                            {formatCurrency(user.totalCost)}
                        </p>
                    </div>
                    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex items-center gap-3 mb-2">
                            <HashtagIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                Total Tokens
                            </span>
                        </div>
                        <p className="text-xl font-display font-bold gradient-text-primary">
                            {formatNumber(user.totalTokens)}
                        </p>
                    </div>
                    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex items-center gap-3 mb-2">
                            <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                Total Requests
                            </span>
                        </div>
                        <p className="text-xl font-display font-bold gradient-text-primary">
                            {formatNumber(user.totalRequests)}
                        </p>
                    </div>
                    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="flex items-center gap-3 mb-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                Avg Cost/Req
                            </span>
                        </div>
                        <p className="text-xl font-display font-bold gradient-text-primary">
                            {formatCurrency(user.averageCostPerRequest)}
                        </p>
                    </div>
                </div>

                {/* Feature Breakdown */}
                <div>
                    <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
                        Spending by Feature
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(featureGroups)
                            .filter(([_, features]) => features.length > 0)
                            .map(([featureName, features]) => {
                                const totalCost = features.reduce((sum, f) => sum + f.cost, 0);
                                const totalTokens = features.reduce((sum, f) => sum + f.tokens, 0);
                                const totalRequests = features.reduce((sum, f) => sum + f.requests, 0);
                                const IconComponent = featureIcons[featureName] || ChartBarIcon;

                                return (
                                    <div
                                        key={featureName}
                                        className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2 rounded-lg">
                                                <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h4 className="text-base font-display font-bold gradient-text-primary">
                                                {featureName}
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Cost:
                                                </span>
                                                <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                    {formatCurrency(totalCost)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Tokens:
                                                </span>
                                                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {formatNumber(totalTokens)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                    Requests:
                                                </span>
                                                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {formatNumber(totalRequests)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Services Breakdown */}
                {user.services.length > 0 && (
                    <div>
                        <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
                            Spending by Service
                        </h3>
                        <div className="space-y-2">
                            {user.services.slice(0, 10).map((service) => (
                                <div
                                    key={service.service}
                                    className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                >
                                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                        {service.service}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            {formatNumber(service.requests)} requests
                                        </span>
                                        <span className="text-sm font-display font-bold gradient-text-primary">
                                            {formatCurrency(service.cost)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Models Breakdown */}
                {user.models.length > 0 && (
                    <div>
                        <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
                            Spending by Model
                        </h3>
                        <div className="space-y-2">
                            {user.models.slice(0, 10).map((model) => (
                                <div
                                    key={model.model}
                                    className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                >
                                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-[200px]">
                                        {model.model}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            {formatNumber(model.requests)} requests
                                        </span>
                                        <span className="text-sm font-display font-bold gradient-text-primary">
                                            {formatCurrency(model.cost)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects Breakdown */}
                {user.projects.length > 0 && (
                    <div>
                        <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">
                            Spending by Project
                        </h3>
                        <div className="space-y-2">
                            {user.projects.slice(0, 10).map((project) => (
                                <div
                                    key={project.projectId}
                                    className="flex items-center justify-between p-3 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-sm bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
                                >
                                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-[200px]">
                                        {project.projectName || project.projectId}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            {formatNumber(project.requests)} requests
                                        </span>
                                        <span className="text-sm font-display font-bold gradient-text-primary">
                                            {formatCurrency(project.cost)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
