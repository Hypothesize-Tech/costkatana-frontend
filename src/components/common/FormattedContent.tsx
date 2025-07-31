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
      <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
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
            <div key={index} className="my-3">
              <div className="bg-gray-800 text-gray-100 rounded-t-md px-3 py-1 text-xs font-medium">
                {language || "code"}
              </div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-b-md overflow-x-auto text-sm">
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
                    className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono"
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
          <span key={index} className="whitespace-pre-wrap leading-relaxed">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div
      className={`bg-gray-50 rounded-md border p-3 ${maxHeight} overflow-y-auto ${className}`}
    >
      <div className="text-sm text-gray-700 leading-relaxed">
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
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    red: "bg-red-50 border-red-200 text-red-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
  };

  const progressColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-1">
          {typeof value === "number" ? value.toFixed(1) : value}
        </div>
        <div className="text-sm font-medium mb-2">{title}</div>
        {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
        {showProgress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progressColors[color]}`}
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
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide">
          {priority} Priority
        </span>
        {targetGroup && (
          <span className="text-xs opacity-75">{targetGroup}</span>
        )}
      </div>
      <p className="text-sm leading-relaxed">
        {renderFormattedContent(recommendation)}
      </p>
    </div>
  );
};
