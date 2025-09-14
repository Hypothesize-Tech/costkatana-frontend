import React from "react";
import { renderFormattedContent } from "@/utils/formatters";

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  className = "",
}) => {
  if (!content) return null;

  const formattedContent = renderFormattedContent(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <div className="whitespace-pre-wrap leading-relaxed font-body text-light-text-primary dark:text-dark-text-primary">
        {formattedContent}
      </div>
    </div>
  );
};

interface OptimizedPromptDisplayProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

export const OptimizedPromptDisplay: React.FC<OptimizedPromptDisplayProps> = ({
  content,
  className = "",
  maxHeight = "max-h-32",
}) => {
  if (!content) return null;

  // Function to clean and format markdown content more thoroughly
  const formatMarkdownContent = (text: string) => {
    // Remove raw markdown formatting characters more aggressively
    let cleanedText = text
      // Remove headers
      .replace(/^#{1,6}\s*/gm, "")
      // Remove bold formatting
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Remove italic formatting
      .replace(/\*(.*?)\*/g, "$1")
      // Remove inline code formatting
      .replace(/`([^`]+)`/g, "$1")
      // Remove list markers
      .replace(/^[-*+]\s+/gm, "• ")
      // Remove numbered list markers
      .replace(/^\d+\.\s+/gm, "")
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    // Handle code blocks more carefully
    cleanedText = cleanedText.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3);
      const lines = code.split("\n");
      const language = lines[0].trim();
      const codeContent = lines.slice(1).join("\n");
      return `\n[CODE_BLOCK:${language}]\n${codeContent}\n[/CODE_BLOCK]\n`;
    });

    return cleanedText;
  };

  // Function to detect and format code blocks
  const formatCodeBlocks = (text: string) => {
    // First clean the markdown
    const cleanedText = formatMarkdownContent(text);

    // Split by code blocks
    const parts = cleanedText.split(/(\[CODE_BLOCK:[\s\S]*?\[\/CODE_BLOCK\])/);

    return parts.map((part, index) => {
      if (part.startsWith("[CODE_BLOCK:")) {
        // Multi-line code block
        const match = part.match(
          /\[CODE_BLOCK:(.*?)\]([\s\S]*?)\[\/CODE_BLOCK\]/,
        );
        if (match) {
          const language = match[1].trim();
          const codeContent = match[2].trim();

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-primary-200/30">
              <div className="flex items-center justify-between px-4 py-2 glass border-b border-primary-200/30">
                <span className="font-display font-medium text-sm text-light-text-primary dark:text-dark-text-primary capitalize">
                  {language || "code"}
                </span>
              </div>
              <pre className="p-4 bg-dark-bg-primary text-dark-text-primary font-mono text-sm leading-relaxed overflow-x-auto">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }
      } else if (part.includes("`") && !part.startsWith("[CODE_BLOCK")) {
        // Inline code
        const inlineParts = part.split(/(`[^`]+`)/);
        return (
          <span key={index}>
            {inlineParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith("`") && inlinePart.endsWith("`")) {
                const code = inlinePart.slice(1, -1);
                return (
                  <code
                    key={inlineIndex}
                    className="bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded-lg text-sm font-mono border border-primary-200/30"
                  >
                    {code}
                  </code>
                );
              } else {
                return (
                  <span key={inlineIndex} className="whitespace-pre-wrap">
                    {inlinePart}
                  </span>
                );
              }
            })}
          </span>
        );
      } else {
        // Regular text with proper formatting
        return (
          <span key={index} className="whitespace-pre-wrap leading-relaxed font-body text-light-text-primary dark:text-dark-text-primary">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div
      className={`card p-4 ${maxHeight} overflow-y-auto ${className}`}
    >
      <div className="text-sm leading-relaxed">
        {formatCodeBlocks(content)}
      </div>
    </div>
  );
};

interface ComparisonCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "purple" | "orange";
  showProgress?: boolean;
  progressValue?: number;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  value,
  subtitle,
  color = "blue",
  showProgress = false,
  progressValue = 0,
}) => {
  const colorClasses = {
    blue: "bg-gradient-primary/10 border border-primary-200/30 text-primary-600 dark:text-primary-400",
    green: "bg-gradient-success/10 border border-success-200/30 text-success-600 dark:text-success-400",
    red: "bg-gradient-danger/10 border border-danger-200/30 text-danger-600 dark:text-danger-400",
    purple: "bg-gradient-accent/10 border border-accent-200/30 text-accent-600 dark:text-accent-400",
    orange: "bg-gradient-warning/10 border border-warning-200/30 text-warning-600 dark:text-warning-400",
  };

  const progressColors = {
    blue: "bg-gradient-primary",
    green: "bg-gradient-success",
    red: "bg-gradient-danger",
    purple: "bg-gradient-accent",
    orange: "bg-gradient-warning",
  };

  return (
    <div className={`p-6 rounded-xl glass backdrop-blur-xl shadow-lg animate-fade-in ${colorClasses[color]}`}>
      <div className="text-center">
        <div className="text-3xl font-display font-bold mb-2 gradient-text">
          {typeof value === "number" ? value.toFixed(1) : value}
        </div>
        <div className="text-sm font-display font-semibold mb-2">{title}</div>
        {subtitle && <div className="text-xs font-body opacity-75">{subtitle}</div>}
        {showProgress && (
          <div className="mt-3">
            <div className="w-full bg-primary-200/30 rounded-full h-2 shadow-inner">
              <div
                className={`h-2 rounded-full shadow-lg transition-all duration-500 ${progressColors[color]}`}
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RecommendationItemProps {
  recommendation: string;
  priority: "high" | "medium" | "low";
  targetGroup?: string;
}

export const RecommendationItem: React.FC<RecommendationItemProps> = ({
  recommendation,
  priority,
  targetGroup,
}) => {
  const priorityColors = {
    high: "bg-gradient-danger/10 text-danger-600 dark:text-danger-400 border border-danger-200/30",
    medium: "bg-gradient-warning/10 text-warning-600 dark:text-warning-400 border border-warning-200/30",
    low: "bg-gradient-primary/10 text-primary-600 dark:text-primary-400 border border-primary-200/30",
  };

  return (
    <div className={`p-4 rounded-xl glass backdrop-blur-xl shadow-lg animate-fade-in ${priorityColors[priority]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-display font-bold uppercase tracking-wider">
          {priority} Priority
        </span>
        {targetGroup && (
          <span className="text-xs font-body opacity-75">{targetGroup}</span>
        )}
      </div>
      <p className="text-sm font-body leading-relaxed">
        {renderFormattedContent(recommendation)}
      </p>
    </div>
  );
};
