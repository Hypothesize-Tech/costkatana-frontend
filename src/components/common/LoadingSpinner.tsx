import React from "react";
import { CostKatanaLoader } from "./CostKatanaLoader";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
  showText?: boolean;
  text?: string;
  useLegacySpinner?: boolean; // For backward compatibility
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  className = "",
  showText = false,
  text = "Loading...",
  useLegacySpinner = false,
}) => {
  // Legacy spinner for backward compatibility
  if (useLegacySpinner) {
    const sizeClasses = {
      small: "h-4 w-4",
      medium: "h-8 w-8",
      large: "h-12 w-12",
    };

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg
            className="w-full h-full text-[#06ec9e] dark:text-emerald-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  // Use the new Cost Katana loader by default
  return (
    <CostKatanaLoader
      size={size}
      showText={showText}
      text={text}
      className={className}
    />
  );
};
