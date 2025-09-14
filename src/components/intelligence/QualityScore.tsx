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
    if (score >= 90) return "gradient-text-success";
    if (score >= 75) return "gradient-text-warning";
    return "gradient-text-danger";
  };

  const getRecommendationIcon = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
            <FiCheckCircle className="text-white" size={16} />
          </div>
        );
      case "review":
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center glow-warning">
            <FiAlertCircle className="text-white" size={16} />
          </div>
        );
      case "reject":
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center glow-danger">
            <FiXCircle className="text-white" size={16} />
          </div>
        );
      default:
        return null;
    }
  };

  const getRecommendationText = () => {
    switch (qualityData.recommendation) {
      case "accept":
        return "✅ Quality maintained - Safe to use";
      case "review":
        return "⚠️ Minor quality impact - Review recommended";
      case "reject":
        return "❌ Significant quality loss - Not recommended";
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</span>
        <span className={`font-display font-semibold ${value >= 90 ? 'gradient-text-success'
          : value >= 75 ? 'gradient-text-warning'
            : 'gradient-text-danger'
          }`}>{value}%</span>
      </div>
      <div className="w-full h-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${value >= 90
            ? "bg-gradient-success glow-success"
            : value >= 75
              ? "bg-gradient-warning glow-warning"
              : "bg-gradient-danger glow-danger"
            }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="card card-gradient p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Main Score Display */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/30 flex items-center justify-center mb-2">
              <div
                className={`text-3xl font-display font-bold ${getScoreColor(qualityData.optimizedScore)}`}
              >
                {qualityData.optimizedScore}
              </div>
            </div>
            <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary">Quality Score</div>
          </div>

          {qualityData.originalScore && qualityData.qualityRetention && (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white">→</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-50/50 to-success-100/50 border border-success-200/30 flex items-center justify-center mb-2">
                  <div
                    className={`text-2xl font-display font-bold ${getScoreColor(qualityData.qualityRetention)}`}
                  >
                    {qualityData.qualityRetention.toFixed(1)}%
                  </div>
                </div>
                <div className="font-body text-xs text-light-text-secondary dark:text-dark-text-secondary">Retained</div>
              </div>
            </>
          )}
        </div>

        <div className="text-right">
          <div className="glass p-4 rounded-xl border border-success-200/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
                <FiDollarSign className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-bold gradient-text-success">
                ${qualityData.costSavings.amount.toFixed(2)}
              </span>
            </div>
            <div className="font-body text-xs text-success-600 dark:text-success-400">
              {qualityData.costSavings.percentage}% saved
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {qualityData.recommendation && (
        <div className={`glass p-4 rounded-xl border flex items-center gap-3 ${qualityData.recommendation === 'accept' ? 'border-success-200/30 bg-gradient-success/10'
          : qualityData.recommendation === 'review' ? 'border-warning-200/30 bg-gradient-warning/10'
            : 'border-danger-200/30 bg-gradient-danger/10'
          }`}>
          {getRecommendationIcon()}
          <span className={`font-display font-semibold ${qualityData.recommendation === 'accept' ? 'gradient-text-success'
            : qualityData.recommendation === 'review' ? 'gradient-text-warning'
              : 'gradient-text-danger'
            }`}>{getRecommendationText()}</span>
        </div>
      )}

      {/* Detailed Criteria */}
      {showDetails && qualityData.criteria && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
              <FiBarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold gradient-text">Quality Breakdown</span>
          </div>
          <div className="glass p-4 rounded-xl border border-primary-200/30 space-y-4">
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
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 text-sm font-medium">
                Confidence: {(qualityData.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* User Feedback */}
      {showFeedback && !feedbackGiven && (
        <div className="glass p-6 rounded-xl border border-primary-200/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center glow-accent">
              <span className="text-white text-sm">💬</span>
            </div>
            <span className="font-display font-semibold gradient-text">
              Was this optimization acceptable?
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setUserRating(rating)}
                className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-110 ${userRating >= rating
                  ? "bg-gradient-warning text-white glow-warning"
                  : "glass border border-primary-200/30 text-light-text-tertiary dark:text-dark-text-tertiary hover:border-warning-200/50"
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
            className="input w-full resize-none"
            rows={3}
          />

          <div className="flex gap-3">
            <button
              onClick={() => handleFeedback(true)}
              className="btn-success flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
            >
              <FiThumbsUp size={16} />
              <span>Acceptable</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="btn-danger flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
            >
              <FiThumbsDown size={16} />
              <span>Not Acceptable</span>
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="glass p-4 rounded-xl border border-success-200/30 bg-gradient-success/10 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center glow-success">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="font-display font-semibold gradient-text-success">
              Thank you for your feedback!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
