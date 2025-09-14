import React, { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  trainingService,
  ScoreRequestData,
} from "../../services/training.service";

interface RequestScoringProps {
  requestId: string;
  currentScore?: number;
  currentNotes?: string;
  currentTags?: string[];
  onScoreSubmitted?: (score: number) => void;
  size?: "sm" | "md" | "lg";
  showNotes?: boolean;
  showTags?: boolean;
}

const TRAINING_TAGS = [
  "concise",
  "accurate",
  "efficient",
  "creative",
  "helpful",
  "clear",
  "complete",
];

export const RequestScoring: React.FC<RequestScoringProps> = ({
  requestId,
  currentScore = 0,
  currentNotes = "",
  currentTags = [],
  onScoreSubmitted,
  size = "md",
  showNotes = true,
  showTags = true,
}) => {
  const [score, setScore] = useState(currentScore);
  const [notes, setNotes] = useState(currentNotes);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(currentScore > 0);

  const handleScoreClick = (newScore: number) => {
    setScore(newScore);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (score === 0) return;

    setIsSubmitting(true);
    try {
      const scoreData: ScoreRequestData = {
        requestId,
        score,
        notes: notes.trim() || undefined,
        trainingTags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      await trainingService.scoring.scoreRequest(scoreData);
      onScoreSubmitted?.(score);
    } catch (error) {
      console.error("Failed to submit score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeClasses = {
    sm: { star: "h-4 w-4", container: "space-y-2", text: "text-xs" },
    md: { star: "h-5 w-5", container: "space-y-3", text: "text-sm" },
    lg: { star: "h-6 w-6", container: "space-y-4", text: "text-base" },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`glass rounded-xl p-4 border border-warning-200/30 shadow-lg backdrop-blur-xl ${classes.container}`}>
      {/* Star Rating */}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleScoreClick(star)}
            className={`transition-all hover:scale-110 ${star <= score
                ? "text-warning-400 hover:text-warning-500 glow-warning"
                : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-warning-300"
              }`}
            disabled={isSubmitting}
          >
            {star <= score ? (
              <StarIcon className={classes.star} />
            ) : (
              <StarOutlineIcon className={classes.star} />
            )}
          </button>
        ))}
        {score > 0 && (
          <span className={`ml-3 font-display font-bold gradient-text-warning ${classes.text}`}>
            {score}/5
            {score >= 4 && (
              <span className="ml-2 badge-success text-xs">
                Training Candidate
              </span>
            )}
          </span>
        )}
      </div>

      {/* Expanded Options */}
      {isExpanded && score > 0 && (
        <div className={`border-t border-warning-200/30 pt-4 ${classes.container}`}>
          {/* Training Tags */}
          {showTags && (
            <div>
              <label
                className={`form-label ${classes.text}`}
              >
                Quality Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAINING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${selectedTags.includes(tag)
                        ? "badge-primary glow-primary"
                        : "badge-secondary hover:badge-primary"
                      }`}
                    disabled={isSubmitting}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {showNotes && (
            <div>
              <label
                className={`block font-medium text-gray-700 mb-2 ${classes.text}`}
              >
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why did you give this score? What makes this response good/bad for training?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className={`text-right text-gray-500 mt-1 ${classes.text}`}>
                {notes.length}/500
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || score === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Score"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
