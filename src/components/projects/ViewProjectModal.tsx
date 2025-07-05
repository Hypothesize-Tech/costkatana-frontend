import React, { useState } from 'react';
import {
    FiX,
    FiUsers,
    FiDollarSign,
    FiEdit3,
    FiSettings,
    FiTrendingUp,
    FiCalendar,
    FiTag,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiTarget,
    FiActivity,
    FiBarChart
} from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Project } from '../../types/project.types';

interface ViewProjectModalProps {
    project: Project;
    onClose: () => void;
    onEdit: (project: Project) => void;
    onManageMembers: (project: Project) => void;
}

export const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
    project,
    onClose,
    onEdit,
    onManageMembers
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'budget' | 'settings'>('overview');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getBudgetStatus = () => {
        const spent = project.budget?.spent || 0;
        const amount = project.budget?.amount || 0;
        const percentage = amount > 0 ? (spent / amount) * 100 : 0;

        if (percentage >= 90) return { status: 'danger', color: 'text-red-600', bgColor: 'bg-red-100' };
        if (percentage >= 75) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    };

    const budgetStatus = getBudgetStatus();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiBarChart },
        { id: 'members', label: 'Members', icon: FiUsers },
        { id: 'budget', label: 'Budget', icon: FiDollarSign },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    return (
        <Modal isOpen={true} onClose={onClose} title="" size="lg">
            <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                        <div className="flex gap-3 items-center mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 truncate dark:text-white">
                                {project.name}
                            </h2>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                {project.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {project.description && (
                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                {project.description}
                            </p>
                        )}

                        <div className="flex gap-6 items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex gap-1 items-center">
                                <FiUsers className="w-4 h-4" />
                                <span>{project.members?.length || 0} members</span>
                            </div>
                            <div className="flex gap-1 items-center">
                                <FiCalendar className="w-4 h-4" />
                                <span>Created {formatDate(project.createdAt)}</span>
                            </div>
                            <div className="flex gap-1 items-center">
                                <FiActivity className="w-4 h-4" />
                                <span>Updated {formatDate(project.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center ml-4">
                        <button
                            onClick={() => onManageMembers(project)}
                            className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Manage members"
                        >
                            <FiUsers className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onEdit(project)}
                            className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Edit project"
                        >
                            <FiEdit3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1">
                    {activeTab === 'overview' && (
                        <div className="p-6 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                                    <div className="flex gap-2 items-center text-blue-800 dark:text-blue-200">
                                        <FiDollarSign className="w-5 h-5" />
                                        <span className="text-sm font-medium">Total Budget</span>
                                    </div>
                                    <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {formatCurrency(project.budget?.amount || 0)}
                                    </p>
                                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                        {project.budget?.period || 'monthly'}
                                    </p>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                                    <div className="flex gap-2 items-center text-green-800 dark:text-green-200">
                                        <FiTrendingUp className="w-5 h-5" />
                                        <span className="text-sm font-medium">Spent</span>
                                    </div>
                                    <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
                                        {formatCurrency(project.budget?.spent || 0)}
                                    </p>
                                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                        {project.budget?.amount > 0
                                            ? `${Math.round(((project.budget?.spent || 0) / project.budget.amount) * 100)}% used`
                                            : '0% used'
                                        }
                                    </p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                                    <div className="flex gap-2 items-center text-purple-800 dark:text-purple-200">
                                        <FiTarget className="w-5 h-5" />
                                        <span className="text-sm font-medium">Remaining</span>
                                    </div>
                                    <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {formatCurrency((project.budget?.amount || 0) - (project.budget?.spent || 0))}
                                    </p>
                                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                        Available budget
                                    </p>
                                </div>
                            </div>

                            {/* Budget Status */}
                            <div className={`p-4 rounded-lg ${budgetStatus.bgColor} dark:bg-opacity-20`}>
                                <div className={`flex items-center gap-2 ${budgetStatus.color}`}>
                                    {budgetStatus.status === 'danger' && <FiAlertCircle className="w-5 h-5" />}
                                    {budgetStatus.status === 'warning' && <FiClock className="w-5 h-5" />}
                                    {budgetStatus.status === 'good' && <FiCheckCircle className="w-5 h-5" />}
                                    <span className="font-medium">
                                        {budgetStatus.status === 'danger' && 'Budget Alert'}
                                        {budgetStatus.status === 'warning' && 'Budget Warning'}
                                        {budgetStatus.status === 'good' && 'Budget Healthy'}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                    {budgetStatus.status === 'danger' && 'You have exceeded 90% of your budget. Consider reviewing your spending.'}
                                    {budgetStatus.status === 'warning' && 'You have used 75% of your budget. Monitor your spending carefully.'}
                                    {budgetStatus.status === 'good' && 'Your budget is on track. Keep monitoring your AI costs.'}
                                </p>
                            </div>

                            {/* Project Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Project Details
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2 items-center mb-2">
                                            <FiTag className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tags
                                            </span>
                                        </div>
                                        {project.tags && project.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {project.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No tags</p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2 items-center mb-2">
                                            <FiUsers className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Team Size
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {project.members?.length || 0}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Active members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Project Members
                                </h3>
                                <button
                                    onClick={() => onManageMembers(project)}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                                >
                                    Manage Members
                                </button>
                            </div>

                            {project.members && project.members.length > 0 ? (
                                <div className="space-y-3">
                                    {project.members.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="flex gap-3 items-center">
                                                <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/20">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {typeof member === 'string'
                                                            ? member.charAt(0).toUpperCase()
                                                            : member.userId?.charAt(0).toUpperCase() || 'U'
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {typeof member === 'string' ? member : member.userId}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {typeof member === 'string' ? 'Member' : member.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${(typeof member === 'string' ? 'member' : member.role) === 'admin'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                {typeof member === 'string' ? 'Member' : member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <FiUsers className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No members added to this project yet
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="p-6">
                            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                                Budget Management
                            </h3>

                            <div className="space-y-6">
                                {/* Budget Overview */}
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                        Budget Overview
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(project.budget?.amount || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount Spent</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(project.budget?.spent || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency((project.budget?.amount || 0) - (project.budget?.spent || 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Alerts */}
                                {project.budget?.alerts && project.budget.alerts.length > 0 && (
                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                            Budget Alerts
                                        </h4>
                                        <div className="space-y-3">
                                            {project.budget.alerts.map((alert, index) => (
                                                <div key={index} className="flex gap-3 items-center p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                                                    <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                            Alert at {alert.threshold}%
                                                        </p>
                                                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                            {alert.enabled ? 'Enabled' : 'Disabled'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Budget Progress */}
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                        Budget Progress
                                    </h4>
                                    <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                                        <div
                                            className={`h-3 rounded-full ${budgetStatus.status === 'danger' ? 'bg-red-500' :
                                                budgetStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(((project.budget?.spent || 0) / (project.budget?.amount || 1)) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {Math.round(((project.budget?.spent || 0) / (project.budget?.amount || 1)) * 100)}% of budget used
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="p-6">
                            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                                Project Settings
                            </h3>

                            <div className="space-y-6">
                                {/* Cost Optimization */}
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                        Cost Optimization
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Automatic optimization
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.settings?.costOptimization?.enabled
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                {project.settings?.costOptimization?.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Optimization level
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {project.settings?.costOptimization?.level || 'Medium'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                        Notifications
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Budget alerts
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.settings?.notifications?.budgetAlerts
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                {project.settings?.notifications?.budgetAlerts ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Usage reports
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.settings?.notifications?.usageReports
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                {project.settings?.notifications?.usageReports ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Status */}
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                                        Project Status
                                    </h4>
                                    <div className="flex gap-3 items-center">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${project.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                            {project.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {project.isActive ? 'Project is currently active' : 'Project is inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}; 