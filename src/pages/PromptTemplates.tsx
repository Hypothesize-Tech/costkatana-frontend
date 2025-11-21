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
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Modal } from "../components/common/Modal";
import {
  PromptTemplateCard,
  CreateTemplateModal,
  ViewTemplateModal,
  EditTemplateModal,
  DuplicateTemplateModal,
} from "../components/templates";
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

  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
      await PromptTemplateService.createTemplate(templateData);
      showNotification("Template created successfully!", "success");
      loadTemplates();
    } catch (error: any) {
      console.error("Error creating template:", error);
      showNotification(error.message || "Failed to create template", "error");
      throw error;
    }
  };

  const handleEditTemplate = async (templateId: string, templateData: any) => {
    try {
      await PromptTemplateService.updateTemplate(templateId, templateData);
      showNotification("Template updated successfully!", "success");
      loadTemplates();
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
      loadTemplates();
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
      loadTemplates();
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
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
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
              className="flex gap-2 items-center px-6 py-3 border border-success-500/30 bg-gradient-to-br from-success-500/10 to-success-600/10 text-success-600 dark:text-success-400 rounded-lg font-semibold hover:from-success-500/20 hover:to-success-600/20 hover:shadow-lg transition-all"
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
          title="Delete Template"
        >
          <div className="p-6">
            <p className="mb-4 text-secondary-600 dark:text-secondary-300">
              Are you sure you want to delete "{selectedTemplate.name}"? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSelectedTemplate(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="btn bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PromptTemplates;
