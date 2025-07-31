import React, { useState } from "react";
import {
  FiX,
  FiStar,
  FiCopy,
  FiEdit3,
  FiUsers,
  FiTag,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiCode,
  FiEye,
  FiGitBranch,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { PromptTemplate } from "../../types/promptTemplate.types";

interface ViewTemplateModalProps {
  template: PromptTemplate;
  onClose: () => void;
  onEdit: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
  onFavorite: (template: PromptTemplate) => void;
}

export const ViewTemplateModal: React.FC<ViewTemplateModalProps> = ({
  template,
  onClose,
  onEdit,
  onDuplicate,
  onFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<
    "content" | "variables" | "usage" | "versions"
  >("content");
  const [copied, setCopied] = useState(false);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      coding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      writing:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      analysis:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      creative: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      business:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      custom:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <FiUsers className="w-4 h-4" />;
      case "project":
        return <FiTag className="w-4 h-4" />;
      case "organization":
        return <FiUsers className="w-4 h-4" />;
      default:
        return <FiEye className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { id: "content", label: "Content", icon: FiCode },
    { id: "variables", label: "Variables", icon: FiTag },
    { id: "usage", label: "Usage Stats", icon: FiTrendingUp },
    { id: "versions", label: "Versions", icon: FiGitBranch },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex gap-3 items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900 truncate dark:text-white">
                {template.name}
              </h2>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}
              >
                {template.category}
              </span>
              {template.isFavorite && (
                <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
              )}
            </div>

            {template.description && (
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            )}

            <div className="flex gap-6 items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex gap-1 items-center">
                {getVisibilityIcon(template.sharing.visibility)}
                <span className="capitalize">
                  {template.sharing.visibility}
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <FiClock className="w-4 h-4" />
                <span>Updated {formatDate(template.updatedAt)}</span>
              </div>
              <div className="flex gap-1 items-center">
                <FiTrendingUp className="w-4 h-4" />
                <span>{template.usage.count} uses</span>
              </div>
              {template.usage.averageRating && (
                <div className="flex gap-1 items-center">
                  <FiStar className="w-4 h-4" />
                  <span>{template.usage.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center ml-4">
            <button
              onClick={() => onFavorite(template)}
              className={`p-2 rounded-lg transition-colors ${
                template.isFavorite
                  ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              title={
                template.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <FiStar
                className={`w-5 h-5 ${template.isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              onClick={() => onDuplicate(template)}
              className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Duplicate template"
            >
              <FiCopy className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(template)}
              className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Edit template"
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
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "content" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Template Content
                </h3>
                <button
                  onClick={handleCopyContent}
                  className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                    copied
                      ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <FiCopy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <pre className="overflow-x-auto p-4 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-100">
                  {template.content}
                </pre>
              </div>

              {template.metadata.tags && template.metadata.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {template.metadata.estimatedTokens && (
                <div className="p-4 mt-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <div className="flex gap-2 items-center text-blue-800 dark:text-blue-200">
                    <FiCode className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Estimated Tokens: {template.metadata.estimatedTokens}
                    </span>
                  </div>
                  {template.metadata.estimatedCost && (
                    <div className="flex gap-2 items-center mt-1 text-blue-800 dark:text-blue-200">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="text-sm">
                        Estimated Cost: $
                        {template.metadata.estimatedCost.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "variables" && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Template Variables
              </h3>
              {template.variables && template.variables.length > 0 ? (
                <div className="space-y-4">
                  {template.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {variable.name}
                        </h4>
                        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400">
                          {variable.type}
                        </span>
                      </div>
                      {variable.description && (
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          {variable.description}
                        </p>
                      )}
                      {variable.defaultValue && (
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Default:{" "}
                          </span>
                          <code className="px-2 py-1 text-gray-800 bg-gray-100 rounded dark:bg-gray-800 dark:text-gray-200">
                            {variable.defaultValue}
                          </code>
                        </div>
                      )}
                      {variable.required && (
                        <span className="inline-block px-2 py-1 mt-2 text-xs text-red-800 bg-red-100 rounded dark:bg-red-900/20 dark:text-red-200">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FiTag className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    This template has no variables
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "usage" && (
            <div className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Usage Statistics
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <div className="flex gap-2 items-center text-blue-800 dark:text-blue-200">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Uses</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {template.usage.count}
                  </p>
                </div>

                {template.usage.totalTokensSaved && (
                  <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex gap-2 items-center text-green-800 dark:text-green-200">
                      <FiCode className="w-5 h-5" />
                      <span className="text-sm font-medium">Tokens Saved</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
                      {template.usage.totalTokensSaved.toLocaleString()}
                    </p>
                  </div>
                )}

                {template.usage.totalCostSaved && (
                  <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <div className="flex gap-2 items-center text-purple-800 dark:text-purple-200">
                      <FiDollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Cost Saved</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ${template.usage.totalCostSaved.toFixed(2)}
                    </p>
                  </div>
                )}

                {template.usage.averageRating && (
                  <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                    <div className="flex gap-2 items-center text-yellow-800 dark:text-yellow-200">
                      <FiStar className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Average Rating
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {template.usage.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                )}
              </div>

              {template.usage.lastUsed && (
                <div className="p-4 mt-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 items-center text-gray-600 dark:text-gray-400">
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm">
                      Last used: {formatDate(template.usage.lastUsed)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Version History
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-blue-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Version {template.version}
                        </span>
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded dark:bg-blue-800 dark:text-blue-200">
                          Current
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Updated {formatDate(template.updatedAt)}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-sm text-blue-600 rounded transition-colors dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800">
                      View Changes
                    </button>
                  </div>
                </div>

                {/* Placeholder for older versions */}
                <div className="py-8 text-center">
                  <FiGitBranch className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No previous versions available
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
