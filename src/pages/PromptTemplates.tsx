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
    try {
      await PromptTemplateService.createTemplate(templateData);
      showNotification("Template duplicated successfully!", "success");
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

  const handleCopyTemplate = (template: PromptTemplate) => {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Prompt Templates
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create, manage, and use reusable prompt templates
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex gap-2 items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
          >
            <FiPlus className="w-5 h-5" />
            New Template
          </button>
          <Link
            to="/templates/use"
            className="flex gap-2 items-center px-6 py-3 text-green-600 bg-green-50 rounded-xl border-2 border-green-200 transition-all dark:bg-green-900/20 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700"
          >
            <FiPlay className="w-5 h-5" />
            Use Template
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
              <FiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Templates
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/30">
              <FiStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Favorites
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.filter((t) => t.isFavorite).length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
              <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Most Used
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.reduce(
                  (max, t) => Math.max(max, t.usage?.count || 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
              <FiTag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(templates.map((t) => t.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-3 pr-4 pl-12 w-full text-lg rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex gap-2 items-center px-6 py-3 rounded-xl transition-all ${showFavoritesOnly
            ? "text-yellow-600 bg-yellow-50 border-2 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
            : "text-gray-600 bg-gray-50 border-2 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            }`}
        >
          <FiStar className={`w-5 h-5 ${showFavoritesOnly ? "fill-current" : ""}`} />
          Favorites Only
        </button>
      </div>

      {/* Templates Grid */}
      {sortedTemplates.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gray-100 rounded-full dark:bg-gray-700">
            <FiBookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery || selectedCategory !== "all" || showFavoritesOnly
              ? "No templates found"
              : "No templates yet"}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
            {searchQuery || selectedCategory !== "all" || showFavoritesOnly
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Get started by creating your first template to save time and improve consistency in your AI interactions."}
          </p>
          {!searchQuery && selectedCategory === "all" && !showFavoritesOnly && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
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
              onCopy={handleCopyTemplate}
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
              Are you sure you want to delete "{selectedTemplate.name}"? This
              action cannot be undone.
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
    </div>
  );
};

export default PromptTemplates;
