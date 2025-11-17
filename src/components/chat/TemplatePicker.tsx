/**
 * TemplatePicker Component
 * 
 * Modal component for browsing, searching, and selecting prompt templates
 * with support for categories, favorites, and recent templates
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Search,
    Star,
    Clock,
    TrendingUp,
    Sparkles,
    Code,
    FileText,
    BarChart,
    Lightbulb,
    Briefcase,
    ChevronRight
} from 'lucide-react';
import { PromptTemplate } from '@/types/promptTemplate.types';
import { useTemplateStore } from '@/stores/templateStore';

interface TemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: PromptTemplate) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
    general: <Sparkles className="w-4 h-4" />,
    coding: <Code className="w-4 h-4" />,
    writing: <FileText className="w-4 h-4" />,
    analysis: <BarChart className="w-4 h-4" />,
    creative: <Lightbulb className="w-4 h-4" />,
    business: <Briefcase className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
    general: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    coding: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    writing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    analysis: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    creative: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    business: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
    isOpen,
    onClose,
    onSelectTemplate
}) => {
    const {
        templates,
        popularTemplates,
        recentTemplates,
        isLoading,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
        fetchTemplates,
        fetchPopularTemplates
    } = useTemplateStore();

    const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'recent'>('all');

    // Load templates on mount
    useEffect(() => {
        if (isOpen && templates.length === 0) {
            fetchTemplates();
            fetchPopularTemplates();
        }
    }, [isOpen, templates.length, fetchTemplates, fetchPopularTemplates]);

    // Filter templates based on search and category
    const filteredTemplates = useMemo(() => {
        let filtered = activeTab === 'popular'
            ? popularTemplates
            : activeTab === 'recent'
                ? recentTemplates
                : templates;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.metadata.tags.some((tag) =>
                        tag.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter((t) => t.category === selectedCategory);
        }

        return filtered;
    }, [templates, popularTemplates, recentTemplates, searchQuery, selectedCategory, activeTab]);

    const handleSelectTemplate = (template: PromptTemplate) => {
        onSelectTemplate(template);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-5xl max-h-[90vh] m-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-secondary-200 dark:border-secondary-700 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                Prompt Templates
                            </h2>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Choose a template to get started quickly
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-300"
                    >
                        <X className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                    </button>
                </div>

                {/* Search and Tabs */}
                <div className="p-6 space-y-4 border-b border-secondary-200 dark:border-secondary-700">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-light-panel dark:bg-dark-bg-300 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted transition-all duration-300"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === 'all'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-100 dark:hover:bg-secondary-800'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            All Templates
                        </button>
                        <button
                            onClick={() => setActiveTab('popular')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === 'popular'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-100 dark:hover:bg-secondary-800'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Popular
                        </button>
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === 'recent'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-100 dark:hover:bg-secondary-800'
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                            Recent
                        </button>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${!selectedCategory
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-200 dark:hover:bg-secondary-700'
                                }`}
                        >
                            All Categories
                        </button>
                        {Object.entries(categoryIcons).map(([category, icon]) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${selectedCategory === category
                                    ? categoryColors[category]
                                    : 'bg-secondary-100 dark:bg-secondary-800 text-light-text-secondary dark:text-dark-text-secondary hover:bg-secondary-200 dark:hover:bg-secondary-700'
                                    }`}
                            >
                                {icon}
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Sparkles className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mb-4" />
                            <p className="text-lg font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                No templates found
                            </p>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template._id}
                                    onClick={() => handleSelectTemplate(template)}
                                    className="group p-4 bg-light-panel dark:bg-dark-bg-300 hover:bg-light-card dark:hover:bg-dark-card border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 rounded-xl transition-all duration-300 text-left shadow-sm hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${categoryColors[template.category]}`}>
                                                {categoryIcons[template.category]}
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryColors[template.category]}`}>
                                                {template.category}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted group-hover:text-primary-500 transition-all duration-300" />
                                    </div>

                                    <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300">
                                        {template.name}
                                    </h3>

                                    {template.description && (
                                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3 line-clamp-2">
                                            {template.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-light-text-muted dark:text-dark-text-muted">
                                            {template.variables.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    {template.variables.length} variables
                                                </span>
                                            )}
                                            {template.usage.count > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {template.usage.count} uses
                                                </span>
                                            )}
                                            {template.usage.averageRating && (
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    {template.usage.averageRating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>

                                        {template.isFavorite && (
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        )}
                                    </div>

                                    {template.metadata.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {template.metadata.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 bg-secondary-200 dark:bg-secondary-700 text-light-text-secondary dark:text-dark-text-secondary rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 bg-light-panel dark:bg-dark-bg-300">
                    <p className="text-sm font-body text-light-text-muted dark:text-dark-text-muted text-center">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TemplatePicker;


