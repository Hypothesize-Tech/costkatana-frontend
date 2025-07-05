import React from 'react';
import {
    FiStar,
    FiCopy,
    FiEdit3,
    FiTrash2,
    FiEye,
    FiUsers,
    FiClock,
    FiTag
} from 'react-icons/fi';
import { PromptTemplate } from '../../types/promptTemplate.types';

interface PromptTemplateCardProps {
    template: PromptTemplate;
    onView: (template: PromptTemplate) => void;
    onEdit: (template: PromptTemplate) => void;
    onDelete: (template: PromptTemplate) => void;
    onCopy: (template: PromptTemplate) => void;
    onFavorite: (template: PromptTemplate) => void;
}

export const PromptTemplateCard: React.FC<PromptTemplateCardProps> = ({
    template,
    onView,
    onEdit,
    onDelete,
    onCopy,
    onFavorite
}) => {
    const getCategoryColor = (category: string) => {
        const colors = {
            general: 'bg-gray-100 text-gray-800',
            coding: 'bg-blue-100 text-blue-800',
            writing: 'bg-green-100 text-green-800',
            analysis: 'bg-purple-100 text-purple-800',
            creative: 'bg-pink-100 text-pink-800',
            business: 'bg-yellow-100 text-yellow-800',
            custom: 'bg-indigo-100 text-indigo-800'
        };
        return colors[category as keyof typeof colors] || colors.general;
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return <FiUsers className="w-3 h-3" />;
            case 'project':
                return <FiTag className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {template.name}
                            </h3>
                            {template.isFavorite && (
                                <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {getVisibilityIcon(template.sharing.visibility) && (
                                <span className="text-gray-400">
                                    {getVisibilityIcon(template.sharing.visibility)}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {template.description || 'No description provided'}
                        </p>
                    </div>

                    <div className="flex gap-1 ml-4">
                        <button
                            onClick={() => onFavorite(template)}
                            className={`p-1.5 rounded transition-colors ${template.isFavorite
                                ? 'text-yellow-500 hover:bg-yellow-50'
                                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                }`}
                            title={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <FiStar className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={() => onCopy(template)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Copy template"
                        >
                            <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onView(template)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="View template"
                        >
                            <FiEye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onEdit(template)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Edit template"
                        >
                            <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(template)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete template"
                        >
                            <FiTrash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </span>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono">
                        {template.content}
                    </p>
                </div>

                {/* Variables */}
                {template.variables.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Variables ({template.variables.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 3).map((variable, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                                >
                                    {variable.name}
                                </span>
                            ))}
                            {template.variables.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    +{template.variables.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {template.metadata.tags.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {template.metadata.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {template.metadata.tags.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    +{template.metadata.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.usage.count}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uses
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.usage.averageRating ? template.usage.averageRating.toFixed(1) : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Rating
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            v{template.version}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Version
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FiClock className="w-3 h-3" />
                        <span>Created {formatDate(template.createdAt)}</span>
                    </div>
                    {template.metadata.estimatedTokens && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            ~{template.metadata.estimatedTokens} tokens
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 