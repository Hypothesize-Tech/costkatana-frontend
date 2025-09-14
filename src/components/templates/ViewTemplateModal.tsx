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
        <div className="glass flex justify-between items-start p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-xl">
          <div className="flex-1 min-w-0">
            <div className="flex gap-3 items-center mb-2">
              <h2 className="text-3xl font-display font-bold gradient-text-primary truncate">
                {template.name}
              </h2>
              <span className="badge-primary">
                {template.category}
              </span>
              {template.isFavorite && (
                <FiStar className="w-5 h-5 text-warning-500 fill-current glow-warning" />
              )}
            </div>

            {template.description && (
              <p className="mb-4 font-body text-light-text-secondary dark:text-dark-text-secondary">
                {template.description}
              </p>
            )}

            <div className="flex gap-6 items-center text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              <div className="flex gap-2 items-center">
                {getVisibilityIcon(template.sharing.visibility)}
                <span className="capitalize">
                  {template.sharing.visibility}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <FiClock className="w-4 h-4" />
                <span>Updated {formatDate(template.updatedAt)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <FiTrendingUp className="w-4 h-4" />
                <span>{template.usage.count} uses</span>
              </div>
              {template.usage.averageRating && (
                <div className="flex gap-2 items-center">
                  <FiStar className="w-4 h-4" />
                  <span>{template.usage.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center ml-4">
            <button
              onClick={() => onFavorite(template)}
              className={`btn-icon-secondary ${template.isFavorite
                ? "text-warning-500 bg-warning-100/20 hover:bg-warning-100/30 glow-warning"
                : "hover:text-warning-500"
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
              className="btn-icon-secondary"
              title="Duplicate template"
            >
              <FiCopy className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(template)}
              className="btn-icon-secondary"
              title="Edit template"
            >
              <FiEdit3 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="btn-icon-secondary"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass flex border-b border-primary-200/30 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-display font-medium transition-all ${activeTab === tab.id
                ? "gradient-text-primary border-b-2 border-primary-500 bg-primary-50/20 glow-primary"
                : "text-light-text-secondary dark:text-dark-text-secondary hover:gradient-text-accent"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
          {activeTab === "content" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-semibold gradient-text-primary">
                  Template Content
                </h3>
                <button
                  onClick={handleCopyContent}
                  className={`btn-secondary inline-flex items-center gap-2 ${copied
                    ? "text-success-600 bg-success-50/20 glow-success"
                    : ""
                    }`}
                >
                  <FiCopy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <pre className="glass overflow-x-auto p-4 text-sm font-mono text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                  {template.content}
                </pre>
              </div>

              {template.metadata.tags && template.metadata.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-display font-medium gradient-text-secondary">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="badge-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {template.metadata.estimatedTokens && (
                <div className="glass p-4 mt-6 rounded-lg border border-info-200/30 shadow-lg backdrop-blur-xl">
                  <div className="flex gap-2 items-center gradient-text-info">
                    <FiCode className="w-4 h-4" />
                    <span className="text-sm font-display font-medium">
                      Estimated Tokens: {template.metadata.estimatedTokens}
                    </span>
                  </div>
                  {template.metadata.estimatedCost && (
                    <div className="flex gap-2 items-center mt-2 gradient-text-success">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="text-sm font-body">
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
              <h3 className="mb-6 text-xl font-display font-semibold gradient-text-primary">
                Template Variables
              </h3>
              {template.variables && template.variables.length > 0 ? (
                <div className="space-y-4">
                  {template.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="glass p-4 rounded-lg border border-secondary-200/30 shadow-lg backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-display font-medium gradient-text-secondary">
                          {variable.name}
                        </h4>
                        <span className="badge-info">
                          {variable.type}
                        </span>
                      </div>
                      {variable.description && (
                        <p className="mb-3 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          {variable.description}
                        </p>
                      )}
                      {variable.defaultValue && (
                        <div className="text-sm mb-2">
                          <span className="font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                            Default:{" "}
                          </span>
                          <code className="bg-gradient-accent text-white px-2 py-1 rounded font-mono glow-accent">
                            {variable.defaultValue}
                          </code>
                        </div>
                      )}
                      {variable.required && (
                        <span className="badge-danger">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass py-8 text-center rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                  <FiTag className="mx-auto mb-4 w-12 h-12 text-accent-400 animate-pulse" />
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                    This template has no variables
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "usage" && (
            <div className="p-6">
              <h3 className="mb-6 text-xl font-display font-semibold gradient-text-primary">
                Usage Statistics
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="glass p-4 rounded-lg border border-info-200/30 shadow-lg backdrop-blur-xl">
                  <div className="flex gap-2 items-center gradient-text-info">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm font-display font-medium">Total Uses</span>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold gradient-text-info">
                    {template.usage.count}
                  </p>
                </div>

                {template.usage.totalTokensSaved && (
                  <div className="glass p-4 rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex gap-2 items-center gradient-text-success">
                      <FiCode className="w-5 h-5" />
                      <span className="text-sm font-display font-medium">Tokens Saved</span>
                    </div>
                    <p className="mt-2 text-3xl font-display font-bold gradient-text-success">
                      {template.usage.totalTokensSaved.toLocaleString()}
                    </p>
                  </div>
                )}

                {template.usage.totalCostSaved && (
                  <div className="glass p-4 rounded-lg border border-purple-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex gap-2 items-center gradient-text-purple">
                      <FiDollarSign className="w-5 h-5" />
                      <span className="text-sm font-display font-medium">Cost Saved</span>
                    </div>
                    <p className="mt-2 text-3xl font-display font-bold gradient-text-purple">
                      ${template.usage.totalCostSaved.toFixed(2)}
                    </p>
                  </div>
                )}

                {template.usage.averageRating && (
                  <div className="glass p-4 rounded-lg border border-warning-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex gap-2 items-center gradient-text-warning">
                      <FiStar className="w-5 h-5" />
                      <span className="text-sm font-display font-medium">
                        Average Rating
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-display font-bold gradient-text-warning">
                      {template.usage.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                )}
              </div>

              {template.usage.lastUsed && (
                <div className="glass p-4 mt-6 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                  <div className="flex gap-2 items-center gradient-text-accent">
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm font-body">
                      Last used: {formatDate(template.usage.lastUsed)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="p-6">
              <h3 className="mb-6 text-xl font-display font-semibold gradient-text-primary">
                Version History
              </h3>
              <div className="space-y-4">
                <div className="glass p-4 rounded-lg border border-info-200/30 shadow-lg backdrop-blur-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="font-display font-medium gradient-text-info">
                          Version {template.version}
                        </span>
                        <span className="badge-primary">
                          Current
                        </span>
                      </div>
                      <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Updated {formatDate(template.updatedAt)}
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      View Changes
                    </button>
                  </div>
                </div>

                {/* Placeholder for older versions */}
                <div className="glass py-8 text-center rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                  <FiGitBranch className="mx-auto mb-4 w-12 h-12 text-accent-400 animate-pulse" />
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
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
