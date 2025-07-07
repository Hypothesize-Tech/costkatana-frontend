import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiStar,
    FiTag,
    FiUsers,
    FiArrowLeft
} from 'react-icons/fi';
import { PromptTemplateService } from '../services/promptTemplate.service';
import { PromptTemplate } from '../types/promptTemplate.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import {
    PromptTemplateCard,
    CreateTemplateModal,
    ViewTemplateModal,
    EditTemplateModal,
    DuplicateTemplateModal,
    TemplateDiscoveryHub,
    TemplateCreationWizard,
    TemplateMarketplace,
    TemplateTutorial,
    TemplateAnalyticsDashboard
} from '../components/templates';
import { useNotification } from '../contexts/NotificationContext';

const PromptTemplates: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // View states
    const [currentView, setCurrentView] = useState<'discovery' | 'list' | 'marketplace' | 'analytics' | 'tutorial'>('discovery');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateWizard, setShowCreateWizard] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'created' | 'usage'>('created');

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'coding', label: 'Coding' },
        { value: 'writing', label: 'Writing' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'creative', label: 'Creative' },
        { value: 'business', label: 'Business' },
        { value: 'custom', label: 'Custom' }
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await PromptTemplateService.getTemplates();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error loading templates:', error);
            setTemplates([]);
            showNotification(
                error.message || 'Failed to load templates',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (templateData: any) => {
        try {
            await PromptTemplateService.createTemplate(templateData);
            showNotification('Template created successfully!', 'success');
            loadTemplates(); // Refresh the list
        } catch (error: any) {
            console.error('Error creating template:', error);
            showNotification(
                error.message || 'Failed to create template',
                'error'
            );
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleEditTemplate = async (templateId: string, templateData: any) => {
        try {
            await PromptTemplateService.updateTemplate(templateId, templateData);
            showNotification('Template updated successfully!', 'success');
            loadTemplates(); // Refresh the list
        } catch (error: any) {
            console.error('Error updating template:', error);
            showNotification(
                error.message || 'Failed to update template',
                'error'
            );
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleDuplicateTemplate = async (templateData: any) => {
        try {
            await PromptTemplateService.createTemplate(templateData);
            showNotification('Template duplicated successfully!', 'success');
            loadTemplates(); // Refresh the list
        } catch (error: any) {
            console.error('Error duplicating template:', error);
            showNotification(
                error.message || 'Failed to duplicate template',
                'error'
            );
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleViewTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setShowViewModal(true);
    };

    const handleEditTemplateModal = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setShowEditModal(true);
    };

    const handleCopyTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setShowDuplicateModal(true);
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            await PromptTemplateService.deleteTemplate(selectedTemplate._id);
            showNotification('Template deleted successfully!', 'success');
            loadTemplates(); // Refresh the list
            setDeleteConfirmOpen(false);
            setSelectedTemplate(null);
        } catch (error: any) {
            console.error('Error deleting template:', error);
            showNotification(
                error.message || 'Failed to delete template',
                'error'
            );
        }
    };

    const handleFavoriteTemplate = async (template: PromptTemplate) => {
        try {
            const updatedTemplate = { ...template, isFavorite: !template.isFavorite };
            setTemplates(templates.map(t =>
                t._id === template._id ? updatedTemplate : t
            ));

            showNotification(
                template.isFavorite ? 'Removed from favorites' : 'Added to favorites',
                'success'
            );
        } catch (error: any) {
            console.error('Error updating favorite:', error);
            showNotification(
                error.message || 'Failed to update favorite',
                'error'
            );
        }
    };

    // New handlers for discovery hub and wizard
    const handleCreateTemplateFromHub = () => {
        setShowCreateWizard(true);
    };

    const handleViewTemplates = () => {
        setCurrentView('list');
    };

    const handleStartTutorial = () => {
        setShowTutorial(true);
    };

    const handleBackToDiscovery = () => {
        setCurrentView('discovery');
    };

    const handleUseTemplates = () => {
        navigate('/templates/use');
    };

    const handleImportMarketplaceTemplate = async (templateData: any) => {
        try {
            await handleCreateTemplate(templateData);
            showNotification('Template imported successfully!', 'success');
        } catch (error: any) {
            console.error('Error importing template:', error);
            showNotification(
                error.message || 'Failed to import template',
                'error'
            );
        }
    };

    const handlePreviewMarketplaceTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setShowViewModal(true);
    };

    // Filter and sort templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchQuery ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.metadata.tags?.some(tag =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesCategory = selectedCategory === 'all' ||
            template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'usage':
                return (b.usage?.count || 0) - (a.usage?.count || 0);
            case 'created':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Render Discovery Hub by default
    if (currentView === 'discovery') {
        return (
            <div>
                <TemplateDiscoveryHub
                    onCreateTemplate={handleCreateTemplateFromHub}
                    onStartTutorial={handleStartTutorial}
                    onViewTemplates={handleViewTemplates}
                    onUseTemplates={handleUseTemplates}
                />

                {/* Modals */}
                {showCreateWizard && (
                    <TemplateCreationWizard
                        onClose={() => setShowCreateWizard(false)}
                        onSubmit={handleCreateTemplate}
                    />
                )}

                {showTutorial && (
                    <TemplateTutorial
                        onClose={() => setShowTutorial(false)}
                        onCreateTemplate={() => {
                            setShowTutorial(false);
                            setShowCreateWizard(true);
                        }}
                        onViewMarketplace={() => {
                            setShowTutorial(false);
                            setCurrentView('marketplace');
                        }}
                    />
                )}
            </div>
        );
    }

    // Render Marketplace view
    if (currentView === 'marketplace') {
        return (
            <div>
                {/* Back to Discovery Button */}
                <div className="p-6 pb-0">
                    <button
                        onClick={handleBackToDiscovery}
                        className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg transition-colors hover:text-blue-700 hover:bg-blue-50"
                    >
                        <FiArrowLeft />
                        Back to Template Hub
                    </button>
                </div>

                <TemplateMarketplace
                    onImportTemplate={handleImportMarketplaceTemplate}
                    onPreviewTemplate={handlePreviewMarketplaceTemplate}
                />

                {/* Modals */}
                {showViewModal && selectedTemplate && (
                    <ViewTemplateModal
                        template={selectedTemplate}
                        onClose={() => {
                            setShowViewModal(false);
                            setSelectedTemplate(null);
                        }}
                        onEdit={(template) => {
                            setShowViewModal(false);
                            setSelectedTemplate(template);
                            setShowEditModal(true);
                        }}
                        onDuplicate={(template) => {
                            setShowViewModal(false);
                            setSelectedTemplate(template);
                            setShowDuplicateModal(true);
                        }}
                        onFavorite={handleFavoriteTemplate}
                    />
                )}

                {showTutorial && (
                    <TemplateTutorial
                        onClose={() => setShowTutorial(false)}
                        onCreateTemplate={() => {
                            setShowTutorial(false);
                            setShowCreateWizard(true);
                        }}
                        onViewMarketplace={() => {
                            setShowTutorial(false);
                            setCurrentView('marketplace');
                        }}
                    />
                )}
            </div>
        );
    }

    // Render Analytics view
    if (currentView === 'analytics') {
        return (
            <div>
                {/* Back to Discovery Button */}
                <div className="p-6 pb-0">
                    <button
                        onClick={handleBackToDiscovery}
                        className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg transition-colors hover:text-blue-700 hover:bg-blue-50"
                    >
                        <FiArrowLeft />
                        Back to Template Hub
                    </button>
                </div>

                <TemplateAnalyticsDashboard
                    onViewTemplate={handleViewTemplate}
                />
            </div>
        );
    }

    // Render traditional list view
    return (
        <div className="p-6">
            {/* Back to Discovery Button */}
            <div className="mb-4">
                <button
                    onClick={handleBackToDiscovery}
                    className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg transition-colors hover:text-blue-700 hover:bg-blue-50"
                >
                    <FiArrowLeft />
                    Back to Template Hub
                </button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Prompt Templates
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Create and manage reusable prompt templates
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateWizard(true)}
                    className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    <FiPlus />
                    New Template
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    {categories.map(category => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="created">Recently Created</option>
                    <option value="name">Name</option>
                    <option value="usage">Most Used</option>
                </select>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiTag className="mr-2 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Templates</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {templates.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiStar className="mr-2 text-yellow-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {templates.filter(t => t.isFavorite).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiUsers className="mr-2 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Shared</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {templates.filter(t => t.sharing.visibility !== 'private').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiFilter className="mr-2 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {new Set(templates.map(t => t.category)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            {sortedTemplates.length === 0 ? (
                <div className="py-12 text-center">
                    <FiTag className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        {searchQuery || selectedCategory !== 'all' ? 'No templates found' : 'No templates yet'}
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Get started by creating your first template'
                        }
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                        <button
                            onClick={() => setShowCreateWizard(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <FiPlus className="mr-2" />
                            Create Template
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedTemplates.map(template => (
                        <PromptTemplateCard
                            key={template._id}
                            template={template}
                            onView={handleViewTemplate}
                            onEdit={handleEditTemplateModal}
                            onDelete={(template) => {
                                setSelectedTemplate(template);
                                setDeleteConfirmOpen(true);
                            }}
                            onCopy={handleCopyTemplate}
                            onFavorite={handleFavoriteTemplate}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateTemplate}
                />
            )}

            {showCreateWizard && (
                <TemplateCreationWizard
                    onClose={() => setShowCreateWizard(false)}
                    onSubmit={handleCreateTemplate}
                />
            )}

            {showViewModal && selectedTemplate && (
                <ViewTemplateModal
                    template={selectedTemplate}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedTemplate(null);
                    }}
                    onEdit={(template) => {
                        setShowViewModal(false);
                        setSelectedTemplate(template);
                        setShowEditModal(true);
                    }}
                    onDuplicate={(template) => {
                        setShowViewModal(false);
                        setSelectedTemplate(template);
                        setShowDuplicateModal(true);
                    }}
                    onFavorite={handleFavoriteTemplate}
                />
            )}

            {showEditModal && selectedTemplate && (
                <EditTemplateModal
                    template={selectedTemplate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTemplate(null);
                    }}
                    onSubmit={handleEditTemplate}
                />
            )}

            {showDuplicateModal && selectedTemplate && (
                <DuplicateTemplateModal
                    template={selectedTemplate}
                    onClose={() => {
                        setShowDuplicateModal(false);
                        setSelectedTemplate(null);
                    }}
                    onSubmit={handleDuplicateTemplate}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen && selectedTemplate && (
                <Modal
                    isOpen={deleteConfirmOpen}
                    onClose={() => {
                        setDeleteConfirmOpen(false);
                        setSelectedTemplate(null);
                    }}
                    title="Delete Template"
                >
                    <div className="p-6">
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete "{selectedTemplate.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setSelectedTemplate(null);
                                }}
                                className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTemplate}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showTutorial && (
                <TemplateTutorial
                    onClose={() => setShowTutorial(false)}
                    onCreateTemplate={() => {
                        setShowTutorial(false);
                        setShowCreateWizard(true);
                    }}
                    onViewMarketplace={() => {
                        setShowTutorial(false);
                        setCurrentView('marketplace');
                    }}
                />
            )}
        </div>
    );
};

export default PromptTemplates; 