import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiBookOpen,
  FiPlay,
  FiBarChart2,
} from "react-icons/fi";
import { PromptTemplateService } from "../services/promptTemplate.service";
import { PromptTemplate } from "../types/promptTemplate.types";
import { PromptTemplatesShimmer } from "../components/shimmer/PromptTemplatesShimmer";
import { Modal } from "../components/common/Modal";
import {
  PromptTemplateCard,
  CreateTemplateModal,
  ViewTemplateModal,
  EditTemplateModal,
  DuplicateTemplateModal,
  TemplateExecutionModal,
  ExecutionReportView,
} from "../components/templates";
import { ExtractionMonitor } from "../components/templates/ExtractionMonitor";
import { useNotification } from "../contexts/NotificationContext";

const PromptTemplates: React.FC = () => {
  const { showNotification } = useNotification();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states - simplified to just essential ones
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showExecutionReport, setShowExecutionReport] = useState(false);

  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Track templates with ongoing extractions
  const [processingTemplates, setProcessingTemplates] = useState<Set<string>>(new Set());

  // Find templates that are currently processing
  useEffect(() => {
    const processing = new Set<string>();
    templates.forEach(template => {
      if (template.referenceImage?.extractedFeatures?.status === 'processing') {
        processing.add(template._id);
      }
    });
    setProcessingTemplates(processing);
  }, [templates]);

  // Handle real-time extraction status updates
  const handleExtractionStatusUpdate = (templateId: string, status: any) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(template => {
        if (template._id === templateId && template.referenceImage?.extractedFeatures) {
          return {
            ...template,
            referenceImage: {
              ...template.referenceImage,
              extractedFeatures: {
                ...template.referenceImage.extractedFeatures,
                status: status.status,
                extractedAt: status.extractedAt,
                extractedBy: status.extractedBy,
                usage: status.usage ? {
                  ...template.referenceImage.extractedFeatures.usage,
                  ...status.usage
                } : template.referenceImage.extractedFeatures.usage,
                errorMessage: status.errorMessage
              }
            }
          } as PromptTemplate;
        }
        return template;
      })
    );

    // Show notification when extraction completes
    if (status.status === 'completed') {
      showNotification(`Template extraction completed successfully!`, 'success');
      // Remove from processing set
      setProcessingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    } else if (status.status === 'failed') {
      showNotification(`Template extraction failed: ${status.errorMessage || 'Unknown error'}`, 'error');
      // Remove from processing set
      setProcessingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "general", label: "General" },
    { value: "coding", label: "Coding" },
    { value: "writing", label: "Writing" },
    { value: "analysis", label: "Analysis" },
    { value: "creative", label: "Creative" },
    { value: "business", label: "Business" },
    { value: "visual-compliance", label: "Visual Compliance" },
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
      console.error("Error loading templates:", error);
      setTemplates([]);
      showNotification(error.message || "Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const newTemplate = await PromptTemplateService.createTemplate(templateData);
      showNotification("Template created successfully!", "success");
      // Update state instead of reloading
      setTemplates(prev => [newTemplate, ...prev]);
    } catch (error: any) {
      console.error("Error creating template:", error);
      showNotification(error.message || "Failed to create template", "error");
      throw error;
    }
  };

  const handleEditTemplate = async (templateId: string, templateData: any) => {
    try {
      const updatedTemplate = await PromptTemplateService.updateTemplate(templateId, templateData);
      showNotification("Template updated successfully!", "success");
      // Update state instead of reloading
      setTemplates(prev => prev.map(t => t._id === templateId ? updatedTemplate : t));
    } catch (error: any) {
      console.error("Error updating template:", error);
      showNotification(error.message || "Failed to update template", "error");
      throw error;
    }
  };

  const handleDuplicateTemplate = async (templateData: any) => {
    if (!selectedTemplate) return;

    try {
      const duplicated = await PromptTemplateService.duplicateTemplate(
        selectedTemplate._id,
        templateData
      );
      showNotification(`Template duplicated: ${duplicated.name}`, "success");
      // Update state instead of reloading
      setTemplates(prev => [duplicated, ...prev]);
    } catch (error: any) {
      console.error("Error duplicating template:", error);
      showNotification(
        error.message || "Failed to duplicate template",
        "error",
      );
      throw error;
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

  const handleDuplicateClick = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setShowDuplicateModal(true);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await PromptTemplateService.deleteTemplate(selectedTemplate._id);
      showNotification("Template deleted successfully!", "success");
      // Update state instead of reloading
      setTemplates(prev => prev.filter(t => t._id !== selectedTemplate._id));
      setDeleteConfirmOpen(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      console.error("Error deleting template:", error);
      showNotification(error.message || "Failed to delete template", "error");
    }
  };

  const handleFavoriteTemplate = async (template: PromptTemplate) => {
    try {
      const updatedTemplate = { ...template, isFavorite: !template.isFavorite };
      setTemplates(
        templates.map((t) => (t._id === template._id ? updatedTemplate : t)),
      );

      showNotification(
        template.isFavorite ? "Removed from favorites" : "Added to favorites",
        "success",
      );
    } catch (error: any) {
      console.error("Error updating favorite:", error);
      showNotification(error.message || "Failed to update favorite", "error");
    }
  };

  const handleExecuteTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setShowExecutionModal(true);
  };

  const handleExecutionComplete = (result: any) => {
    setExecutionResult(result);
    setShowExecutionModal(false);
    setShowExecutionReport(true);
    // Update the template's execution stats in state
    if (selectedTemplate) {
      setTemplates(prev => prev.map(t => {
        if (t._id === selectedTemplate._id) {
          return {
            ...t,
            executionStats: {
              totalExecutions: (t.executionStats?.totalExecutions || 0) + 1,
              totalCostSavings: (t.executionStats?.totalCostSavings || 0) + (result[0]?.savingsAmount || 0),
              averageCost: result[0]?.actualCost || t.executionStats?.averageCost || 0,
              mostUsedModel: result[0]?.modelUsed || t.executionStats?.mostUsedModel || 'N/A',
              lastExecutedAt: new Date()
            }
          };
        }
        return t;
      }));
    }
  };

  // Filter templates - simplified logic
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.metadata.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    const matchesFavorites = !showFavoritesOnly || template.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Sort by most recent
  const sortedTemplates = [...filteredTemplates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (loading) {
    return <PromptTemplatesShimmer />;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Real-time extraction monitors for processing templates */}
      {Array.from(processingTemplates).map(templateId => (
        <ExtractionMonitor
          key={templateId}
          templateId={templateId}
          onStatusUpdate={handleExtractionStatusUpdate}
        />
      ))}

      {/* Header */}
      <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="mb-4 text-4xl font-bold font-display gradient-text-primary">
              Prompt Templates
            </h1>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Create, manage, and use reusable prompt templates
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/templates/analytics"
              className="flex gap-2 items-center px-6 py-3 font-semibold bg-gradient-to-br rounded-lg border transition-all border-success-500/30 from-success-500/10 to-success-600/10 text-success-600 dark:text-success-400 hover:from-success-500/20 hover:to-success-600/20 hover:shadow-lg"
            >
              <FiBarChart2 className="w-5 h-5" />
              Analytics
            </Link>
            <Link
              to="/templates/use"
              className="flex gap-2 items-center px-6 py-3 btn-secondary btn"
            >
              <FiPlay className="w-5 h-5" />
              Use Template
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex gap-2 items-center px-6 py-3 btn btn-primary"
            >
              <FiPlus className="w-5 h-5" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
              <FiBookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Total Templates
              </p>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {templates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
              <FiStar className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Favorites
              </p>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {templates.filter((t) => t.isFavorite).length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
              <FiTrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Most Used
              </p>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {templates.reduce(
                  (max, t) => Math.max(max, t.usage?.count || 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
              <FiTag className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Categories
              </p>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {new Set(templates.map((t) => t.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-600 dark:text-secondary-300" />
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 text-lg input"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-lg select"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`btn flex gap-2 items-center px-6 py-3 rounded-xl font-semibold transition-all ${showFavoritesOnly
              ? "bg-gradient-to-r border-2 text-accent-600 dark:text-accent-400 from-accent-500/20 to-warning-500/20 border-accent-200/50 dark:border-accent-600/50"
              : "border-2 text-secondary-600 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border-secondary-200/30 dark:border-secondary-600/30"
              }`}
          >
            <FiStar className={`w-5 h-5 ${showFavoritesOnly ? "fill-current" : ""}`} />
            Favorites Only
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {sortedTemplates.length === 0 ? (
        <div className="py-16 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gradient-to-br rounded-full from-primary-500/20 to-success-500/20">
            <FiBookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="mb-3 text-2xl font-bold font-display text-secondary-900 dark:text-white">
            {searchQuery || selectedCategory !== "all" || showFavoritesOnly
              ? "No templates found"
              : "No templates yet"}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-lg text-secondary-600 dark:text-secondary-300">
            {searchQuery || selectedCategory !== "all" || showFavoritesOnly
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Get started by creating your first template to save time and improve consistency in your AI interactions."}
          </p>
          {!searchQuery && selectedCategory === "all" && !showFavoritesOnly && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-8 py-4 text-lg font-medium btn btn-primary"
            >
              <FiPlus className="mr-3 w-6 h-6" />
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedTemplates.map((template) => (
            <PromptTemplateCard
              key={template._id}
              template={template}
              onView={handleViewTemplate}
              onEdit={handleEditTemplateModal}
              onDelete={(template) => {
                setSelectedTemplate(template);
                setDeleteConfirmOpen(true);
              }}
              onDuplicate={handleDuplicateClick}
              onFavorite={handleFavoriteTemplate}
              onExecute={handleExecuteTemplate}
            />
          ))}
        </div>
      )}

      {/* Modals - Simplified */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTemplate}
          onTemplateCreated={(newTemplate) => {
            setTemplates(prev => [newTemplate, ...prev]);
          }}
          existingTemplates={templates}
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
          title=""
          size="3xl"
        >
          <div className="flex flex-col h-full">
            {/* Header with Warning Icon */}
            <div className="flex justify-between items-center p-8 bg-gradient-to-r rounded-t-3xl border-b backdrop-blur-xl glass border-red-200/30 from-red-50/50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg animate-pulse">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600 font-display dark:text-red-400">
                    Delete Template
                  </h2>
                  <p className="text-sm font-body text-red-600/80 dark:text-red-400/80">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 space-y-6 bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
              {/* Warning Message */}
              <div className="p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-red-200/30 from-red-50/30 to-orange-50/30 dark:from-red-900/10 dark:to-orange-900/10">
                <p className="text-lg leading-relaxed font-body text-light-text-primary dark:text-dark-text-primary">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-red-600 font-display dark:text-red-400">
                    "{selectedTemplate.name}"
                  </span>
                  ?
                </p>
              </div>

              {/* Template Info Card */}
              <div className="p-5 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-4 items-start">
                  <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-secondary-500/20 to-secondary-600/20">
                    <FiBookOpen className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                      {selectedTemplate.name}
                    </h3>
                    {selectedTemplate.description && (
                      <p className="mb-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                        {selectedTemplate.description}
                      </p>
                    )}
                    <div className="flex gap-3 items-center text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      <span className="flex gap-1 items-center">
                        <FiTag className="w-3 h-3" />
                        {selectedTemplate.category}
                      </span>
                      <span className="flex gap-1 items-center">
                        <FiTrendingUp className="w-3 h-3" />
                        {selectedTemplate.usage?.count || 0} uses
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consequences List */}
              <div className="p-5 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-red-200/30 from-red-50/20 to-orange-50/20 dark:from-red-900/10 dark:to-orange-900/10">
                <h4 className="flex gap-2 items-center mb-3 font-semibold text-red-600 font-display dark:text-red-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  What will be deleted:
                </h4>
                <ul className="space-y-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  <li className="flex gap-2 items-start">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Template content and configuration</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>All variables and metadata</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Usage history and statistics</span>
                  </li>
                  {selectedTemplate.referenceImage && (
                    <li className="flex gap-2 items-start">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Reference image and extracted features</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 rounded-b-3xl border-t backdrop-blur-xl glass border-red-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setSelectedTemplate(null);
                  }}
                  className="inline-flex gap-2 items-center px-6 py-3 font-semibold transition-all duration-200 btn btn-secondary hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTemplate}
                  className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl border shadow-lg transition-all duration-200 btn hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105 border-red-200/50 dark:border-red-700/50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Execution Modal */}
      {showExecutionModal && selectedTemplate && (
        <TemplateExecutionModal
          template={selectedTemplate}
          onClose={() => {
            setShowExecutionModal(false);
            setSelectedTemplate(null);
          }}
          onExecutionComplete={handleExecutionComplete}
        />
      )}

      {/* Execution Report */}
      {showExecutionReport && selectedTemplate && executionResult && (
        <ExecutionReportView
          template={selectedTemplate}
          result={executionResult}
          onClose={() => {
            setShowExecutionReport(false);
            setExecutionResult(null);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default PromptTemplates;
