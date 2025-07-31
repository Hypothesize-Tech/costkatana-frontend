import React, { useState } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiBarChart2,
  FiDollarSign,
} from "react-icons/fi";
import { intelligenceService } from "../../services/intelligence.service";

export interface QualityData {
  originalScore?: number;
  optimizedScore: number;
  qualityRetention?: number;
  recommendation?: "accept" | "review" | "reject";
  costSavings: {
    amount: number;
    percentage: number;
  };
  criteria?: {
    accuracy: number;
    relevance: number;
    completeness: number;
    coherence: number;
    factuality: number;
  };
  confidence?: number;
  scoreId?: string;
}

interface QualityScoreProps {
  qualityData: QualityData;
  showDetails?: boolean;
  showFeedback?: boolean;
  onFeedback?: (feedback: {
    isAcceptable: boolean;
    rating?: number;
    comment?: string;
  }) => void;
}

export const QualityScore: React.FC<QualityScoreProps> = ({
  qualityData,
  showDetails = true,
  showFeedback = true,
  onFeedback,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [userRating, setUserRating] = useState<number>(0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationIcon = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return <FiCheckCircle className="text-green-600" size={20} />;
      case "review":
        return <FiAlertCircle className="text-yellow-600" size={20} />;
      case "reject":
        return <FiXCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getRecommendationText = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return "Quality maintained - Safe to use";
      case "review":
        return "Minor quality impact - Review recommended";
      case "reject":
        return "Significant quality loss - Not recommended";
      default:
        return "";
    }
  };

  const handleFeedback = async (isAcceptable: boolean) => {
    if (qualityData.scoreId) {
      await intelligenceService.updateQualityFeedback(qualityData.scoreId, {
        isAcceptable,
        rating: userRating || undefined,
        comment: userComment || undefined,
      });
    }

    if (onFeedback) {
      onFeedback({
        isAcceptable,
        rating: userRating || undefined,
        comment: userComment || undefined,
      });
    }

    setFeedbackGiven(true);
  };

  const renderCriteriaBar = (label: string, value: number) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            value >= 90
              ? "bg-green-500"
              : value >= 75
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg border border-gray-200">
      {/* Main Score Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getScoreColor(qualityData.optimizedScore)}`}
            >
              {qualityData.optimizedScore}
            </div>
            <div className="text-xs text-gray-500">Quality Score</div>
          </div>

          {qualityData.originalScore && qualityData.qualityRetention && (
            <>
              <div className="text-gray-400">→</div>
              <div className="text-center">
                <div
                  className={`text-2xl font-semibold ${getScoreColor(qualityData.qualityRetention)}`}
                >
                  {qualityData.qualityRetention.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Retained</div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600">
              <FiDollarSign size={16} />
              <span className="font-semibold">
                ${qualityData.costSavings.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {qualityData.costSavings.percentage}% saved
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {qualityData.recommendation && (
        <div className="flex items-center p-3 space-x-2 bg-gray-50 rounded-lg">
          {getRecommendationIcon()}
          <span className="text-sm font-medium">{getRecommendationText()}</span>
        </div>
      )}

      {/* Detailed Criteria */}
      {showDetails && qualityData.criteria && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <FiBarChart2 size={16} />
            <span>Quality Breakdown</span>
          </div>
          <div className="space-y-2">
            {renderCriteriaBar("Accuracy", qualityData.criteria.accuracy)}
            {renderCriteriaBar("Relevance", qualityData.criteria.relevance)}
            {renderCriteriaBar(
              "Completeness",
              qualityData.criteria.completeness,
            )}
            {renderCriteriaBar("Coherence", qualityData.criteria.coherence)}
            {renderCriteriaBar("Factuality", qualityData.criteria.factuality)}
          </div>
          {qualityData.confidence && (
            <div className="text-xs text-right text-gray-500">
              Confidence: {(qualityData.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}

      {/* User Feedback */}
      {showFeedback && !feedbackGiven && (
        <div className="pt-4 space-y-3 border-t">
          <div className="text-sm font-medium text-gray-700">
            Was this optimization acceptable?
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setUserRating(rating)}
                className={`p-1 rounded ${
                  userRating >= rating
                    ? "text-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />

          <div className="flex space-x-2">
            <button
              onClick={() => handleFeedback(true)}
              className="flex flex-1 justify-center items-center px-3 py-2 space-x-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiThumbsUp size={16} />
              <span>Acceptable</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex flex-1 justify-center items-center px-3 py-2 space-x-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiThumbsDown size={16} />
              <span>Not Acceptable</span>
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="py-2 text-sm text-center text-green-600">
          Thank you for your feedback!
        </div>
      )}
    </div>
  );
};
