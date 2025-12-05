import React from "react";
import {
  FiStar,
  FiCopy,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiUsers,
  FiClock,
  FiTag,
  FiImage,
  FiDollarSign,
  FiCheckCircle,
  FiLoader,
  FiPlay,
} from "react-icons/fi";
import { PromptTemplate } from "../../types/promptTemplate.types";

interface PromptTemplateCardProps {
  template: PromptTemplate;
  onView: (template: PromptTemplate) => void;
  onEdit: (template: PromptTemplate) => void;
  onDelete: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
  onFavorite: (template: PromptTemplate) => void;
  onExecute?: (template: PromptTemplate) => void;
}

export const PromptTemplateCard: React.FC<PromptTemplateCardProps> = ({
  template,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  onExecute,
}) => {

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <FiUsers className="w-3 h-3" />;
      case "project":
        return <FiTag className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel sm:hover:scale-105 hover:shadow-2xl hover:border-primary-300/40 transition-all duration-300 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
              <h3 className="text-lg sm:text-xl font-display font-bold gradient-text-primary truncate flex-1 min-w-0">
                {template.name}
              </h3>
              {template.isFavorite && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiStar className="w-3 h-3 text-white fill-current" />
                </div>
              )}
              {getVisibilityIcon(template.sharing.visibility) && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-highlight/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-highlight-500">
                    {getVisibilityIcon(template.sharing.visibility)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-3 sm:mb-4">
              {template.description || "No description provided"}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap sm:ml-4 w-full sm:w-auto">
            <button
              onClick={() => onFavorite(template)}
              className={`btn-icon-sm ${template.isFavorite
                ? "bg-gradient-accent text-white shadow-lg"
                : "btn-icon-secondary"
                }`}
              title={
                template.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <FiStar
                className={`w-4 h-4 ${template.isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              onClick={() => onView(template)}
              className="btn-icon-sm btn-icon-highlight"
              title="View template"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(template)}
              className="btn-icon-sm btn-icon-primary"
              title="Duplicate template"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(template)}
              className="btn-icon-sm btn-icon-secondary"
              title="Edit template"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(template)}
              className="btn-icon-sm btn-icon-danger"
              title="Delete template"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-4 sm:mb-6">
          <span className="glass px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-semibold text-xs sm:text-sm">
            {template.category.charAt(0).toUpperCase() +
              template.category.slice(1)}
          </span>
        </div>

        {/* Content Preview */}
        <div className="mb-4 sm:mb-6">
          <p className="font-mono text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary line-clamp-3 glass p-3 sm:p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/20 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10 break-words overflow-hidden">
            {template.content}
          </p>
        </div>

        {/* Variables */}
        {template.variables.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <p className="font-display font-medium gradient-text-secondary text-xs sm:text-sm mb-2 sm:mb-3">
              Variables ({template.variables.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {template.variables.slice(0, 3).map((variable, index) => (
                <span
                  key={index}
                  className="glass px-2 sm:px-3 py-1 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold text-xs"
                >
                  {variable.name}
                </span>
              ))}
              {template.variables.length > 3 && (
                <span className="glass px-2 sm:px-3 py-1 rounded-full border border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-semibold text-xs">
                  +{template.variables.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {template.metadata.tags.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2">
              {template.metadata.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="glass px-2 sm:px-3 py-1 rounded-full border border-info-200/30 bg-gradient-info/20 text-info-700 dark:text-info-300 font-body font-medium text-xs"
                >
                  #{tag}
                </span>
              ))}
              {template.metadata.tags.length > 3 && (
                <span className="glass px-2 sm:px-3 py-1 rounded-full border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-body font-medium text-xs">
                  +{template.metadata.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reference Image Indicators */}
        {template.isVisualCompliance && template.referenceImage && (
          <div className="mb-3 sm:mb-4">
            <div className="glass p-2 sm:p-3 rounded-lg border border-info-200/30 bg-gradient-to-r from-info-50/50 to-success-50/30 dark:from-info-900/20 dark:to-success-900/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiImage className="w-3 h-3 sm:w-4 sm:h-4 text-info-600 dark:text-info-400 flex-shrink-0" />
                <span className="font-display font-semibold text-xs sm:text-sm text-info-800 dark:text-info-200 truncate">
                  Reference Image
                </span>
                {template.referenceImage.extractedFeatures?.status === 'completed' && (
                  <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success-600 dark:text-success-400 flex-shrink-0" />
                )}
                {template.referenceImage.extractedFeatures?.status === 'processing' && (
                  <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 text-info-600 dark:text-info-400 animate-spin flex-shrink-0" />
                )}
              </div>
              {template.referenceImage.extractedFeatures?.usage &&
                template.referenceImage.extractedFeatures.usage.checksPerformed > 0 && (
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-success-600 dark:text-success-400 flex-shrink-0" />
                    <span className="text-xs font-display font-bold text-success-700 dark:text-success-300 truncate">
                      Saved {template.referenceImage.extractedFeatures.usage.totalTokensSaved.toLocaleString()} tokens
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center border-t border-primary-200/30 pt-4 sm:pt-6">
          <div className="glass rounded-lg p-2 sm:p-3 border border-success-200/30 shadow-lg backdrop-blur-xl">
            <p className="font-display font-bold gradient-text-success text-base sm:text-lg">
              {template.usage.count}
            </p>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Uses</p>
          </div>
          <div className="glass rounded-lg p-2 sm:p-3 border border-accent-200/30 shadow-lg backdrop-blur-xl">
            <p className="font-display font-bold gradient-text-accent text-base sm:text-lg">
              {template.usage.averageRating
                ? template.usage.averageRating.toFixed(1)
                : "N/A"}
            </p>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Rating</p>
          </div>
          <div className="glass rounded-lg p-2 sm:p-3 border border-highlight-200/30 shadow-lg backdrop-blur-xl">
            <p className="font-display font-bold gradient-text-highlight text-base sm:text-lg">
              v{template.version}
            </p>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Version</p>
          </div>
        </div>

        {/* Execute Button - Hidden for Visual Compliance templates */}
        {onExecute && !template.isVisualCompliance && (
          <div className="mt-3 sm:mt-4">
            <button
              onClick={() => onExecute(template)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-primary text-white shadow-lg hover:shadow-xl 
                rounded-xl font-display font-bold text-sm sm:text-base hover:scale-105 active:scale-95 
                transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiPlay className="w-3 h-3 sm:w-4 sm:h-4" />
              Execute Template
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-primary-200/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-secondary/20 flex items-center justify-center flex-shrink-0">
              <FiClock className="w-2 h-2 text-secondary-500" />
            </div>
            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs truncate">
              Created {formatDate(template.createdAt)}
            </span>
          </div>
          {template.metadata.estimatedTokens && (
            <div className="glass px-2 sm:px-3 py-1 rounded-full border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 flex-shrink-0">
              <span className="font-display font-semibold text-success-700 dark:text-success-300 text-xs">
                ~{template.metadata.estimatedTokens} tokens
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
